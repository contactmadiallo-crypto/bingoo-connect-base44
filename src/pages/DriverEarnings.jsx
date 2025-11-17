import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Package, Award, Calendar, Download, Receipt, ArrowLeft } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ExpenseTracker from "../components/driver/ExpenseTracker";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function DriverEarnings() {
  const [timeRange, setTimeRange] = useState("week");
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);

  useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      return currentUser;
    },
  });

  useQuery({
    queryKey: ['driver-profile', user?.email],
    queryFn: async () => {
      const drivers = await base44.entities.DeliveryPartner.list();
      const myDriver = drivers.find(d => d.email === user.email || d.created_by === user.email);
      setDriver(myDriver);
      return myDriver;
    },
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['driver-all-orders', driver?.id],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!driver?.id,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['driver-expenses', driver?.id],
    queryFn: () => base44.entities.DriverExpense.filter({ driver_id: driver.id }),
    enabled: !!driver?.id,
  });

  const myOrders = useMemo(() => {
    return orders.filter(o => o.delivery_partner_id === driver?.id && o.status === 'delivered');
  }, [orders, driver]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const ranges = {
      day: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      all: new Date(0)
    };
    const startDate = ranges[timeRange] || ranges.week;
    return myOrders.filter(o => new Date(o.created_date) >= startDate);
  }, [myOrders, timeRange]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const ranges = {
      day: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      all: new Date(0)
    };
    const startDate = ranges[timeRange] || ranges.week;
    return expenses.filter(e => new Date(e.date) >= startDate);
  }, [expenses, timeRange]);

  const earnings = useMemo(() => {
    const totalBase = filteredOrders.reduce((sum, o) => sum + (o.driver_earnings || 0), 0);
    const totalTips = filteredOrders.reduce((sum, o) => sum + (o.tip_amount || 0), 0);
    const totalBonuses = 0; // Can be calculated based on performance
    const totalGross = totalBase + totalTips + totalBonuses;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalNet = totalGross - totalExpenses;

    return {
      gross: totalGross,
      base: totalBase,
      tips: totalTips,
      bonuses: totalBonuses,
      expenses: totalExpenses,
      net: totalNet,
      count: filteredOrders.length,
      avgPerOrder: filteredOrders.length > 0 ? totalGross / filteredOrders.length : 0
    };
  }, [filteredOrders, filteredExpenses]);

  const earningsBreakdown = [
    { name: 'Frais de Base', value: earnings.base, color: COLORS[0] },
    { name: 'Pourboires', value: earnings.tips, color: COLORS[1] },
    { name: 'Bonus', value: earnings.bonuses, color: COLORS[2] }
  ];

  const dailyEarnings = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, o) => {
      const date = new Date(o.created_date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { date, base: 0, tips: 0, count: 0 };
      acc[date].base += (o.driver_earnings || 0);
      acc[date].tips += (o.tip_amount || 0);
      acc[date].count += 1;
      return acc;
    }, {});
    return Object.values(grouped).map(d => ({
      ...d,
      total: d.base + d.tips
    }));
  }, [filteredOrders]);

  const exportToCSV = () => {
    const headers = ['Date', 'Commande', 'Restaurant', 'Frais Base', 'Pourboire', 'Total'];
    const rows = filteredOrders.map(o => [
      new Date(o.created_date).toLocaleDateString(),
      o.order_number,
      o.restaurant_name,
      (o.driver_earnings || 0).toFixed(2),
      (o.tip_amount || 0).toFixed(2),
      ((o.driver_earnings || 0) + (o.tip_amount || 0)).toFixed(2)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">💰 Mes Revenus</h1>
            <p className="text-slate-600">Gérez et analysez vos revenus et dépenses</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette Semaine</SelectItem>
                <SelectItem value="month">Ce Mois</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="pt-6">
                  <DollarSign className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Revenu Net</p>
                  <p className="text-3xl font-bold">{earnings.net.toFixed(0)} CFA</p>
                  <p className="text-xs mt-2 opacity-80">Après dépenses</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 mb-2 text-blue-600" />
                  <p className="text-sm text-slate-600 mb-1">Revenu Brut</p>
                  <p className="text-3xl font-bold text-blue-700">{earnings.gross.toFixed(0)} CFA</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Package className="w-8 h-8 mb-2 text-purple-600" />
                  <p className="text-sm text-slate-600 mb-1">Livraisons</p>
                  <p className="text-3xl font-bold text-purple-700">{earnings.count}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Award className="w-8 h-8 mb-2 text-orange-600" />
                  <p className="text-sm text-slate-600 mb-1">Moy./Livraison</p>
                  <p className="text-3xl font-bold text-orange-700">{earnings.avgPerOrder.toFixed(0)} CFA</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={earningsBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value.toFixed(0)} CFA`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {earningsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détails des Revenus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Frais de Base</span>
                    <span className="text-lg font-bold text-green-700">{earnings.base.toFixed(0)} CFA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Pourboires</span>
                    <span className="text-lg font-bold text-blue-700">{earnings.tips.toFixed(0)} CFA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Bonus</span>
                    <span className="text-lg font-bold text-orange-700">{earnings.bonuses.toFixed(0)} CFA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <span className="text-sm font-medium">Dépenses</span>
                    <span className="text-lg font-bold text-red-700">-{earnings.expenses.toFixed(0)} CFA</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
                    <span className="font-semibold">Revenu Net</span>
                    <span className="text-2xl font-bold text-green-700">{earnings.net.toFixed(0)} CFA</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Évolution des Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="base" stackId="1" stroke="#10b981" fill="#10b981" name="Frais Base" />
                    <Area type="monotone" dataKey="tips" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Pourboires" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Aucune transaction</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-sm text-slate-600">{order.restaurant_name}</p>
                          <p className="text-xs text-slate-500">{new Date(order.created_date).toLocaleString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {((order.driver_earnings || 0) + (order.tip_amount || 0)).toFixed(0)} CFA
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Base: {(order.driver_earnings || 0).toFixed(0)}</Badge>
                            {order.tip_amount > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50">Tip: {order.tip_amount.toFixed(0)}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracker driver={driver} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}