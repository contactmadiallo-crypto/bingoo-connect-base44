
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Search, MapPin, CreditCard, LogOut, User as UserIcon, Truck, Store, UtensilsCrossed } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [orderType, setOrderType] = useState("delivery"); // Default to delivery
  const [customerInfo, setCustomerInfo] = useState({
    name: "", phone: "", address: "", instructions: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [newPayment, setNewPayment] = useState({ type: "credit_card", last_four: "" });
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });

  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setCustomerInfo({
        name: currentUser.full_name || "",
        phone: currentUser.phone || "",
        address: currentUser.addresses?.[0]?.address || "",
        instructions: ""
      });
    } catch (error) {
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const { data: menuItems } = useQuery({
    queryKey: ['menu'],
    queryFn: () => base44.entities.MenuItem.list(),
    initialData: [],
    enabled: !!user,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      checkAuth();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data) => {
      const orderNumber = `ORD-${Date.now()}`;
      const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();
      return base44.entities.Order.create({
        ...data,
        order_number: orderNumber,
        delivery_code: deliveryCode,
        status: 'pending',
        created_by: user.email
      });
    },
    onSuccess: () => {
      setCart([]);
      setCheckoutDialog(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert("Order placed successfully! Check 'My Orders' tab to track.");
    },
  });

  const handleAddPayment = () => {
    if (!newPayment.last_four) return;
    const payments = user.payment_methods || [];
    updateUserMutation.mutate({
      payment_methods: [...payments, { ...newPayment, is_default: payments.length === 0 }]
    });
    setNewPayment({ type: "credit_card", last_four: "" });
  };

  const handleAddAddress = () => {
    if (!newAddress.address) return;
    const addresses = user.addresses || [];
    updateUserMutation.mutate({
      addresses: [...addresses, { ...newAddress, is_default: addresses.length === 0 }]
    });
    setNewAddress({ label: "", address: "" });
  };

  const categories = ["all", "appetizers", "main_course", "desserts", "beverages", "sides"];

  const filteredItems = menuItems.filter(item => {
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch && item.available;
  });

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, {...item, quantity: 1}]);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(c => {
      if (c.id === itemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? {...c, quantity: newQty} : null;
      }
      return c;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' ? 5 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!user.payment_methods?.length) {
      alert("Please add a payment method first!");
      setProfileDialog(true);
      return;
    }
    setCheckoutDialog(true);
  };

  const submitOrder = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    
    // Validate delivery address for delivery orders
    if (orderType === 'delivery' && !customerInfo.address) {
      alert("Please select a delivery address for delivery orders.");
      return;
    }

    createOrderMutation.mutate({
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      special_instructions: customerInfo.instructions,
      order_type: orderType,
      items: cart.map(item => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: total,
      delivery_fee: deliveryFee,
      estimated_time: 30,
      payment_status: 'paid'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">🍽️ Delicious Menu</h1>
              <p className="text-sm text-slate-600">Welcome, {user?.full_name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setProfileDialog(true)}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button onClick={handleCheckout} className="bg-orange-600 hover:bg-orange-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({cart.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card className="mb-6 bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4 text-center">Choose Your Order Type</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={orderType === "dine_in" ? "default" : "outline"}
                    onClick={() => setOrderType("dine_in")}
                    className="h-24 flex flex-col gap-2"
                  >
                    <UtensilsCrossed className="w-8 h-8" />
                    <span className="font-semibold">Dine In</span>
                  </Button>
                  <Button
                    variant={orderType === "takeout" ? "default" : "outline"}
                    onClick={() => setOrderType("takeout")}
                    className="h-24 flex flex-col gap-2"
                  >
                    <Store className="w-8 h-8" />
                    <span className="font-semibold">Take Out</span>
                  </Button>
                  <Button
                    variant={orderType === "delivery" ? "default" : "outline"}
                    onClick={() => setOrderType("delivery")}
                    className="h-24 flex flex-col gap-2"
                  >
                    <Truck className="w-8 h-8" />
                    <span className="font-semibold">Delivery</span>
                  </Button>
                </div>
                {orderType && (
                  <div className="mt-4 text-center">
                    <Badge className="text-sm px-4 py-2">
                      Current: {orderType === "dine_in" ? "Dine In" : orderType === "takeout" ? "Take Out" : "Delivery"}
                      {orderType === "delivery" && " (+ $5.00 fee)"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mb-6">
              <Input
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                      <Button onClick={() => addToCart(item)} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <LiveOrderTracking userEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile & Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="payment">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-4">
              <div className="space-y-3">
                {user?.payment_methods?.map((pm, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">{pm.type.replace('_', ' ')}</p>
                          <p className="text-sm text-slate-600">**** {pm.last_four}</p>
                        </div>
                      </div>
                      {pm.is_default && <Badge>Default</Badge>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-4 space-y-3">
                  <h3 className="font-semibold">Add Payment Method</h3>
                  <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Last 4 digits" 
                    value={newPayment.last_four}
                    onChange={(e) => setNewPayment({...newPayment, last_four: e.target.value})}
                    maxLength={4}
                  />
                  <Button onClick={handleAddPayment} className="w-full">Add Payment Method</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <div className="space-y-3">
                {user?.addresses?.map((addr, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 mt-1" />
                          <div>
                            {addr.label && <p className="font-semibold">{addr.label}</p>}
                            <p className="text-sm text-slate-600">{addr.address}</p>
                          </div>
                        </div>
                        {addr.is_default && <Badge>Default</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-4 space-y-3">
                  <h3 className="font-semibold">Add Address</h3>
                  <Input 
                    placeholder="Label (e.g., Home, Work)" 
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                  />
                  <Textarea 
                    placeholder="Full address" 
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                  />
                  <Button onClick={handleAddAddress} className="w-full">Add Address</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => base44.auth.logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutDialog} onOpenChange={setCheckoutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-slate-600 mb-1">Order Type:</p>
              <p className="text-lg font-bold text-orange-600">
                {orderType === "dine_in" ? "Dine In" : orderType === "takeout" ? "Take Out" : "Delivery"}
              </p>
            </div>

            {orderType === 'delivery' && (
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Select 
                  value={customerInfo.address} 
                  onValueChange={(value) => setCustomerInfo({...customerInfo, address: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select address" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.addresses?.map((addr, idx) => (
                      <SelectItem key={idx} value={addr.address}>{addr.label || addr.address}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {user?.payment_methods?.map((pm, idx) => (
                    <SelectItem key={idx} value={pm.last_four}>
                      {pm.type.replace('_', ' ')} **** {pm.last_four}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea value={customerInfo.instructions} onChange={(e) => setCustomerInfo({...customerInfo, instructions: e.target.value})} />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="px-3 py-1 border rounded">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialog(false)}>Cancel</Button>
            <Button onClick={submitOrder} disabled={!paymentMethod || (orderType === 'delivery' && !customerInfo.address)}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LiveOrderTracking({ userEmail }) {
  const { data: orders } = useQuery({
    queryKey: ['user-orders', userEmail],
    queryFn: async () => {
      const allOrders = await base44.entities.Order.list('-created_date');
      return allOrders.filter(o => o.created_by === userEmail);
    },
    initialData: [],
    refetchInterval: 3000
  });

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        orders.map(order => (
          <Card key={order.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{order.order_number}</h3>
                  <p className="text-sm text-slate-600">{new Date(order.created_date).toLocaleString()}</p>
                </div>
                <Badge className={
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>

              {order.status === 'out_for_delivery' && order.delivery_code && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">Your Delivery Code:</p>
                  <p className="text-3xl font-bold text-green-700 text-center tracking-wider">
                    {order.delivery_code}
                  </p>
                  <p className="text-xs text-slate-600 mt-2">Share with driver to confirm delivery</p>
                </div>
              )}

              {order.driver_name && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-slate-600">Driver: {order.driver_name} ({order.driver_phone})</p>
                </div>
              )}

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>Total</span>
                <span className="text-green-600">${order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
