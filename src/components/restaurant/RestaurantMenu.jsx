import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, ArrowLeft, Truck, Store, UtensilsCrossed } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RestaurantMenu({ restaurant, user, onBack, onShowProfile, onShowOrders }) {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [customerInfo, setCustomerInfo] = useState({
    address: user.addresses?.[0]?.address || "",
    instructions: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("");

  const queryClient = useQueryClient();

  const { data: menuItems } = useQuery({
    queryKey: ['menu', restaurant.id],
    queryFn: () => base44.entities.MenuItem.filter({ restaurant_id: restaurant.id, available: true }),
    initialData: [],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data) => {
      const orderNumber = `ORD-${Date.now()}`;
      const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();
      const platformCommission = (data.total_amount * restaurant.commission_rate) / 100;
      
      return base44.entities.Order.create({
        ...data,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        order_number: orderNumber,
        delivery_code: deliveryCode,
        platform_commission: platformCommission,
        status: 'pending',
        created_by: user.email
      });
    },
    onSuccess: () => {
      setCart([]);
      setCheckoutDialog(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert("Order placed successfully!");
      onShowOrders();
    },
  });

  const categories = ["all", ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
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
  const deliveryFee = orderType === 'delivery' ? restaurant.delivery_fee : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!user.payment_methods?.length) {
      alert("Please add a payment method first!");
      onShowProfile();
      return;
    }
    setCheckoutDialog(true);
  };

  const submitOrder = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    createOrderMutation.mutate({
      customer_name: user.full_name,
      customer_phone: user.phone,
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
      estimated_time: restaurant.avg_delivery_time,
      payment_status: 'paid'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-orange-600">{restaurant.name}</h1>
              <p className="text-sm text-slate-600">{restaurant.description}</p>
            </div>
            <Button onClick={handleCheckout} className="bg-orange-600 hover:bg-orange-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({cart.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
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
                  {orderType === "dine_in" ? "Dine In" : orderType === "takeout" ? "Take Out" : `Delivery (+$${restaurant.delivery_fee})`}
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
                {cat === "all" ? "All" : cat.replace('_', ' ')}
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
      </div>

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
                <Select value={customerInfo.address} onValueChange={(value) => setCustomerInfo({...customerInfo, address: value})}>
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
            <Button onClick={submitOrder} disabled={!paymentMethod}>Place Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}