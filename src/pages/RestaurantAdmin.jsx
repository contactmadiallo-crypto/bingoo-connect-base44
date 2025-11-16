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
import { Plus, Pencil, Trash2, QrCode, Package, DollarSign, ShoppingCart, Upload, Loader2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatsCard from "../components/work/StatsCard";

export default function RestaurantAdmin() {
  const [menuDialog, setMenuDialog] = useState(false);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingTables, setGeneratingTables] = useState(false);
  const [tableCount, setTableCount] = useState(20);
  const [menuForm, setMenuForm] = useState({
    name: "", description: "", price: "", category: "main_course", image_url: "", 
    preparation_time: "", available: true
  });
  const [inventoryForm, setInventoryForm] = useState({
    item_name: "", quantity: "", unit: "pieces", min_quantity: "", category: "other"
  });

  const queryClient = useQueryClient();

  const { data: menuItems } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => base44.entities.MenuItem.list(),
    initialData: [],
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Inventory.list(),
    initialData: [],
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => base44.entities.Table.list(),
    initialData: [],
  });

  const createMenuMutation = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create(data),
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

  const createInventoryMutation = useMutation({
    mutationFn: (data) => base44.entities.Inventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setInventoryDialog(false);
      resetInventoryForm();
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

  const generateTables = async () => {
    setGeneratingTables(true);
    const baseUrl = window.location.origin;
    const tablesToCreate = [];
    
    for (let i = 1; i <= tableCount; i++) {
      const tableNumber = `T${i.toString().padStart(2, '0')}`;
      const menuUrl = `${baseUrl}/RestaurantMenu?table=${tableNumber}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      
      tablesToCreate.push({
        table_number: tableNumber,
        capacity: 4,
        status: "available",
        qr_code_url: qrCodeUrl,
        location: `Section ${Math.ceil(i / 5)}`
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
      min_quantity: inventoryForm.min_quantity ? parseFloat(inventoryForm.min_quantity) : undefined
    });
  };

  const stats = {
    totalOrders: orders.length,
    todayRevenue: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.created_date).toDateString() === today;
    }).reduce((sum, o) => sum + o.total_amount, 0),
    menuItems: menuItems.length,
    lowStock: inventory.filter(i => i.quantity <= (i.min_quantity || 0)).length
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🍴 Restaurant Admin</h1>
          <p className="text-slate-600">Manage menu, inventory, and orders</p>
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
                <Button onClick={() => { resetMenuForm(); setMenuDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id}>
                      {item.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge className={item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {item.available ? "Available" : "Unavailable"}
                          </Badge>
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
                <Button onClick={() => setInventoryDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventory.map((item) => (
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
                  <Button onClick={generateTables} disabled={generatingTables || tables.length > 0}>
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
                {tables.length === 0 ? (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No tables generated yet</p>
                    <p className="text-sm text-slate-500">Set the number of tables and click Generate</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map((table) => (
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
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-sm text-slate-600">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.total_amount}</p>
                        <Badge>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInventoryDialog(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}