import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, DollarSign, Package, AlertTriangle, Settings, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatsCard from "../components/work/StatsCard";
import AdminAuthGuard from "../components/AdminAuthGuard";
import RestaurantReviews from "../components/restaurant/RestaurantReviews";
import MenuManagement from "../components/restaurant/MenuManagement";
import StockManagement from "../components/restaurant/StockManagement";
import OpeningHoursManager from "../components/restaurant/OpeningHoursManager";

function RestaurantAdminContent() {
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("week");
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
    queryKey: ['orders', myRestaurant?.id],
    queryFn: () => {
      if (myRestaurant?.id) {
        return base44.entities.Order.filter({ restaurant_id: myRestaurant.id }, '-created_date');
      }
      return [];
    },
    refetchInterval: 5000,
    enabled: !!myRestaurant,
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: restaurantReviews = [] } = useQuery({
    queryKey: ['restaurant-reviews'],
    queryFn: () => base44.entities.RestaurantReview.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const myRestaurant = restaurants.find(r => r.owner_email === user?.email);

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
  const myRestaurantReviews = restaurantReviews.filter(r => r.restaurant_id === myRestaurant?.id);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🍴 Admin Restaurant</h1>
          <p className="text-slate-600">{myRestaurant?.name || "Gérez votre restaurant"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Commandes Totales" value={stats.totalOrders} icon={ShoppingCart} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatsCard title="Revenus Aujourd'hui" value={`$${stats.todayRevenue.toFixed(2)}`} icon={DollarSign} gradient="bg-gradient-to-br from-green-500 to-green-600" />
          <StatsCard title="Articles Menu" value={stats.menuItems} icon={Package} gradient="bg-gradient-to-br from-purple-500 to-purple-600" />
          <StatsCard
            title="Stock Faible"
            value={stats.lowStock}
            icon={AlertTriangle}
            gradient={stats.lowStock > 0 ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-green-500 to-green-600"}
          />
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="stock">Stocks</TabsTrigger>
            <TabsTrigger value="hours">Horaires</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuManagement restaurant={myRestaurant} menuItems={menuItems} />
          </TabsContent>

          <TabsContent value="stock">
            <StockManagement restaurant={myRestaurant} menuItems={menuItems} />
          </TabsContent>

          <TabsContent value="hours">
            <OpeningHoursManager restaurant={myRestaurant} />
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Avis Clients</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold">
                      {myRestaurantReviews.length > 0
                        ? (myRestaurantReviews.reduce((sum, r) => sum + r.rating, 0) / myRestaurantReviews.length).toFixed(1)
                        : '0'}
                    </span>
                    <span className="text-sm text-slate-600">({myRestaurantReviews.length} avis)</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myRestaurant && <RestaurantReviews restaurant={myRestaurant} user={user} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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