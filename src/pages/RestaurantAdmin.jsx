
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
import { Plus, Pencil, Trash2, QrCode, Package, DollarSign, ShoppingCart, Loader2, Download, FileSpreadsheet, Settings, TrendingUp, BarChart3, Clock, Award, Sparkles, Zap, X, Check, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatsCard from "../components/work/StatsCard";
import AdminAuthGuard from "../components/AdminAuthGuard";

function RestaurantAdminContent() {
  const [menuDialog, setMenuDialog] = useState(false);
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [cancelOrderDialog, setCancelOrderDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [generatingTables, setGeneratingTables] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [tableCount, setTableCount] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
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
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("week");
  const [loyaltyDialog, setLoyaltyDialog] = useState(false);
  const [rewardDialog, setRewardDialog] = useState(false);
  const [loyaltyForm, setLoyaltyForm] = useState({
    loyalty_enabled: false,
    loyalty_points_per_dollar: 10,
    loyalty_tiers: {
      bronze: { min_points: 0, discount: 0 },
      silver: { min_points: 500, discount: 5 },
      gold: { min_points: 1000, discount: 10 },
      platinum: { min_points: 2000, discount: 15 }
    }
  });
  const [rewardForm, setRewardForm] = useState({
    title: "",
    description: "",
    points_required: "",
    discount_type: "percentage",
    discount_value: "",
    tier_required: "bronze"
  });

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
    refetchInterval: 5000,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => base44.entities.Table.list(),
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: () => base44.entities.LoyaltyReward.list(),
  });

  const { data: customerLoyalties = [] } = useQuery({
    queryKey: ['customer-loyalties'],
    queryFn: () => base44.entities.CustomerLoyalty.list(),
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
    mutationFn: (data) => base44.entities.MenuItem.create({ ...data, restaurant_id: myRestaurant?.id }),
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

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ id, reason }) => base44.entities.Order.update(id, {
      status: 'cancelled',
      cancellation_reason: reason
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCancelOrderDialog(false);
      setOrderDetailDialog(false);
      setCancelReason("");
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: (data) => base44.entities.LoyaltyReward.create({ ...data, restaurant_id: myRestaurant?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-rewards'] });
      setRewardDialog(false);
      setRewardForm({ title: "", description: "", points_required: "", discount_type: "percentage", discount_value: "", tier_required: "bronze" });
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (id) => base44.entities.LoyaltyReward.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-rewards'] });
    },
  });

  const updateLoyaltySettingsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setLoyaltyDialog(false);
    },
  });

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered', // Assuming delivered is the next logical step
    };
    return statusFlow[currentStatus];
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'ready': 'bg-green-100 text-green-800',
      'out_for_delivery': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOrderDetailDialog(true);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }
    cancelOrderMutation.mutate({ id: selectedOrder.id, reason: cancelReason });
  };

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

  const generateDescription = async () => {
    if (!menuForm.name) {
      alert("Please enter a dish name first");
      return;
    }

    setGeneratingAI(true);
    const prompt = `Generate a compelling, mouth-watering menu description for a dish called "${menuForm.name}".
    The description should be 2-3 sentences, appetizing, and highlight what makes this dish special.
    Write in an elegant, professional style suitable for a restaurant menu.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMenuForm({ ...menuForm, description: response });
    setGeneratingAI(false);
  };

  const suggestPrice = async () => {
    if (!menuForm.name || !menuForm.category) {
      alert("Please enter dish name and category first");
      return;
    }

    setGeneratingAI(true);
    const prompt = `Based on market trends and typical restaurant pricing in 2024, suggest an optimal price in USD for a ${menuForm.category} dish called "${menuForm.name}".
    Consider:
    - Average market prices for similar dishes
    - Ingredient costs
    - Restaurant positioning (mid-range casual dining)
    - Competitive pricing
    
    Return ONLY a single number (the price in dollars), nothing else.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    const price = parseFloat(response.trim());
    if (!isNaN(price)) {
      setMenuForm({ ...menuForm, price: price.toString() });
    }
    setGeneratingAI(false);
  };

  const autoCategorizeDish = async () => {
    if (!menuForm.name) {
      alert("Please enter a dish name first");
      return;
    }

    setGeneratingAI(true);
    const prompt = `Categorize this menu item: "${menuForm.name}"
    ${menuForm.description ? `Description: ${menuForm.description}` : ''}
    
    Choose the BEST category from these options:
    - appetizers
    - main_course
    - desserts
    - beverages
    - sides
    
    Return ONLY the category name, nothing else.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    const category = response.trim().toLowerCase();
    const validCategories = ['appetizers', 'main_course', 'desserts', 'beverages', 'sides'];

    if (validCategories.includes(category)) {
      setMenuForm({ ...menuForm, category });
    }
    setGeneratingAI(false);
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
        const dishesWithRestaurantId = result.output.dishes.map(dish => ({
          ...dish,
          restaurant_id: myRestaurant?.id
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
      const menuUrl = `${baseUrl}/RestaurantMenu?table=${tableNumber}&restaurant_id=${myRestaurant?.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;

      tablesToCreate.push({
        table_number: tableNumber,
        capacity: 4,
        status: "available",
        qr_code_url: qrCodeUrl,
        location: `Section ${Math.ceil(i / 5)}`,
        restaurant_id: myRestaurant?.id
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
      restaurant_id: myRestaurant?.id
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

  const openLoyaltySettings = () => {
    if (myRestaurant) {
      setLoyaltyForm({
        loyalty_enabled: myRestaurant.loyalty_enabled || false,
        loyalty_points_per_dollar: myRestaurant.loyalty_points_per_dollar || 10,
        loyalty_tiers: myRestaurant.loyalty_tiers || {
          bronze: { min_points: 0, discount: 0 },
          silver: { min_points: 500, discount: 5 },
          gold: { min_points: 1000, discount: 10 },
          platinum: { min_points: 2000, discount: 15 }
        }
      });
      setLoyaltyDialog(true);
    }
  };

  const handleLoyaltySubmit = (e) => {
    e.preventDefault();
    updateLoyaltySettingsMutation.mutate({
      id: myRestaurant.id,
      data: loyaltyForm
    });
  };

  const handleRewardSubmit = (e) => {
    e.preventDefault();
    createRewardMutation.mutate({
      ...rewardForm,
      points_required: parseInt(rewardForm.points_required),
      discount_value: parseFloat(rewardForm.discount_value)
    });
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
  const myRewards = rewards.filter(r => r.restaurant_id === myRestaurant?.id);
  const myCustomerLoyalties = customerLoyalties.filter(l => l.restaurant_id === myRestaurant?.id);

  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      day: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      year: new Date(now.setFullYear(now.getFullYear() - 1))
    };
    return ranges[analyticsTimeRange] || ranges.week;
  };

  const filteredOrders = myOrders.filter(o => new Date(o.created_date) >= getDateRange());

  const analytics = {
    revenue: {
      total: filteredOrders.reduce((sum, o) => sum + o.total_amount, 0),
      byDay: filteredOrders.reduce((acc, o) => {
        const date = new Date(o.created_date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + o.total_amount;
        return acc;
      }, {}),
      growth: (() => {
        if (filteredOrders.length === 0) return 0;
        const sortedOrders = [...filteredOrders].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const midIndex = Math.ceil(sortedOrders.length / 2);
        const firstHalf = sortedOrders.slice(0, midIndex);
        const secondHalf = sortedOrders.slice(midIndex);

        const firstHalfRevenue = firstHalf.reduce((sum, o) => sum + o.total_amount, 0);
        const secondHalfRevenue = secondHalf.reduce((sum, o) => sum + o.total_amount, 0);

        if (firstHalfRevenue === 0 && secondHalfRevenue === 0) return 0;
        if (firstHalfRevenue === 0) return 100;

        return (((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100).toFixed(1);
      })()
    },
    topItems: (() => {
      const itemSales = {};
      filteredOrders.forEach(order => {
        order.items?.forEach(item => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
          }
          itemSales[item.name].quantity += item.quantity;
          itemSales[item.name].revenue += item.price * item.quantity;
        });
      });
      return Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    })(),
    peakHours: (() => {
      const hourCounts = {};
      filteredOrders.forEach(o => {
        const hour = new Date(o.created_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      return Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count);
    })(),
    orderTypes: filteredOrders.reduce((acc, o) => {
      acc[o.order_type] = (acc[o.order_type] || 0) + 1;
      return acc;
    }, {}),
    avgOrderValue: filteredOrders.length > 0
      ? (filteredOrders.reduce((sum, o) => sum + o.total_amount, 0) / filteredOrders.length).toFixed(2)
      : 0
  };

  const exportSalesReport = () => {
    if (filteredOrders.length === 0) {
      alert("No sales data to export for the selected period.");
      return;
    }

    const reportData = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Date': new Date(order.created_date).toLocaleString(),
      'Customer Name': order.customer_name || 'N/A',
      'Customer Phone': order.customer_phone || 'N/A',
      'Order Type': order.order_type ? order.order_type.replace('_', ' ') : 'N/A',
      'Items': order.items?.map(i => `${i.quantity}x ${i.name} ($${(i.price * i.quantity).toFixed(2)})`).join('; ') || 'No Items',
      'Subtotal': order.subtotal?.toFixed(2) || '',
      'Delivery Fee': order.delivery_fee?.toFixed(2) || '',
      'Discount': order.discount?.toFixed(2) || '',
      'Total Amount': order.total_amount.toFixed(2),
      'Status': order.status ? order.status.replace('_', ' ') : 'N/A',
      'Special Instructions': order.special_instructions || 'N/A',
    }));

    const headers = Object.keys(reportData[0] || {});
    const csv = [
      headers.map(header => `"${header}"`).join(','),
      ...reportData.map(row => headers.map(h => {
        const value = row[h];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${analyticsTimeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


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
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="tables">Tables & QR</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                            if (confirm('Delete this item?')) deleteMenuMutation.mutate(item.id);
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

          <TabsContent value="loyalty">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Loyalty Program Settings</CardTitle>
                  <Button onClick={openLoyaltySettings} disabled={!myRestaurant}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </CardHeader>
                <CardContent>
                  {myRestaurant?.loyalty_enabled ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-semibold">✅ Loyalty Program Active</p>
                        <p className="text-xs text-green-700 mt-1">Customers earn {myRestaurant.loyalty_points_per_dollar} points per dollar spent</p>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        {Object.entries(myRestaurant.loyalty_tiers || {}).map(([tier, config]) => (
                          <div key={tier} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border">
                            <p className="text-xs text-slate-500 uppercase">{tier} tier</p>
                            <p className="text-xl font-bold text-slate-900">{config.min_points}+ pts</p>
                            <p className="text-sm text-green-600">{config.discount}% discount</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-slate-600">Total Members</p>
                          <p className="text-2xl font-bold text-blue-700">{myCustomerLoyalties.length}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-slate-600">Points Awarded</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {myCustomerLoyalties.reduce((sum, l) => sum + (l.points || 0), 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-slate-600">Rewards Redeemed</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {myCustomerLoyalties.reduce((sum, l) => sum + (l.rewards_redeemed || 0), 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Loyalty Program Not Enabled</p>
                      <p className="text-sm text-slate-500 mb-4">Reward your customers and encourage repeat orders</p>
                      <Button onClick={openLoyaltySettings}>
                        Enable Loyalty Program
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {myRestaurant?.loyalty_enabled && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Rewards Catalog</CardTitle>
                    <Button onClick={() => setRewardDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reward
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {myRewards.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No rewards created yet
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {myRewards.map((reward) => (
                          <Card key={reward.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg">{reward.title}</h4>
                                  <p className="text-sm text-slate-600">{reward.description}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  if (confirm('Delete this reward?')) deleteRewardMutation.mutate(reward.id);
                                }}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Badge>{reward.points_required} points</Badge>
                                <Badge variant="outline" className="capitalize">{reward.tier_required}+</Badge>
                                {reward.discount_type === "percentage" && (
                                  <Badge variant="secondary">{reward.discount_value}% off</Badge>
                                )}
                                {reward.discount_type === "fixed_amount" && (
                                  <Badge variant="secondary">${reward.discount_value} off</Badge>
                                )}
                                <Badge className={reward.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                  {reward.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              {reward.usage_limit && (
                                <p className="text-xs text-slate-500 mt-2">
                                  Used {reward.times_redeemed || 0} / {reward.usage_limit} times
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">{order.order_number}</p>
                          <p className="text-sm text-slate-600">{new Date(order.created_date).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl">${order.total_amount.toFixed(2)}</p>
                          <Badge className={`capitalize mt-1 ${getStatusColor(order.status)}`}>
                            {order.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-semibold">Customer:</p>
                          <p>{order.customer_name}</p>
                          <p className="text-slate-600">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Order Type:</p>
                          <p className="capitalize">{order.order_type?.replace('_', ' ')}</p>
                          <p className="text-slate-600 mt-1">{order.items?.length} items</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {myOrders.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      No orders yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sales Analytics</CardTitle>
                  <div className="flex gap-2">
                    <Select value={analyticsTimeRange} onValueChange={setAnalyticsTimeRange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={exportSalesReport} variant="outline" disabled={filteredOrders.length === 0}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">Total Revenue</p>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-700">${analytics.revenue.total.toFixed(2)}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {analytics.revenue.growth > 0 ? '+' : ''}{analytics.revenue.growth}% vs previous period
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">Total Orders</p>
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-700">{filteredOrders.length}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {analyticsTimeRange === 'day' ? 'Today' : analyticsTimeRange === 'week' ? 'This week' : analyticsTimeRange === 'month' ? 'This month' : 'This year'}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">Avg Order Value</p>
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-3xl font-bold text-purple-700">${analytics.avgOrderValue}</p>
                      <p className="text-xs text-purple-600 mt-1">Per order</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                        Daily Sales Trend
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(analytics.revenue.byDay).length > 0 ? (
                          Object.entries(analytics.revenue.byDay).slice(-7).map(([date, revenue]) => (
                            <div key={date} className="flex items-center gap-3">
                              <span className="text-xs text-slate-600 w-24">{date}</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-orange-400 to-red-400 h-full rounded-full flex items-center justify-end pr-2"
                                  style={{ width: `${(revenue / Math.max(...Object.values(analytics.revenue.byDay))) * 100}%` }}
                                >
                                  <span className="text-xs font-semibold text-white">${revenue.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No daily sales data.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Peak Order Times
                      </h3>
                      <div className="space-y-2">
                        {analytics.peakHours.length > 0 ? (
                          analytics.peakHours.slice(0, 7).map(({ hour, count }) => (
                            <div key={hour} className="flex items-center gap-3">
                              <span className="text-xs text-slate-600 w-24">
                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                              </span>
                              <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full flex items-center justify-end pr-2"
                                  style={{ width: `${(count / Math.max(...analytics.peakHours.map(h => h.count))) * 100}%` }}
                                >
                                  <span className="text-xs font-semibold text-white">{count} orders</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No peak hour data.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Top Selling Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topItems.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold">
                          #{idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-slate-600">{item.quantity} sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${item.revenue.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">revenue</p>
                        </div>
                      </div>
                    ))}
                    {analytics.topItems.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        No sales data available for this period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(analytics.orderTypes).length > 0 ? (
                      Object.entries(analytics.orderTypes).map(([type, count]) => (
                        <div key={type} className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border">
                          <p className="text-sm text-slate-600 capitalize mb-2">{type.replace('_', ' ')}</p>
                          <p className="text-3xl font-bold text-slate-900">{count}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {((count / filteredOrders.length) * 100).toFixed(1)}% of orders
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 col-span-full">
                        No order type data for this period.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                <Input value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Description</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={generateDescription}
                    disabled={generatingAI || !menuForm.name}
                    className="h-7"
                  >
                    {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  placeholder="AI can generate a compelling description for you..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={suggestPrice}
                      disabled={generatingAI || !menuForm.name}
                      className="h-6 text-xs"
                    >
                      {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                      Suggest
                    </Button>
                  </div>
                  <Input type="number" step="0.01" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Category</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={autoCategorizeDish}
                      disabled={generatingAI || !menuForm.name}
                      className="h-6 text-xs"
                    >
                      {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      Auto
                    </Button>
                  </div>
                  <Select value={menuForm.category} onValueChange={(value) => setMenuForm({ ...menuForm, category: value })}>
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

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-xs text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span><strong>AI Assistant:</strong> Use AI to generate descriptions, suggest optimal pricing based on market trends, and automatically categorize your dishes.</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preparation Time (minutes)</Label>
                <Input type="number" value={menuForm.preparation_time} onChange={(e) => setMenuForm({ ...menuForm, preparation_time: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMenuDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={uploadingImage || generatingAI}>{editingItem ? "Update" : "Add"}</Button>
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
                <Input value={inventoryForm.item_name} onChange={(e) => setInventoryForm({ ...inventoryForm, item_name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input type="number" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={inventoryForm.unit} onValueChange={(value) => setInventoryForm({ ...inventoryForm, unit: value })}>
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
                <Input type="number" value={inventoryForm.min_quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, min_quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={inventoryForm.category} onValueChange={(value) => setInventoryForm({ ...inventoryForm, category: value })}>
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
                  onChange={(e) => setSettingsForm({ ...settingsForm, open_hours: e.target.value })}
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
                    onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Order ($)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settingsForm.min_order}
                    onChange={(e) => setSettingsForm({ ...settingsForm, min_order: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Time (min)</Label>
                  <Input
                    type="number"
                    value={settingsForm.avg_delivery_time}
                    onChange={(e) => setSettingsForm({ ...settingsForm, avg_delivery_time: e.target.value })}
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

        <Dialog open={loyaltyDialog} onOpenChange={setLoyaltyDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Loyalty Program Configuration</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLoyaltySubmit} className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold">Enable Loyalty Program</p>
                  <p className="text-xs text-slate-600">Allow customers to earn points and rewards</p>
                </div>
                <input
                  type="checkbox"
                  checked={loyaltyForm.loyalty_enabled}
                  onChange={(e) => setLoyaltyForm({ ...loyaltyForm, loyalty_enabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              {loyaltyForm.loyalty_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Points Per Dollar Spent</Label>
                    <Input
                      type="number"
                      value={loyaltyForm.loyalty_points_per_dollar}
                      onChange={(e) => setLoyaltyForm({ ...loyaltyForm, loyalty_points_per_dollar: parseInt(e.target.value) })}
                      min="1"
                    />
                    <p className="text-xs text-slate-500">Customers will earn this many points for every $1 spent</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Tier Configuration</Label>
                    {Object.entries(loyaltyForm.loyalty_tiers).map(([tier, config]) => (
                      <div key={tier} className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
                        <div>
                          <Label className="text-xs capitalize">{tier} Tier</Label>
                        </div>
                        <div>
                          <Label className="text-xs">Min Points</Label>
                          <Input
                            type="number"
                            value={config.min_points}
                            onChange={(e) => setLoyaltyForm({
                              ...loyaltyForm,
                              loyalty_tiers: {
                                ...loyaltyForm.loyalty_tiers,
                                [tier]: { ...config, min_points: parseInt(e.target.value) }
                              }
                            })}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Discount (%)</Label>
                          <Input
                            type="number"
                            value={config.discount}
                            onChange={(e) => setLoyaltyForm({
                              ...loyaltyForm,
                              loyalty_tiers: {
                                ...loyaltyForm.loyalty_tiers,
                                [tier]: { ...config, discount: parseInt(e.target.value) }
                              }
                            })}
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Tip:</strong> Higher tiers should offer better discounts to incentivize repeat orders.
                      Set realistic point thresholds to keep customers engaged.
                    </p>
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setLoyaltyDialog(false)}>Cancel</Button>
                <Button type="submit">Save Loyalty Settings</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={rewardDialog} onOpenChange={setRewardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reward</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRewardSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="e.g., Free Dessert"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  placeholder="Describe the reward..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Points Required *</Label>
                  <Input
                    type="number"
                    value={rewardForm.points_required}
                    onChange={(e) => setRewardForm({ ...rewardForm, points_required: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Tier</Label>
                  <Select value={rewardForm.tier_required} onValueChange={(value) => setRewardForm({ ...rewardForm, tier_required: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type *</Label>
                  <Select value={rewardForm.discount_type} onValueChange={(value) => setRewardForm({ ...rewardForm, discount_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                      <SelectItem value="free_item">Free Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={rewardForm.discount_value}
                    onChange={(e) => setRewardForm({ ...rewardForm, discount_value: e.target.value })}
                    placeholder={rewardForm.discount_type === "percentage" ? "10" : "5.00"}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRewardDialog(false)}>Cancel</Button>
                <Button type="submit">Create Reward</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={orderDetailDialog} onOpenChange={setOrderDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Current Status</p>
                    <Badge className={`mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">${selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Customer Information</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-600">Name:</span> {selectedOrder.customer_name}</p>
                      <p><span className="text-slate-600">Phone:</span> {selectedOrder.customer_phone}</p>
                      {selectedOrder.customer_address && (
                        <p><span className="text-slate-600">Address:</span> {selectedOrder.customer_address}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Order Information</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-slate-600">Type:</span> <span className="capitalize">{selectedOrder.order_type?.replace('_', ' ')}</span></p>
                      <p><span className="text-slate-600">Date:</span> {new Date(selectedOrder.created_date).toLocaleString()}</p>
                      {selectedOrder.table_number && (
                        <p><span className="text-slate-600">Table:</span> {selectedOrder.table_number}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOrder.special_instructions && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-semibold text-sm mb-1">Special Instructions:</p>
                    <p className="text-sm text-slate-700">{selectedOrder.special_instructions}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.quantity}x {item.name}</p>
                          {item.notes && <p className="text-xs text-slate-600">{item.notes}</p>}
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.driver_name && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-sm mb-1">Delivery Partner:</p>
                    <p className="text-sm">{selectedOrder.driver_name} - {selectedOrder.driver_phone}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {getNextStatus(selectedOrder.status) && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status))}
                      className="flex-1"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Move to {getNextStatus(selectedOrder.status)?.replace('_', ' ')}
                    </Button>
                  )}
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <Button
                      variant="destructive"
                      onClick={() => setCancelOrderDialog(true)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={cancelOrderDialog} onOpenChange={setCancelOrderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to cancel order {selectedOrder?.order_number}? Please provide a reason.
              </p>
              <div className="space-y-2">
                <Label>Cancellation Reason *</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Out of ingredients, Customer requested, etc."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCancelOrderDialog(false);
                setCancelReason("");
              }}>
                Keep Order
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder}>
                Cancel Order
              </Button>
            </DialogFooter>
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
