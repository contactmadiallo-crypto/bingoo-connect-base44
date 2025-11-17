import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Clock, Users, Star, Calendar, Loader2 } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import AdminAuthGuard from "../components/AdminAuthGuard";
import { toast } from "sonner";

function RestaurantAnalyticsContent() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [timeRange, setTimeRange] = useState("week");
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const [feedbackAnalysis, setFeedbackAnalysis] = useState(null);

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants-analytics'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ['orders-analytics'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['reviews-analytics'],
    queryFn: () => base44.entities.RestaurantReview.list(),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-analytics'],
    queryFn: () => base44.entities.MenuItem.list(),
  });

  const analyzeFeedbackMutation = useMutation({
    mutationFn: async () => {
      const reviews = filteredReviews.map(r => ({
        rating: r.rating,
        comment: r.comment,
        food_rating: r.food_rating,
        service_rating: r.service_rating,
        delivery_rating: r.delivery_rating
      }));

      const prompt = `Analyze the following customer reviews for a restaurant and provide actionable insights:

Reviews: ${JSON.stringify(reviews, null, 2)}

Provide a comprehensive analysis including:
1. Overall sentiment summary
2. Top 3 positive themes
3. Top 3 negative themes/areas for improvement
4. Specific actionable recommendations
5. Priority level for each recommendation (high/medium/low)

Return the analysis in JSON format.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_sentiment: { type: "string" },
            positive_themes: { type: "array", items: { type: "string" } },
            negative_themes: { type: "array", items: { type: "string" } },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setFeedbackAnalysis(data);
      setAnalyzingFeedback(false);
      toast.success("Analyse terminée");
    },
    onError: () => {
      setAnalyzingFeedback(false);
      toast.error("Erreur lors de l'analyse");
    }
  });

  const getDateRange = () => {
    const now = new Date();
    if (timeRange === "day") return { start: startOfDay(now), end: endOfDay(now) };
    if (timeRange === "week") return { start: subDays(now, 7), end: now };
    if (timeRange === "month") return { start: subDays(now, 30), end: now };
    return { start: subDays(now, 7), end: now };
  };

  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange();
    return allOrders.filter(o => {
      const orderDate = new Date(o.created_date);
      const matchDate = orderDate >= start && orderDate <= end;
      const matchRestaurant = selectedRestaurant === "all" || o.restaurant_id === selectedRestaurant;
      return matchDate && matchRestaurant && o.status === 'delivered';
    });
  }, [allOrders, selectedRestaurant, timeRange]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter(r => 
      selectedRestaurant === "all" || r.restaurant_id === selectedRestaurant
    );
  }, [allReviews, selectedRestaurant]);

  const salesStats = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const count = filteredOrders.length;
    const avgOrder = count > 0 ? total / count : 0;

    return { total, count, avgOrder };
  }, [filteredOrders]);

  const salesByDay = useMemo(() => {
    const byDay = {};
    filteredOrders.forEach(order => {
      const day = format(new Date(order.created_date), 'yyyy-MM-dd');
      if (!byDay[day]) byDay[day] = { day, revenue: 0, orders: 0 };
      byDay[day].revenue += order.total_amount || 0;
      byDay[day].orders += 1;
    });
    return Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day));
  }, [filteredOrders]);

  const salesByCategory = useMemo(() => {
    const byCategory = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menu_item_id);
        const category = menuItem?.category || 'other';
        if (!byCategory[category]) byCategory[category] = { category, revenue: 0, count: 0 };
        byCategory[category].revenue += (item.price * item.quantity);
        byCategory[category].count += item.quantity;
      });
    });
    return Object.values(byCategory).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, menuItems]);

  const topItems = useMemo(() => {
    const itemSales = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += (item.price * item.quantity);
      });
    });
    return Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredOrders]);

  const ordersByHour = useMemo(() => {
    const byHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0 }));
    filteredOrders.forEach(order => {
      const hour = new Date(order.created_date).getHours();
      byHour[hour].orders += 1;
    });
    return byHour;
  }, [filteredOrders]);

  const ordersByDayOfWeek = useMemo(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const byDay = days.map(day => ({ day, orders: 0, revenue: 0 }));
    filteredOrders.forEach(order => {
      const dayIndex = new Date(order.created_date).getDay();
      byDay[dayIndex].orders += 1;
      byDay[dayIndex].revenue += order.total_amount || 0;
    });
    return byDay;
  }, [filteredOrders]);

  const deliveryMetrics = useMemo(() => {
    const deliveryOrders = filteredOrders.filter(o => o.order_type === 'delivery' && o.actual_delivery_time);
    const avgTime = deliveryOrders.length > 0
      ? deliveryOrders.reduce((sum, o) => sum + (o.actual_delivery_time || 0), 0) / deliveryOrders.length
      : 0;

    const byDriver = {};
    deliveryOrders.forEach(order => {
      if (order.driver_name) {
        if (!byDriver[order.driver_name]) {
          byDriver[order.driver_name] = { name: order.driver_name, orders: 0, totalTime: 0, avgTime: 0 };
        }
        byDriver[order.driver_name].orders += 1;
        byDriver[order.driver_name].totalTime += (order.actual_delivery_time || 0);
      }
    });

    Object.values(byDriver).forEach(driver => {
      driver.avgTime = driver.orders > 0 ? driver.totalTime / driver.orders : 0;
    });

    return {
      avgTime: Math.round(avgTime),
      totalDeliveries: deliveryOrders.length,
      byDriver: Object.values(byDriver).sort((a, b) => b.orders - a.orders).slice(0, 5)
    };
  }, [filteredOrders]);

  const ratingStats = useMemo(() => {
    const totalRating = filteredReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = filteredReviews.length > 0 ? totalRating / filteredReviews.length : 0;
    
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      stars: star,
      count: filteredReviews.filter(r => r.rating === star).length
    }));

    return { avgRating: avgRating.toFixed(1), count: filteredReviews.length, distribution };
  }, [filteredReviews]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 Analytics Restaurant</h1>
          <p className="text-slate-600">Analyses et rapports détaillés</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les Restaurants</SelectItem>
              {restaurants.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette Semaine</SelectItem>
              <SelectItem value="month">Ce Mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Revenu Total</p>
                  <p className="text-3xl font-bold text-green-600">{salesStats.total.toFixed(0)} CFA</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Commandes</p>
                  <p className="text-3xl font-bold text-blue-600">{salesStats.count}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Panier Moyen</p>
                  <p className="text-3xl font-bold text-purple-600">{salesStats.avgOrder.toFixed(0)} CFA</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Note Moyenne</p>
                  <p className="text-3xl font-bold text-yellow-600">{ratingStats.avgRating} ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenu (CFA)" />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Commandes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ventes par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top 10 Articles les Plus Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#3b82f6" name="Quantité" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenu (CFA)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Commandes par Heure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8b5cf6" name="Commandes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commandes par Jour de la Semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByDayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#f59e0b" name="Commandes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Métriques de Livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Temps Moyen de Livraison</p>
                <p className="text-3xl font-bold text-blue-600">{deliveryMetrics.avgTime} min</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Livraisons</p>
                <p className="text-3xl font-bold text-green-600">{deliveryMetrics.totalDeliveries}</p>
              </div>
            </div>

            {deliveryMetrics.byDriver.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Performance par Chauffeur</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deliveryMetrics.byDriver}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#3b82f6" name="Commandes" />
                    <Bar dataKey="avgTime" fill="#10b981" name="Temps Moyen (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Analyse des Avis Clients
              </div>
              <Button 
                onClick={() => {
                  setAnalyzingFeedback(true);
                  analyzeFeedbackMutation.mutate();
                }}
                disabled={analyzingFeedback || filteredReviews.length === 0}
              >
                {analyzingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Analyser avec IA"
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Distribution des Notes</h4>
                <div className="space-y-2">
                  {ratingStats.distribution.map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-12 text-sm">{stars} ⭐</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-4">
                        <div 
                          className="bg-yellow-500 h-4 rounded-full"
                          style={{ width: `${ratingStats.count > 0 ? (count / ratingStats.count) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm text-slate-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Statistiques</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Avis:</span>
                    <span className="font-semibold">{ratingStats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Note Moyenne:</span>
                    <span className="font-semibold">{ratingStats.avgRating} / 5</span>
                  </div>
                </div>
              </div>
            </div>

            {feedbackAnalysis && (
              <div className="border-t pt-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">💡 Analyse Générale</h4>
                  <p className="text-sm text-slate-700">{feedbackAnalysis.overall_sentiment}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">✅ Points Positifs</h4>
                    <ul className="space-y-2">
                      {feedbackAnalysis.positive_themes?.map((theme, idx) => (
                        <li key={idx} className="text-sm bg-green-50 p-2 rounded">• {theme}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-red-700">⚠️ Points à Améliorer</h4>
                    <ul className="space-y-2">
                      {feedbackAnalysis.negative_themes?.map((theme, idx) => (
                        <li key={idx} className="text-sm bg-red-50 p-2 rounded">• {theme}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">🎯 Recommandations</h4>
                  <div className="space-y-3">
                    {feedbackAnalysis.recommendations?.map((rec, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">{rec.recommendation}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RestaurantAnalytics() {
  return (
    <AdminAuthGuard>
      <RestaurantAnalyticsContent />
    </AdminAuthGuard>
  );
}