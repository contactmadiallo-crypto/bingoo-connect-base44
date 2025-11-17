import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Package, Gift, Calendar, Download, Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

export default function DriverEarnings() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeView, setTimeView] = useState("week"); // week, month, all

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ['driver-profile', user?.email],
    queryFn: async () => {
      const drivers = await base44.entities.DeliveryPartner.list();
      const myDriver = drivers.find(d => d.email === user.email || d.created_by === user.email);
      return myDriver || null;
    },
    enabled: !!user?.email,
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ['driver-all-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!driver,
  });

  const myCompletedOrders = useMemo(() => {
    return allOrders.filter(o => 
      o.delivery_partner_id === driver?.id && o.status === 'delivered'
    );
  }, [allOrders, driver]);

  const filteredOrders = useMemo(() => {
    let filtered = myCompletedOrders;
    
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate >= start && orderDate <= end;
      });
    } else if (timeView === 'week') {
      const now = new Date();
      const weekStart = startOfWeek(now);
      filtered = filtered.filter(o => new Date(o.created_date) >= weekStart);
    } else if (timeView === 'month') {
      const now = new Date();
      const monthStart = startOfMonth(now);
      filtered = filtered.filter(o => new Date(o.created_date) >= monthStart);
    }
    
    return filtered;
  }, [myCompletedOrders, dateRange, timeView]);

  const earnings = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => 
      sum + (o.driver_earnings || 0) + (o.tip_amount || 0), 0
    );
    const baseFees = filteredOrders.reduce((sum, o) => sum + (o.driver_earnings || 0), 0);
    const tips = filteredOrders.reduce((sum, o) => sum + (o.tip_amount || 0), 0);
    const avgPerOrder = filteredOrders.length > 0 ? total / filteredOrders.length : 0;
    
    return { total, baseFees, tips, avgPerOrder, orderCount: filteredOrders.length };
  }, [filteredOrders]);

  const weeklyData = useMemo(() => {
    if (filteredOrders.length === 0) return [];
    
    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: new Date(filteredOrders[filteredOrders.length - 1].created_date),
      end: now
    }).slice(-8);
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });
      
      const earnings = weekOrders.reduce((sum, o) => 
        sum + (o.driver_earnings || 0) + (o.tip_amount || 0), 0
      );
      
      return {
        week: format(weekStart, 'MMM dd'),
        earnings: parseFloat(earnings.toFixed(2)),
        orders: weekOrders.length,
        tips: weekOrders.reduce((sum, o) => sum + (o.tip_amount || 0), 0)
      };
    });
  }, [filteredOrders]);

  const monthlyData = useMemo(() => {
    if (filteredOrders.length === 0) return [];
    
    const now = new Date();
    const months = eachMonthOfInterval({
      start: new Date(filteredOrders[filteredOrders.length - 1].created_date),
      end: now
    }).slice(-6);
    
    return months.map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const earnings = monthOrders.reduce((sum, o) => 
        sum + (o.driver_earnings || 0) + (o.tip_amount || 0), 0
      );
      
      return {
        month: format(monthStart, 'MMM yyyy'),
        earnings: parseFloat(earnings.toFixed(2)),
        orders: monthOrders.length,
        baseFees: monthOrders.reduce((sum, o) => sum + (o.driver_earnings || 0), 0),
        tips: monthOrders.reduce((sum, o) => sum + (o.tip_amount || 0), 0)
      };
    });
  }, [filteredOrders]);

  const dailyData = useMemo(() => {
    if (filteredOrders.length === 0) return [];
    
    const now = new Date();
    const days = eachDayOfInterval({
      start: new Date(now.setDate(now.getDate() - 7)),
      end: new Date()
    });
    
    return days.map(day => {
      const dayOrders = filteredOrders.filter(o => 
        format(new Date(o.created_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const earnings = dayOrders.reduce((sum, o) => 
        sum + (o.driver_earnings || 0) + (o.tip_amount || 0), 0
      );
      
      return {
        day: format(day, 'EEE'),
        earnings: parseFloat(earnings.toFixed(2)),
        orders: dayOrders.length
      };
    });
  }, [filteredOrders]);

  const earningsBreakdown = [
    { name: 'Base Fees', value: earnings.baseFees, color: '#10B981' },
    { name: 'Tips', value: earnings.tips, color: '#3B82F6' }
  ];

  const exportToCSV = () => {
    const csvData = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Date': format(new Date(order.created_date), 'yyyy-MM-dd HH:mm'),
      'Restaurant': order.restaurant_name,
      'Customer': order.customer_name,
      'Base Fee': (order.driver_earnings || 0).toFixed(2),
      'Tip': (order.tip_amount || 0).toFixed(2),
      'Total': ((order.driver_earnings || 0) + (order.tip_amount || 0)).toFixed(2),
      'Distance': order.distance_km || 'N/A'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `driver-earnings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading earnings data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Driver Profile</h2>
            <p className="text-slate-600">Please sign up as a driver first</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">💰 Earnings Dashboard</h1>
            <p className="text-slate-600">Track your income and performance</p>
          </div>
          <Button onClick={exportToCSV} variant="outline" disabled={filteredOrders.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2">Quick View</Label>
                <Select value={timeView} onValueChange={setTimeView}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {timeView === 'custom' && (
                <>
                  <div className="flex-1 min-w-[150px]">
                    <Label className="mb-2">Start Date</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <Label className="mb-2">End Date</Label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">${earnings.total.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Deliveries</p>
              <p className="text-3xl font-bold">{earnings.orderCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Gift className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Tips Received</p>
              <p className="text-3xl font-bold">${earnings.tips.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Avg per Order</p>
              <p className="text-3xl font-bold">${earnings.avgPerOrder.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Daily Earnings (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="earnings" fill="#10B981" name="Earnings ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={earningsBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                    outerRadius={100}
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
        </div>

        <Tabs defaultValue="weekly" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Trend</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} name="Total Earnings ($)" />
                    <Line type="monotone" dataKey="tips" stroke="#3B82F6" strokeWidth={2} name="Tips ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="baseFees" stackId="a" fill="#10B981" name="Base Fees ($)" />
                    <Bar dataKey="tips" stackId="a" fill="#3B82F6" name="Tips ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const baseFee = order.driver_earnings || 0;
                  const tip = order.tip_amount || 0;
                  const total = baseFee + tip;

                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold">{order.order_number}</p>
                          <Badge variant="outline" className="text-xs">{order.restaurant_name}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {format(new Date(order.created_date), 'MMM dd, yyyy • HH:mm')}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-green-600">Base: ${baseFee.toFixed(2)}</span>
                          {tip > 0 && <span className="text-blue-600">Tip: ${tip.toFixed(2)}</span>}
                          {order.distance_km && <span className="text-slate-500">{order.distance_km} km</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
                        {order.customer_rating && (
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <span className="text-xs text-yellow-600">★ {order.customer_rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}