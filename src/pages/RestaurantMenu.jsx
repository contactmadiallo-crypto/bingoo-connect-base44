import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Truck, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons = {
  appetizers: "🥗",
  main_course: "🍽️",
  desserts: "🍰",
  beverages: "🥤",
  sides: "🍟"
};

export default function RestaurantMenu() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderType, setOrderType] = useState("dine_in");

  const queryClient = useQueryClient();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => base44.entities.MenuItem.list(),
    initialData: [],
  });

  const createOrderMutation = useMutation({
    mutationFn: (data) => base44.entities.Order.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCart([]);
      setShowCheckout(false);
      alert("Order placed successfully!");
    },
  });

  const availableItems = menuItems.filter(item => item.available);
  const filteredItems = selectedCategory === "all" 
    ? availableItems 
    : availableItems.filter(item => item.category === selectedCategory);

  const categories = ["all", "appetizers", "main_course", "desserts", "beverages", "sides"];

  const addToCart = (item) => {
    const existing = cart.find(c => c.menu_item_id === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.menu_item_id === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(c => 
      c.menu_item_id === itemId 
        ? { ...c, quantity: Math.max(0, c.quantity + delta) }
        : c
    ).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === "delivery" ? 5 : 0;
  const total = cartTotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const orderNumber = `ORD-${Date.now()}`;
    createOrderMutation.mutate({
      order_number: orderNumber,
      customer_name: "Customer",
      items: cart,
      total_amount: total,
      order_type: orderType,
      delivery_fee: deliveryFee,
      status: "pending"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">🍴 RestaurantName</h1>
              <p className="text-slate-600">Order your favorite dishes</p>
            </div>
            <Button 
              onClick={() => setShowCheckout(!showCheckout)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cart.length})
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Type Selection */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={orderType === "dine_in" ? "default" : "outline"}
            onClick={() => setOrderType("dine_in")}
            className="flex-1"
          >
            <Store className="w-4 h-4 mr-2" />
            Dine In
          </Button>
          <Button
            variant={orderType === "takeout" ? "default" : "outline"}
            onClick={() => setOrderType("takeout")}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Takeout
          </Button>
          <Button
            variant={orderType === "delivery" ? "default" : "outline"}
            onClick={() => setOrderType("delivery")}
            className="flex-1"
          >
            <Truck className="w-4 h-4 mr-2" />
            Delivery
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat !== "all" && categoryIcons[cat]} {cat.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                        {item.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <Badge className="mt-1">{item.category.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">${item.price}</p>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-600 text-sm mb-4">{item.description}</p>
                          {item.preparation_time && (
                            <p className="text-xs text-slate-500 mb-3">⏱️ {item.preparation_time} min</p>
                          )}
                          <Button 
                            onClick={() => addToCart(item)}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map((item) => (
                        <div key={item.menu_item_id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-slate-600">${item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.menu_item_id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.menu_item_id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                      </div>
                      {orderType === "delivery" && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Delivery Fee</span>
                          <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-orange-600">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}