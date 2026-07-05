import React, { useState, useMemo, lazy, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileSelect } from "@/components/ui/mobile-select";
import { TrendingUp, Clock, DollarSign, Star, CheckCircle, XCircle, MapPin, Award, Calendar } from "lucide-react";

const AnalyticsDashboardMapInner = lazy(() => import("./AnalyticsDashboardMapInner"));

export default function AnalyticsDashboard({ driver }) {
  const [timeRange, setTimeRange] = useState("week");

  const { data: orders = [] } = useQuery({
    queryKey: ['driver-analytics-orders', driver?.id],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!driver?.id,
  });

  const myCompletedOrders = useMemo(() => {
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
    return myCompletedOrders.filter(o => new Date(o.created_date) >= startDate);
  }, [myCompletedOrders, timeRange]);

  const analytics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const avgDeliveryTime = totalOrders > 0
      ? filteredOrders.reduce((sum, o) => sum + (o.actual_delivery_time || 0), 0) / totalOrders
      : 0;

    const totalEarnings = filteredOrders.reduce((sum, o) => sum + (o.driver_earnings || 0), 0);
    const totalTips = filteredOrders.reduce((sum, o) => sum + (o.tip_amount || 0), 0);

    const ratedOrders = filteredOrders.filter(o => o.customer_rating);
    const avgRating = ratedOrders.length > 0
      ? ratedOrders.reduce((sum, o) => sum + o.customer_rating, 0) / ratedOrders.length
      : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratedOrders.filter(o => o.customer_rating === rating).length
    }));

    const hourlyEarnings = filteredOrders.reduce((acc, o) => {
      const hour = new Date(o.created_date).getHours();
      if (!acc[hour]) acc[hour] = { hour, earnings: 0, count: 0 };
      acc[hour].earnings += (o.driver_earnings || 0) + (o.tip_amount || 0);
      acc[hour].count += 1;
      return acc;
    }, {});

    const peakHours = Object.values(hourlyEarnings)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    const dailyEarnings = filteredOrders.reduce((acc, o) => {
      const day = new Date(o.created_date).toLocaleDateString('fr-FR', { weekday: 'long' });
      if (!acc[day]) acc[day] = { day, earnings: 0, count: 0 };
      acc[day].earnings += (o.driver_earnings || 0) + (o.tip_amount || 0);
      acc[day].count += 1;
      return acc;
    }, {});

    const topDays = Object.values(dailyEarnings)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 7);

    const deliveryZones = filteredOrders
      .filter(o => o.customer_location?.lat && o.customer_location?.lng)
      .reduce((acc, o) => {
        const key = `${o.customer_location.lat.toFixed(3)},${o.customer_location.lng.toFixed(3)}`;
        if (!acc[key]) {
          acc[key] = {
            lat: o.customer_location.lat,
            lng: o.customer_location.lng,
            count: 0,
            earnings: 0
          };
        }
        acc[key].count += 1;
        acc[key].earnings += (o.driver_earnings || 0) + (o.tip_amount || 0);
        return acc;
      }, {});

    const topZones = Object.values(deliveryZones)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const centerLat = topZones.length > 0 
      ? topZones.reduce((sum, z) => sum + z.lat, 0) / topZones.length
      : 14.6928;
    const centerLng = topZones.length > 0
      ? topZones.reduce((sum, z) => sum + z.lng, 0) / topZones.length
      : -17.4467;

    return {
      totalOrders,
      avgDeliveryTime: avgDeliveryTime.toFixed(1),
      totalEarnings: totalEarnings.toFixed(0),
      totalTips: totalTips.toFixed(0),
      avgRating: avgRating.toFixed(1),
      ratedOrdersCount: ratedOrders.length,
      ratingDistribution,
      peakHours,
      topDays,
      topZones,
      mapCenter: [centerLat, centerLng]
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">📊 Mes Statistiques</h2>
        <MobileSelect
          value={timeRange}
          onValueChange={setTimeRange}
          options={[
            { value: "day", label: "Aujourd'hui" },
            { value: "week", label: "Cette Semaine" },
            { value: "month", label: "Ce Mois" },
            { value: "all", label: "Tout" },
          ]}
          ariaLabel="Time range"
          className="w-full sm:w-40"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <Badge variant="outline" className="text-xs sm:text-xs">Moy.</Badge>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-blue-600">{analytics.avgDeliveryTime}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">minutes/livraison</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <Badge variant="outline" className="text-xs sm:text-xs">Total</Badge>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-600">{analytics.totalEarnings}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">CFA gagnés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              <Badge variant="outline" className="text-xs sm:text-xs">Note</Badge>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-yellow-600">{analytics.avgRating}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">sur {analytics.ratedOrdersCount} avis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <Badge variant="outline" className="text-xs sm:text-xs">Total</Badge>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-purple-600">{analytics.totalOrders}</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">livraisons</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              Répartition des Gains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Frais de Livraison</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">{analytics.totalEarnings} CFA</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Pourboires</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-700">{analytics.totalTips} CFA</p>
                </div>
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                <div>
                  <p className="text-xs sm:text-sm text-purple-600 font-semibold">Total Gagné</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                    {(parseFloat(analytics.totalEarnings) + parseFloat(analytics.totalTips)).toFixed(0)} CFA
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Star className="w-5 h-5 text-yellow-600" />
              Distribution des Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.ratingDistribution.map(({ rating, count }) => {
                const maxCount = Math.max(...analytics.ratingDistribution.map(r => r.count));
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-semibold">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="flex-1 h-6 sm:h-8 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${width}%` }}
                      >
                        {count > 0 && (
                          <span className="text-xs font-semibold text-white">{count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-5 h-5 text-orange-600" />
            Heures de Pointe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.peakHours.map(({ hour, earnings, count }) => (
              <div key={hour} className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <p className="text-2xl sm:text-3xl font-bold text-orange-700">
                  {hour}h - {hour + 1}h
                </p>
                <p className="text-sm text-slate-600 mt-2">{count} livraisons</p>
                <p className="text-lg font-bold text-green-600 mt-1">{earnings.toFixed(0)} CFA</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Meilleurs Jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.topDays.map(({ day, earnings, count }) => (
              <div key={day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-sm sm:text-base capitalize">{day}</p>
                  <p className="text-xs sm:text-sm text-slate-600">{count} livraisons</p>
                </div>
                <p className="text-base sm:text-lg font-bold text-green-600">{earnings.toFixed(0)} CFA</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {analytics.topZones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="w-5 h-5 text-red-600" />
              Zones de Livraison Fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-96 rounded-lg overflow-hidden">
              <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-400 text-sm">Chargement de la carte…</div>}>
                <AnalyticsDashboardMapInner topZones={analytics.topZones} mapCenter={analytics.mapCenter} />
              </Suspense>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Les zones rouges indiquent vos livraisons les plus fréquentes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}