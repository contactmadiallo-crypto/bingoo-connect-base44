import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Navigation, DollarSign, Clock, TrendingUp, Loader2, Zap } from "lucide-react";

export default function RouteOptimizer({ availableOrders, driverLocation, onAcceptBatch }) {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [showOptimization, setShowOptimization] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const nearbyOrders = useMemo(() => {
    if (!driverLocation || availableOrders.length === 0) return [];
    
    return availableOrders
      .filter(o => o.customer_location?.lat && o.customer_location?.lng)
      .map(order => {
        const distance = calculateDistance(
          driverLocation.lat,
          driverLocation.lng,
          order.customer_location.lat,
          order.customer_location.lng
        );
        return { ...order, distanceFromDriver: distance };
      })
      .filter(o => o.distanceFromDriver <= 5)
      .sort((a, b) => a.distanceFromDriver - b.distanceFromDriver);
  }, [availableOrders, driverLocation]);

  const batchableOrders = useMemo(() => {
    const batches = [];
    const processed = new Set();

    nearbyOrders.forEach((order1, i) => {
      if (processed.has(order1.id)) return;
      
      const batch = [order1];
      nearbyOrders.forEach((order2, j) => {
        if (i !== j && !processed.has(order2.id)) {
          const distance = calculateDistance(
            order1.customer_location.lat,
            order1.customer_location.lng,
            order2.customer_location.lat,
            order2.customer_location.lng
          );
          
          if (distance <= 2) {
            batch.push(order2);
            processed.add(order2.id);
          }
        }
      });

      if (batch.length >= 2) {
        const totalEarnings = batch.reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
        const avgDistance = batch.reduce((sum, o) => sum + o.distanceFromDriver, 0) / batch.length;
        batches.push({ orders: batch, totalEarnings, avgDistance });
        batch.forEach(o => processed.add(o.id));
      }
    });

    return batches.sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [nearbyOrders]);

  const optimizeRouteMutation = useMutation({
    mutationFn: async (orders) => {
      const locations = orders.map(o => ({
        id: o.id,
        restaurant: o.restaurant_name,
        customer: o.customer_name,
        address: o.customer_address,
        lat: o.customer_location.lat,
        lng: o.customer_location.lng
      }));

      const prompt = `You are a route optimization AI for delivery drivers in Dakar, Senegal.

Driver current location: Lat ${driverLocation.lat}, Lng ${driverLocation.lng}

Delivery locations to optimize:
${locations.map((loc, i) => `${i + 1}. ${loc.restaurant} → ${loc.customer} (${loc.address}) - Lat: ${loc.lat}, Lng: ${loc.lng}`).join('\n')}

Task: Calculate the most efficient delivery route that:
1. Minimizes total travel distance
2. Considers pickup times from restaurants
3. Ensures timely deliveries
4. Optimizes for Dakar traffic patterns

Return ONLY a JSON object with this exact structure:
{
  "route_order": [array of order IDs in optimized sequence],
  "estimated_total_distance_km": number,
  "estimated_total_time_minutes": number,
  "efficiency_score": number (0-100),
  "reasoning": "brief explanation"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            route_order: { type: "array", items: { type: "string" } },
            estimated_total_distance_km: { type: "number" },
            estimated_total_time_minutes: { type: "number" },
            efficiency_score: { type: "number" },
            reasoning: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setOptimizedRoute(data);
      setShowOptimization(true);
      setIsOptimizing(false);
    },
    onError: () => {
      setIsOptimizing(false);
      alert("Erreur lors de l'optimisation de l'itinéraire");
    }
  });

  const handleOptimizeBatch = (batch) => {
    setIsOptimizing(true);
    optimizeRouteMutation.mutate(batch.orders);
  };

  return (
    <>
      {batchableOrders.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-purple-600" />
              Optimisation d'Itinéraire AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 mb-3">
              🚀 Groupez ces commandes proches pour maximiser vos gains!
            </p>
            
            {batchableOrders.map((batch, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge className="bg-purple-100 text-purple-700 mb-2">
                      {batch.orders.length} Commandes Groupées
                    </Badge>
                    <div className="space-y-1">
                      {batch.orders.map((order) => (
                        <p key={order.id} className="text-sm">
                          📦 {order.restaurant_name} → {order.customer_name}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {batch.totalEarnings.toFixed(0)} CFA
                    </p>
                    <p className="text-xs text-slate-500">
                      ~{batch.avgDistance.toFixed(1)} km
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleOptimizeBatch(batch)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimisation...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Optimiser l'Itinéraire
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={showOptimization} onOpenChange={setShowOptimization}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-purple-600" />
              Itinéraire Optimisé par AI
            </DialogTitle>
          </DialogHeader>

          {optimizedRoute && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <Navigation className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Distance</p>
                  <p className="text-lg font-bold text-blue-700">
                    {optimizedRoute.estimated_total_distance_km.toFixed(1)} km
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Temps</p>
                  <p className="text-lg font-bold text-green-700">
                    {optimizedRoute.estimated_total_time_minutes} min
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Efficacité</p>
                  <p className="text-lg font-bold text-purple-700">
                    {optimizedRoute.efficiency_score}%
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Ordre de Livraison Optimisé:</p>
                <div className="space-y-2">
                  {optimizedRoute.route_order.map((orderId, idx) => {
                    const order = nearbyOrders.find(o => o.id === orderId);
                    if (!order) return null;
                    return (
                      <div key={orderId} className="flex items-center gap-3 bg-white p-2 rounded">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{order.restaurant_name}</p>
                          <p className="text-xs text-slate-600">→ {order.customer_name}</p>
                        </div>
                        <p className="text-sm font-bold text-green-600">
                          {(order.delivery_fee || 0).toFixed(0)} CFA
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">💡 Analyse AI:</p>
                <p className="text-sm text-blue-800">{optimizedRoute.reasoning}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptimization(false)}>
              Annuler
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                if (optimizedRoute) {
                  const ordersToAccept = optimizedRoute.route_order.map(id => 
                    nearbyOrders.find(o => o.id === id)
                  ).filter(Boolean);
                  onAcceptBatch(ordersToAccept, optimizedRoute);
                }
                setShowOptimization(false);
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Accepter le Lot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}