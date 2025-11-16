import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Store, Truck } from "lucide-react";
import StatsCard from "../components/work/StatsCard";
import { Badge } from "@/components/ui/badge";

export default function PlatformFinance() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list(),
    initialData: [],
  });

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
    initialData: [],
  });

  const filteredOrders = selectedRestaurant === "all" 
    ? orders 
    : orders.filter(o => o.restaurant_id === selectedRestaurant);

  // Three-way split calculation
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const platformCommission = filteredOrders.reduce((sum, o) => sum + (o.platform_commission || 0), 0);
  const deliveryEarnings = filteredOrders.filter(o => o.order_type === 'delivery').reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
  const restaurantEarnings = totalRevenue - platformCommission - deliveryEarnings;

  const restaurantBreakdown = restaurants.map(restaurant => {
    const restaurantOrders = orders.filter(o => o.restaurant_id === restaurant.id);
    const revenue = restaurantOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const commission = restaurantOrders.reduce((sum, o) => sum + (o.platform_commission || 0), 0);
    const delivery = restaurantOrders.filter(o => o.order_type === 'delivery').reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
    const earnings = revenue - commission - delivery;
    
    return {
      ...restaurant,
      orderCount: restaurantOrders.length,
      totalRevenue: revenue,
      platformCommission: commission,
      deliveryEarnings: delivery,
      restaurantEarnings: earnings
    };
  }).filter(r => r.orderCount > 0);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">💰 Income Split Calculator</h1>
          <p className="text-slate-600">See how revenue is split between Platform, Restaurants & Delivery Partners</p>
        </div>

        <div className="mb-6">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Restaurants</SelectItem>
              {restaurants.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Revenue" 
            value={`$${totalRevenue.toFixed(2)}`} 
            icon={DollarSign} 
            gradient="bg-gradient-to-br from-blue-500 to-blue-600" 
          />
          <StatsCard 
            title="Your Commission" 
            value={`$${platformCommission.toFixed(2)}`} 
            icon={TrendingUp} 
            gradient="bg-gradient-to-br from-green-500 to-green-600" 
          />
          <StatsCard 
            title="Restaurant Earnings" 
            value={`$${restaurantEarnings.toFixed(2)}`} 
            icon={Store} 
            gradient="bg-gradient-to-br from-orange-500 to-orange-600" 
          />
          <StatsCard 
            title="Delivery Earnings" 
            value={`$${deliveryEarnings.toFixed(2)}`} 
            icon={Truck} 
            gradient="bg-gradient-to-br from-purple-500 to-purple-600" 
          />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Income Split Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Total Customer Payments</p>
                  <p className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <p className="text-xl font-semibold">{filteredOrders.length}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm font-semibold text-slate-700 mb-1">💼 Your Platform Commission</p>
                  <p className="text-3xl font-bold text-green-600">${platformCommission.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalRevenue > 0 ? ((platformCommission / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
                  </p>
                  <p className="text-xs text-slate-600 mt-1">From restaurant sales commission</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <p className="text-sm font-semibold text-slate-700 mb-1">🍴 Restaurant Gets</p>
                  <p className="text-3xl font-bold text-orange-600">${restaurantEarnings.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalRevenue > 0 ? ((restaurantEarnings / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Food sales minus commission</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <p className="text-sm font-semibold text-slate-700 mb-1">🚚 Delivery Partner Gets</p>
                  <p className="text-3xl font-bold text-purple-600">${deliveryEarnings.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {totalRevenue > 0 ? ((deliveryEarnings / totalRevenue) * 100).toFixed(1) : 0}% of total revenue
                  </p>
                  <p className="text-xs text-slate-600 mt-1">From delivery fees collected</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold mb-2">How It Works:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Customer pays: <span className="font-semibold">${totalRevenue.toFixed(2)}</span></li>
                  <li>• Platform takes: <span className="font-semibold text-green-600">${platformCommission.toFixed(2)}</span> (commission on food)</li>
                  <li>• Delivery partner takes: <span className="font-semibold text-purple-600">${deliveryEarnings.toFixed(2)}</span> (delivery fees)</li>
                  <li>• Restaurant receives: <span className="font-semibold text-orange-600">${restaurantEarnings.toFixed(2)}</span> (remaining balance)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-Restaurant Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restaurantBreakdown.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No orders yet</p>
              ) : (
                restaurantBreakdown.map((restaurant) => (
                  <div key={restaurant.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                        <p className="text-sm text-slate-600">{restaurant.orderCount} orders</p>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700">
                        {restaurant.commission_rate}% commission
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Total Revenue</p>
                        <p className="text-lg font-semibold text-blue-600">
                          ${restaurant.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Your Commission</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${restaurant.platformCommission.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Restaurant Gets</p>
                        <p className="text-lg font-semibold text-orange-600">
                          ${restaurant.restaurantEarnings.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Delivery Fees</p>
                        <p className="text-lg font-semibold text-purple-600">
                          ${restaurant.deliveryEarnings.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}