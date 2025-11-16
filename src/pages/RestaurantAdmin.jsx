
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, QrCode, Package, DollarSign, ShoppingCart, Upload, Loader2, Download, FileSpreadsheet, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatsCard from "../components/work/StatsCard";
import AdminAuthGuard from "../components/AdminAuthGuard";

function RestaurantAdminContent() {
  const [menuDialog, setMenuDialog] = useState(false);
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [generatingTables, setGeneratingTables] = useState(false);
  const [tableCount, setTableCount] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: "", description: "", price: "", category: "main_course", image_url: "", 
    preparation_time: "", available: true
  });
  const [inventoryForm, setInventoryForm] = useState({
    item_name: "", quantity: "", unit: "pieces", min_quantity: "", category: "other"
  });
  const [settingsForm, setSettingsForm] = useState({
    open_hours: "",
    delivery_fee: "",
    min_order: "",
    avg_delivery_time: "",
    delivery_zones: []
  });
  const [newZone, setNewZone] = useState("");

  const queryClient = useQueryClient();

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => base44.entities.MenuItem.list(),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Inventory.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => base44.entities.Table.list(),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const myRestaurant = restaurants.find(r => r.owner_email === user?.email);

  const createMenuMutation = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create({...data, restaurant_id: myRestaurant?.id}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setMenuDialog(false);
      resetMenuForm();
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setMenuDialog(false);
      resetMenuForm();
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }) => base44.entities.MenuItem.update(id, { available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data) => base44.entities.Inventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setInventoryDialog(false);
      resetInventoryForm();
    },
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setSettingsDialog(false);
    },
  });

  const resetMenuForm = () => {
    setMenuForm({ name: "", description: "", price: "", category: "main_course", image_url: "", preparation_time: "", available: true });
    setEditingItem(null);
  };

  const resetInventoryForm = () => {
    setInventoryForm({ item_name: "", quantity: "", unit: "pieces", min_quantity: "", category: "other" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setMenuForm({ ...menuForm, image_url: file_url });
    setUploadingImage(false);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBulk(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            dishes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  category: { type: "string" },
                  preparation_time: { type: "number" },
                  image_url: { type: "string" }
                },
                required: ["name", "price"]
              }
            }
          }
        }
      });

      if (result.status === "success" && result.output?.dishes) {
        // Assign restaurant_id to each dish
        const dishesWithRestaurantId = result.output.dishes.map(dish => ({
          ...dish,
          restaurant_id: myRestaurant?.id // Ensure restaurant_id is added here
        }));

        await base44.entities.MenuItem.bulkCreate(dishesWithRestaurantId);
        queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        setBulkUploadDialog(false);
        alert(`Successfully imported ${result.output.dishes.length} dishes!`);
      } else {
        alert("Failed to extract dishes from file: " + (result.details || "Unknown error"));
      }
    } catch (error) {
      alert("Error uploading dishes: " + error.message);
    } finally {
      setUploadingBulk(false);
    }
  };

  const generateTables = async () => {
    setGeneratingTables(true);
    const baseUrl = window.location.origin;
    const tablesToCreate = [];
    
    for (let i = 1; i <= tableCount; i++) {
      const tableNumber = `T${i.toString().padStart(2, '0')}`;
      const menuUrl = `${baseUrl}/RestaurantMenu?table=${tableNumber}&restaurant_id=${myRestaurant?.id}`; // Added restaurant_id
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      
      tablesToCreate.push({
        table_number: tableNumber,
        capacity: 4,
        status: "available",
        qr_code_url: qrCodeUrl,
        location: `Section ${Math.ceil(i / 5)}`,
        restaurant_id: myRestaurant?.id // Assign to current restaurant
      });
    }
    
    await base44.entities.Table.bulkCreate(tablesToCreate);
    queryClient.invalidateQueries({ queryKey: ['tables'] });
    setGeneratingTables(false);
  };

  const downloadQRCode = (table) => {
    const link = document.createElement('a');
    link.href = table.qr_code_url;
    link.download = `${table.table_number}-QR.png`;
    link.click();
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      preparation_time: menuForm.preparation_time ? parseInt(menuForm.preparation_time) : undefined
    };

    if (editingItem) {
      updateMenuMutation.mutate({ id: editingItem.id, data });
    } else {
      createMenuMutation.mutate(data);
    }
  };

  const handleInventorySubmit = (e) => {
    e.preventDefault();
    createInventoryMutation.mutate({
      ...inventoryForm,
      quantity: parseFloat(inventoryForm.quantity),
      min_quantity: inventoryForm.min_quantity ? parseFloat(inventoryForm.min_quantity) : undefined,
      restaurant_id: myRestaurant?.id // Assign to current restaurant
    });
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    updateRestaurantMutation.mutate({
      id: myRestaurant.id,
      data: {
        open_hours: settingsForm.open_hours,
        delivery_fee: parseFloat(settingsForm.delivery_fee),
        min_order: parseFloat(settingsForm.min_order),
        avg_delivery_time: parseInt(settingsForm.avg_delivery_time),
        delivery_zones: settingsForm.delivery_zones
      }
    });
  };

  const addDeliveryZone = () => {
    if (newZone.trim()) {
      setSettingsForm({
        ...settingsForm,
        delivery_zones: [...(settingsForm.delivery_zones || []), newZone.trim()]
      });
      setNewZone("");
    }
  };

  const removeDeliveryZone = (zoneToRemove) => {
    setSettingsForm({
      ...settingsForm,
      delivery_zones: settingsForm.delivery_zones.filter(z => z !== zoneToRemove)
    });
  };

  const openSettings = () => {
    if (myRestaurant) {
      setSettingsForm({
        open_hours: myRestaurant.open_hours || "",
        delivery_fee: myRestaurant.delivery_fee?.toString() || "",
        min_order: myRestaurant.min_order?.toString() || "",
        avg_delivery_time: myRestaurant.avg_delivery_time?.toString() || "",
        delivery_zones: myRestaurant.delivery_zones || []
      });
      setSettingsDialog(true);
    }
  };

  const stats = {
    totalOrders: orders.filter(o => o.restaurant_id === myRestaurant?.id).length,
    todayRevenue: orders.filter(o => {
      const today = new Date().toDateString();
      return o.restaurant_id === myRestaurant?.id && new Date(o.created_date).toDateString() === today;
    }).reduce((sum, o) => sum + o.total_amount, 0),
    menuItems: menuItems.filter(m => m.restaurant_id === myRestaurant?.id).length,
    lowStock: inventory.filter(i => i.restaurant_id === myRestaurant?.id && i.quantity <= (i.min_quantity || 0)).length
  };

  const myMenuItems = menuItems.filter(m => m.restaurant_id === myRestaurant?.id);
  const myOrders = orders.filter(o => o.restaurant_id === myRestaurant?.id);
  const myInventory = inventory.filter(i => i.restaurant_id === myRestaurant?.id);
  const myTables = tables.filter(t => t.restaurant_id === myRestaurant?.id);


  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">🍴 Restaurant Admin</h1>
            <p className="text-slate-600">{myRestaurant?.name || "Manage menu, inventory, and orders"}</p>
          </div>
          <Button onClick={openSettings} variant="outline" disabled={!myRestaurant}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatsCard title="Today's Revenue" value={`$${stats.todayRevenue.toFixed(2)}`} icon={DollarSign} gradient="bg-gradient-to-br from-green-500 to-green-600" />
          <StatsCard title="Menu Items" value={stats.menuItems} icon={Package} gradient="bg-gradient-to-br from-purple-500 to-purple-600" />
          <StatsCard title="Low Stock" value={stats.lowStock} icon={Package} gradient="bg-gradient-to-br from-red-500 to-red-600" />
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="tables">Tables & QR</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Menu Management</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setBulkUploadDialog(true)} disabled={!myRestaurant}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Bulk Upload
                  </Button>
                  <Button onClick={() => { resetMenuForm(); setMenuDialog(true); }} disabled={!myRestaurant}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myMenuItems.map((item) => (
                    <Card key={item.id}>
                      {item.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <button
                            onClick={() => toggleAvailabilityMutation.mutate({ id: item.id, available: !item.available })}
                          >
                            <Badge className={item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                        <p className="text-xl font-bold text-orange-600 mb-3">${item.price}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingItem(item);
                            setMenuForm(item);
                            setMenuDialog(true);
                          }}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            if(confirm('Delete this item?')) deleteMenuMutation.mutate(item.id);
                          }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inventory Management</CardTitle>
                <Button onClick={() => setInventoryDialog(true)} disabled={!myRestaurant}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.item_name}</h3>
                        <p className="text-sm text-slate-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{item.quantity} {item.unit}</p>
                        {item.min_quantity && item.quantity <= item.min_quantity && (
                          <Badge className="bg-red-100 text-red-700">Low Stock</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Table QR Codes</CardTitle>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="number" 
                    value={tableCount} 
                    onChange={(e) => setTableCount(parseInt(e.target.value) || 0)}
                    className="w-20"
                    min="1"
                    max="100"
                  />
                  <Button onClick={generateTables} disabled={generatingTables || !myRestaurant}>
                    {generatingTables ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate Tables
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {myTables.length === 0 ? (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No tables generated yet</p>
                    <p className="text-sm text-slate-500">Set the number of tables and click Generate</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myTables.map((table) => (
                      <Card key={table.id} className="text-center">
                        <CardContent className="pt-6">
                          <h3 className="font-bold text-lg mb-2">{table.table_number}</h3>
                          <div className="bg-white p-2 rounded-lg mb-3">
                            <img src={table.qr_code_url} alt={`QR for ${table.table_number}`} className="w-full" />
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{table.location}</p>
                          <Button size="sm" onClick={() => downloadQRCode(table)} className="w-full">
                            <Download className="w-3 h-3 mr-2" />
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">{order.order_number}</p>
                          <p className="text-sm text-slate-600">{new Date(order.created_date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl">${order.total_amount.toFixed(2)}</p>
                          <Badge className="capitalize">{order.status?.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-semibold">Customer:</p>
                          <p>{order.customer_name}</p>
                          <p className="text-slate-600">{order.customer_phone}</p>
                          {order.customer_address && <p className="text-slate-600">{order.customer_address}</p>}
                        </div>
                        <div>
                          <p className="font-semibold">Order Type:</p>
                          <p className="capitalize">{order.order_type?.replace('_', ' ')}</p>
                          {order.driver_name && (
                            <>
                              <p className="font-semibold mt-2">Driver:</p>
                              <p>{order.driver_name} - {order.driver_phone}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-semibold text-sm mb-2">Items:</p>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.special_instructions && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-slate-600">Instructions: {order.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={bulkUploadDialog} onOpenChange={setBulkUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Upload Dishes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Supported Formats:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• CSV files with columns: name, description, price, category, preparation_time, image_url</li>
                  <li>• Excel files (.xlsx)</li>
                  <li>• PDF with structured data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>Upload File</Label>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleBulkUpload}
                  disabled={uploadingBulk}
                />
                {uploadingBulk && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing file...
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkUploadDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="space-y-2">
                  {menuForm.image_url && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                      <img src={menuForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    />
                    {uploadingImage && <Loader2 className="w-5 h-5 animate-spin" />}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={menuForm.name} onChange={(e) => setMenuForm({...menuForm, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={menuForm.description} onChange={(e) => setMenuForm({...menuForm, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input type="number" step="0.01" value={menuForm.price} onChange={(e) => setMenuForm({...menuForm, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={menuForm.category} onValueChange={(value) => setMenuForm({...menuForm, category: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="main_course">Main Course</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="sides">Sides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preparation Time (minutes)</Label>
                <Input type="number" value={menuForm.preparation_time} onChange={(e) => setMenuForm({...menuForm, preparation_time: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMenuDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={uploadingImage}>{editingItem ? "Update" : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={inventoryDialog} onOpenChange={setInventoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInventorySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input value={inventoryForm.item_name} onChange={(e) => setInventoryForm({...inventoryForm, item_name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input type="number" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({...inventoryForm, quantity: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={inventoryForm.unit} onValueChange={(value) => setInventoryForm({...inventoryForm, unit: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">Grams</SelectItem>
                      <SelectItem value="l">Liters</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                  <Label>Minimum Quantity</Label>
                  <Input type="number" value={inventoryForm.min_quantity} onChange={(e) => setInventoryForm({...inventoryForm, min_quantity: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={inventoryForm.category} onValueChange={(value) => setInventoryForm({...inventoryForm, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="dry_goods">Dry Goods</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInventoryDialog(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Restaurant Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Opening Hours</Label>
                <Input 
                  value={settingsForm.open_hours} 
                  onChange={(e) => setSettingsForm({...settingsForm, open_hours: e.target.value})}
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Fee ($)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={settingsForm.delivery_fee} 
                    onChange={(e) => setSettingsForm({...settingsForm, delivery_fee: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Order ($)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={settingsForm.min_order} 
                    onChange={(e) => setSettingsForm({...settingsForm, min_order: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Time (min)</Label>
                  <Input 
                    type="number"
                    value={settingsForm.avg_delivery_time} 
                    onChange={(e) => setSettingsForm({...settingsForm, avg_delivery_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Delivery Zones</Label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    value={newZone} 
                    onChange={(e) => setNewZone(e.target.value)}
                    placeholder="Add zone (e.g., Dakar, Pikine)"
                  />
                  <Button type="button" onClick={addDeliveryZone}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settingsForm.delivery_zones?.map((zone, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeDeliveryZone(zone)}>
                      {zone} ✕
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSettingsDialog(false)}>Cancel</Button>
                <Button type="submit">Save Settings</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function RestaurantAdmin() {
  return (
    <AdminAuthGuard>
      <RestaurantAdminContent />
    </AdminAuthGuard>
  );
}
