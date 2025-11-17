
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, ArrowLeft, Truck, Store, UtensilsCrossed, Search, Star, MessageSquare, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScrollToTop from "../ScrollToTop";
import DishReviews from "./DishReviews";
import LoyaltyCard from "./LoyaltyCard";
import LoyaltyRewards from "./LoyaltyRewards";
import RestaurantReviews from "./RestaurantReviews";
import { useTranslation } from "../translations";

const categoryLabels = {
  appetizers: { label: "Appetizers", emoji: "🥗" },
  main_course: { label: "Main Course", emoji: "🍽️" },
  daily_special: { label: "Daily Special", emoji: "⭐" },
  chef_special: { label: "Chef's Special", emoji: "👨‍🍳" },
  desserts: { label: "Desserts", emoji: "🍰" },
  beverages: { label: "Beverages", emoji: "🥤" },
  sides: { label: "Sides", emoji: "🍟" },
  salads: { label: "Salads", emoji: "🥗" },
  soups: { label: "Soups", emoji: "🍲" },
  breakfast: { label: "Breakfast", emoji: "🍳" },
  lunch: { label: "Lunch", emoji: "🍱" },
  dinner: { label: "Dinner", emoji: "🍛" }
};

export default function RestaurantMenu({ restaurant, user, onBack, onShowProfile, onShowOrders, language = "en" }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [selectedDish, setSelectedDish] = useState(null);
  const [appliedReward, setAppliedReward] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    address: user.addresses?.[0]?.address || "",
    instructions: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("");

  const { t } = useTranslation(language);
  const queryClient = useQueryClient();

  // Define dietary options for display and filtering
  const dietaryOptions = [
    { value: 'vegetarian', label: t('vegetarian'), color: 'bg-green-100 text-green-700' },
    { value: 'vegan', label: t('vegan'), color: 'bg-green-100 text-green-700' },
    { value: 'gluten_free', label: t('gluten_free'), color: 'bg-blue-100 text-blue-700' },
    { value: 'dairy_free', label: t('dairy_free'), color: 'bg-purple-100 text-purple-700' },
    { value: 'nut_free', label: t('nut_free'), color: 'bg-yellow-100 text-yellow-700' },
  ];

  const { data: menuItems } = useQuery({
    queryKey: ['menu', restaurant.id],
    queryFn: () => base44.entities.MenuItem.filter({ restaurant_id: restaurant.id, available: true }),
    initialData: [],
  });

  const { data: allReviews } = useQuery({
    queryKey: ['allReviews', restaurant.id],
    queryFn: () => base44.entities.Review.filter({ restaurant_id: restaurant.id }),
    initialData: [],
  });

  const { data: restaurantReviews = [] } = useQuery({
    queryKey: ['restaurant-reviews', restaurant.id],
    queryFn: () => base44.entities.RestaurantReview.filter({ restaurant_id: restaurant.id }),
  });

  const { data: customerLoyalty } = useQuery({
    queryKey: ['customer-loyalty', user?.email, restaurant.id],
    queryFn: async () => {
      const loyalties = await base44.entities.CustomerLoyalty.filter({ 
        customer_email: user.email,
        restaurant_id: restaurant.id 
      });
      return loyalties[0] || null;
    },
    enabled: !!user?.email && !!restaurant?.loyalty_enabled,
  });

  const { data: menuFavorites = [] } = useQuery({
    queryKey: ['menu-favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ customer_email: user.email, type: 'menu_item' }),
    enabled: !!user?.email,
  });

  const createOrUpdateLoyaltyMutation = useMutation({
    mutationFn: async ({ points, spent, orders }) => {
      if (customerLoyalty) {
        const newPoints = customerLoyalty.points + points;
        const newSpent = customerLoyalty.total_spent + spent;
        const newOrders = customerLoyalty.total_orders + orders;
        
        const tiers = restaurant.loyalty_tiers;
        let newTier = "bronze";
        if (tiers) {
          if (newPoints >= tiers.platinum?.min_points) newTier = "platinum";
          else if (newPoints >= tiers.gold?.min_points) newTier = "gold";
          else if (newPoints >= tiers.silver?.min_points) newTier = "silver";
        }
        
        return base44.entities.CustomerLoyalty.update(customerLoyalty.id, {
          points: newPoints,
          total_spent: newSpent,
          total_orders: newOrders,
          tier: newTier
        });
      } else {
        return base44.entities.CustomerLoyalty.create({
          customer_email: user.email,
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          points,
          total_spent: spent,
          total_orders: orders,
          tier: "bronze"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-loyalty'] });
    }
  });

  const toggleMenuFavoriteMutation = useMutation({
    mutationFn: async (item) => {
      const existing = menuFavorites.find(f => f.menu_item_id === item.id);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
      } else {
        await base44.entities.Favorite.create({
          customer_email: user.email,
          type: 'menu_item',
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          menu_item_id: item.id,
          menu_item_name: item.name
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-favorites'] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data) => {
      const orderNumber = `ORD-${Date.now()}`;
      const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
      const platformCommission = (data.total_amount * restaurant.commission_rate) / 100;
      
      const order = await base44.entities.Order.create({
        ...data,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        order_number: orderNumber,
        delivery_code: deliveryCode,
        platform_commission: platformCommission,
        status: 'pending',
        created_by: user.email
      });

      await base44.entities.Notification.create({
        customer_email: user.email,
        title: "Order Confirmed! 🎉",
        message: `Your order ${orderNumber} from ${restaurant.name} has been placed successfully.`,
        type: "order_update",
        order_id: order.id,
        restaurant_id: restaurant.id,
        action_url: `/OrderTracking?order=${orderNumber}`
      });

      return order;
    },
    onSuccess: async (order) => {
      if (restaurant.loyalty_enabled) {
        const pointsEarned = Math.floor(order.total_amount * (restaurant.loyalty_points_per_dollar || 10));
        await createOrUpdateLoyaltyMutation.mutateAsync({
          points: pointsEarned,
          spent: order.total_amount,
          orders: 1
        });
      }
      
      setCart([]);
      setCheckoutDialog(false);
      setAppliedReward(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert("Order placed successfully! You earned loyalty points!");
      onShowOrders();
    },
  });

  const getItemRating = (itemId) => {
    const itemReviews = allReviews.filter(r => r.menu_item_id === itemId);
    if (itemReviews.length === 0) return { avg: 0, count: 0 };
    const avg = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
    return { avg: avg.toFixed(1), count: itemReviews.length };
  };

  const isMenuItemFavorite = (itemId) => {
    return menuFavorites.some(f => f.menu_item_id === itemId);
  };

  const filteredItems = menuItems.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || 
                        item.description?.toLowerCase().includes(search.toLowerCase());
    
    // Filter based on dietary preferences
    if (user.dietary_preferences?.length > 0) {
      const itemIngredients = (item.ingredients || []).map(i => i.toLowerCase());
      const itemAllergens = (item.allergens || []).map(a => a.toLowerCase());
      
      for (const pref of user.dietary_preferences) {
        if (pref === 'vegetarian' && itemIngredients.some(i => ['meat', 'chicken', 'beef', 'pork', 'fish'].includes(i))) {
          return false;
        }
        if (pref === 'vegan' && itemIngredients.some(i => ['meat', 'chicken', 'beef', 'pork', 'fish', 'dairy', 'egg', 'milk', 'cheese'].includes(i))) {
          return false;
        }
        if (pref === 'gluten_free' && itemAllergens.includes('gluten')) {
          return false;
        }
        if (pref === 'dairy_free' && itemAllergens.includes('dairy')) {
          return false;
        }
        if (pref === 'nut_free' && itemAllergens.includes('nuts')) {
          return false;
        }
      }
    }
    
    return matchSearch;
  });

  const itemsByCategory = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
  
  let loyaltyDiscount = 0;
  if (customerLoyalty && restaurant.loyalty_enabled) {
    const tierConfig = restaurant.loyalty_tiers?.[customerLoyalty.tier];
    if (tierConfig?.discount) {
      loyaltyDiscount = (subtotal * tierConfig.discount) / 100;
    }
  }
  
  let rewardDiscount = 0;
  if (appliedReward) {
    if (appliedReward.discount_type === "percentage") {
      rewardDiscount = (subtotal * appliedReward.discount_value) / 100;
    } else if (appliedReward.discount_type === "fixed_amount") {
      rewardDiscount = appliedReward.discount_value;
    }
  }
  
  const total = subtotal + deliveryFee - loyaltyDiscount - rewardDiscount;

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
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      discount: loyaltyDiscount + rewardDiscount,
      estimated_time: restaurant.avg_delivery_time,
      payment_status: 'paid'
    });
  };

  const avgRestaurantRating = restaurantReviews.length > 0
    ? (restaurantReviews.reduce((sum, r) => sum + r.rating, 0) / restaurantReviews.length).toFixed(1)
    : restaurant.rating || 0;

  // Pre-fill delivery instructions with user's default
  useEffect(() => {
    // Only pre-fill if user has default instructions AND the instructions state is currently empty.
    // This prevents overwriting user's manual input or existing state if component re-renders.
    if (user.default_delivery_instructions && !customerInfo.instructions) {
      setCustomerInfo(prev => ({
        ...prev,
        instructions: user.default_delivery_instructions
      }));
    }
  }, [user.default_delivery_instructions, customerInfo.instructions, user.id]);

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
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-slate-600">{restaurant.description}</p>
                <button 
                  onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center gap-1 text-sm hover:underline"
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{avgRestaurantRating}</span>
                  <span className="text-slate-500">({restaurantReviews.length})</span>
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`}>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Phone className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <Button onClick={handleCheckout} className="bg-orange-600 hover:bg-orange-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('cart')} ({cart.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {showReviews && (
          <div className="mb-6">
            <RestaurantReviews restaurant={restaurant} user={user} />
          </div>
        )}

        {restaurant.loyalty_enabled && (
          <>
            <LoyaltyCard loyalty={customerLoyalty} restaurant={restaurant} />
            <LoyaltyRewards 
              restaurant={restaurant} 
              loyalty={customerLoyalty} 
              onRewardApplied={setAppliedReward}
            />
          </>
        )}

        {user.dietary_preferences?.length > 0 && (
          <Card className="mb-4 sm:mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm font-semibold mb-2 text-green-800">
                🥗 {t('active_filters_dietary_preferences')}
              </p>
              <div className="flex flex-wrap gap-2">
                {user.dietary_preferences.map(pref => {
                  const option = dietaryOptions.find(o => o.value === pref);
                  return (
                    <Badge key={pref} className={option?.color || "bg-green-100 text-green-700"}>
                      {option?.label || pref}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4 text-center">{t('choose_order_type')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={orderType === "dine_in" ? "default" : "outline"}
                onClick={() => setOrderType("dine_in")}
                className="h-24 flex flex-col gap-2"
              >
                <UtensilsCrossed className="w-8 h-8" />
                <span className="font-semibold">{t('dine_in')}</span>
              </Button>
              <Button
                variant={orderType === "takeout" ? "default" : "outline"}
                onClick={() => setOrderType("takeout")}
                className="h-24 flex flex-col gap-2"
              >
                <Store className="w-8 h-8" />
                <span className="font-semibold">{t('take_out')}</span>
              </Button>
              <Button
                variant={orderType === "delivery" ? "default" : "outline"}
                onClick={() => setOrderType("delivery")}
                className="h-24 flex flex-col gap-2"
              >
                <Truck className="w-8 h-8" />
                <span className="font-semibold">{t('delivery')}</span>
              </Button>
            </div>
            {orderType && (
              <div className="mt-4 text-center">
                <Badge className="text-sm px-4 py-2">
                  {orderType === "dine_in" ? t('dine_in') : orderType === "takeout" ? t('take_out') : `${t('delivery')} (+$${restaurant.delivery_fee})`}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('search_menu')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{categoryLabels[category]?.emoji || '🍽️'}</span>
              <h2 className="text-2xl font-bold text-slate-900">
                {t(category) || categoryLabels[category]?.label || category}
              </h2>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const rating = getItemRating(item.id);
                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenuFavoriteMutation.mutate(item);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
                    >
                      <span className="text-xl">{isMenuItemFavorite(item.id) ? '❤️' : '🤍'}</span>
                    </button>
                    {item.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDish(item)}
                          className="h-8 px-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {rating.count > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold">{rating.avg}</span>
                          </div>
                          <span className="text-xs text-slate-500">({rating.count} reviews)</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                      {item.preparation_time && (
                        <p className="text-xs text-slate-500 mb-2">⏱️ {item.preparation_time} {t('min')}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                        <Button onClick={() => addToCart(item)} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ScrollToTop />

      {selectedDish && (
        <DishReviews
          menuItem={selectedDish}
          restaurant={restaurant}
          user={user}
          onClose={() => setSelectedDish(null)}
        />
      )}

      <Dialog open={checkoutDialog} onOpenChange={setCheckoutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('checkout')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-slate-600 mb-1">{t('order_type')}:</p>
              <p className="text-lg font-bold text-orange-600">
                {orderType === "dine_in" ? t('dine_in') : orderType === "takeout" ? t('take_out') : t('delivery')}
              </p>
            </div>

            {orderType === 'delivery' && (
              <div className="space-y-2">
                <Label>{t('delivery_address')}</Label>
                <Select value={customerInfo.address} onValueChange={(value) => setCustomerInfo({...customerInfo, address: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('delivery_address')} />
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
              <Label>{t('payment_method')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder={t('payment_method')} />
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
              <Label>{t('special_instructions')}</Label>
              <Textarea value={customerInfo.instructions} onChange={(e) => setCustomerInfo({...customerInfo, instructions: e.target.value})} />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">{t('order_summary')}</h3>
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
                  <span>{t('subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>{t('delivery_fee')}</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>🎁 {t('loyalty_discount')} ({customerLoyalty.tier})</span>
                    <span>-${loyaltyDiscount.toFixed(2)}</span>
                  </div>
                )}
                {rewardDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>🎟️ {t('reward_applied')}</span>
                    <span>-${rewardDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('total')}</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
                {restaurant.loyalty_enabled && (
                  <div className="bg-green-50 p-3 rounded-lg mt-2">
                    <p className="text-sm text-green-800">
                      🎉 {t('you_will_earn_points', { points: Math.floor(total * (restaurant.loyalty_points_per_dollar || 10)) })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialog(false)}>{t('cancel')}</Button>
            <Button onClick={submitOrder} disabled={!paymentMethod}>{t('place_order')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
