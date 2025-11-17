import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Navigation, DollarSign, Clock, TrendingUp, Loader2, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const createNumberedIcon = (number, color = "#8b5cf6") => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${number}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const driverIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"><span style="font-size: 20px;">🚗</span></div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapUpdater({ center, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [center, bounds, map]);
  return null;
}

export default function RouteOptimizer({ availableOrders, driverLocation, driver, onAcceptBatch }) {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [showOptimization, setShowOptimization] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [autoRefreshETA, setAutoRefreshETA] = useState(false);

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

  const isInPreferredZone = (order) => {
    if (!driver?.preferred_zones?.length || !order.customer_location) return true;
    
    return driver.preferred_zones.some(zone => {
      const distance = calculateDistance(
        zone.lat,
        zone.lng,
        order.customer_location.lat,
        order.customer_location.lng
      );
      return distance <= zone.radius_km;
    });
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
        const inPreferredZone = isInPreferredZone(order);
        return { ...order, distanceFromDriver: distance, inPreferredZone };
      })
      .filter(o => o.distanceFromDriver <= 5)
      .sort((a, b) => {
        if (a.inPreferredZone && !b.inPreferredZone) return -1;
        if (!a.inPreferredZone && b.inPreferredZone) return 1;
        return a.distanceFromDriver - b.distanceFromDriver;
      });
  }, [availableOrders, driverLocation, driver]);

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
        const preferredCount = batch.filter(o => o.inPreferredZone).length;
        batches.push({ orders: batch, totalEarnings, avgDistance, preferredCount });
        batch.forEach(o => processed.add(o.id));
      }
    });

    return batches.sort((a, b) => {
      if (a.preferredCount !== b.preferredCount) return b.preferredCount - a.preferredCount;
      return b.totalEarnings - a.totalEarnings;
    });
  }, [nearbyOrders]);

  const optimizeRouteMutation = useMutation({
    mutationFn: async (orders) => {
      const locations = orders.map(o => ({
        id: o.id,
        restaurant: o.restaurant_name,
        customer: o.customer_name,
        address: o.customer_address,
        lat: o.customer_location.lat,
        lng: o.customer_location.lng,
        inPreferredZone: o.inPreferredZone
      }));

      const preferredZonesInfo = driver?.preferred_zones?.length > 0
        ? `\n\nDriver's preferred zones:\n${driver.preferred_zones.map(z => `- ${z.name} (${z.lat}, ${z.lng}) radius ${z.radius_km}km`).join('\n')}`
        : '';

      const prompt = `You are a route optimization AI for delivery drivers in Dakar, Senegal with real-time traffic awareness.

Driver current location: Lat ${driverLocation.lat}, Lng ${driverLocation.lng}
Current time: ${new Date().toLocaleTimeString('fr-FR')} on ${new Date().toLocaleDateString('fr-FR', { weekday: 'long' })}
${preferredZonesInfo}

Delivery locations to optimize:
${locations.map((loc, i) => `${i + 1}. ${loc.restaurant} → ${loc.customer} (${loc.address}) - Lat: ${loc.lat}, Lng: ${loc.lng}${loc.inPreferredZone ? ' [PREFERRED ZONE]' : ''}`).join('\n')}

Task: Calculate the most efficient delivery route considering:
1. Real-time Dakar traffic patterns (rush hours: 7-9am, 12-2pm, 5-8pm)
2. Road conditions and common bottlenecks in Dakar
3. Minimize total travel distance and time
4. Consider pickup times from restaurants
5. Prioritize orders in driver's preferred zones when efficiency is similar
6. Account for weather conditions affecting traffic

Return ONLY a JSON object with this exact structure:
{
  "route_order": [array of order IDs in optimized sequence],
  "estimated_total_distance_km": number,
  "estimated_total_time_minutes": number,
  "efficiency_score": number (0-100),
  "traffic_conditions": "description of current traffic",
  "reasoning": "brief explanation including traffic considerations",
  "waypoints": [{"lat": number, "lng": number, "type": "pickup|delivery", "order_id": "string"}]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            route_order: { type: "array", items: { type: "string" } },
            estimated_total_distance_km: { type: "number" },
            estimated_total_time_minutes: { type: "number" },
            efficiency_score: { type: "number" },
            traffic_conditions: { type: "string" },
            reasoning: { type: "string" },
            waypoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lat: { type: "number" },
                  lng: { type: "number" },
                  type: { type: "string" },
                  order_id: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setOptimizedRoute(data);
      setShowOptimization(true);
      setIsOptimizing(false);
      toast.success("Itinéraire optimisé avec trafic en temps réel!");
    },
    onError: () => {
      setIsOptimizing(false);
      toast.error("Erreur lors de l'optimisation");
    }
  });

  useEffect(() => {
    let interval;
    if (autoRefreshETA && optimizedRoute && selectedBatch) {
      interval = setInterval(() => {
        optimizeRouteMutation.mutate(selectedBatch.orders);
      }, 60000); // Refresh every minute
    }
    return () => clearInterval(interval);
  }, [autoRefreshETA, optimizedRoute, selectedBatch]);

  const handleOptimizeBatch = (batch) => {
    setSelectedBatch(batch);
    setIsOptimizing(true);
    optimizeRouteMutation.mutate(batch.orders);
  };

  const getMapBounds = () => {
    if (!optimizedRoute?.waypoints?.length || !driverLocation) return null;
    
    const allPoints = [
      [driverLocation.lat, driverLocation.lng],
      ...optimizedRoute.waypoints.map(w => [w.lat, w.lng])
    ];
    
    return allPoints;
  };

  const routeCoordinates = useMemo(() => {
    if (!optimizedRoute?.waypoints || !driverLocation) return [];
    
    return [
      [driverLocation.lat, driverLocation.lng],
      ...optimizedRoute.waypoints.map(w => [w.lat, w.lng])
    ];
  }, [optimizedRoute, driverLocation]);

  return (
    <>
      {batchableOrders.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-purple-600" />
              Optimisation d'Itinéraire AI + Trafic
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
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-purple-100 text-purple-700">
                        {batch.orders.length} Commandes
                      </Badge>
                      {batch.preferredCount > 0 && (
                        <Badge className="bg-green-100 text-green-700">
                          ⭐ {batch.preferredCount} Zone Préférée
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {batch.orders.map((order) => (
                        <p key={order.id} className="text-sm flex items-center gap-1">
                          📦 {order.restaurant_name} → {order.customer_name}
                          {order.inPreferredZone && <span className="text-green-600">⭐</span>}
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
                      Optimisation avec Trafic...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Optimiser avec Trafic en Temps Réel
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={showOptimization} onOpenChange={setShowOptimization}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-600" />
                Itinéraire Optimisé par AI + Trafic
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (selectedBatch) {
                    setIsOptimizing(true);
                    optimizeRouteMutation.mutate(selectedBatch.orders);
                  }
                }}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Actualiser ETA
              </Button>
            </DialogTitle>
          </DialogHeader>

          {optimizedRoute && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <Navigation className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Distance</p>
                  <p className="text-lg font-bold text-blue-700">
                    {optimizedRoute.estimated_total_distance_km?.toFixed(1) || '0'} km
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Temps Estimé</p>
                  <p className="text-lg font-bold text-green-700">
                    {optimizedRoute.estimated_total_time_minutes || '0'} min
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Efficacité</p>
                  <p className="text-lg font-bold text-purple-700">
                    {optimizedRoute.efficiency_score || '0'}%
                  </p>
                </div>
              </div>

              {optimizedRoute.traffic_conditions && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">🚦 Conditions de Trafic en Temps Réel:</p>
                      <p className="text-sm text-amber-800">{optimizedRoute.traffic_conditions}</p>
                    </div>
                  </div>
                </div>
              )}

              {routeCoordinates.length > 1 && (
                <div className="h-80 rounded-lg overflow-hidden border-2 border-purple-200">
                  <MapContainer
                    style={{ height: "100%", width: "100%" }}
                    center={driverLocation}
                    zoom={13}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater bounds={getMapBounds()} />
                    
                    <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                      <Popup>📍 Votre Position</Popup>
                    </Marker>

                    {optimizedRoute.waypoints?.map((waypoint, idx) => (
                      <Marker
                        key={idx}
                        position={[waypoint.lat, waypoint.lng]}
                        icon={createNumberedIcon(idx + 1)}
                      >
                        <Popup>
                          <strong>Arrêt {idx + 1}</strong><br />
                          {waypoint.type === 'pickup' ? '🏪 Récupération' : '📦 Livraison'}
                        </Popup>
                      </Marker>
                    ))}

                    <Polyline
                      positions={routeCoordinates}
                      color="#8b5cf6"
                      weight={4}
                      opacity={0.7}
                      dashArray="10, 10"
                    />
                  </MapContainer>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">📍 Ordre de Livraison Optimisé:</p>
                <div className="space-y-2">
                  {optimizedRoute.route_order?.map((orderId, idx) => {
                    const order = nearbyOrders.find(o => o.id === orderId);
                    if (!order) return null;
                    return (
                      <div key={orderId} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{order.restaurant_name}</p>
                          <p className="text-xs text-slate-600">→ {order.customer_name} • {order.customer_address}</p>
                        </div>
                        {order.inPreferredZone && (
                          <span className="text-green-600 text-lg">⭐</span>
                        )}
                        <p className="text-sm font-bold text-green-600">
                          {(order.delivery_fee || 0).toFixed(0)} CFA
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">💡 Analyse AI avec Trafic:</p>
                <p className="text-sm text-blue-800">{optimizedRoute.reasoning}</p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={autoRefreshETA}
                  onChange={(e) => setAutoRefreshETA(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label className="text-sm">
                  🔄 Actualiser automatiquement l'ETA chaque minute
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowOptimization(false);
              setAutoRefreshETA(false);
            }}>
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
                  toast.success(`${ordersToAccept.length} commandes acceptées!`);
                }
                setShowOptimization(false);
                setAutoRefreshETA(false);
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Accepter le Lot ({optimizedRoute?.route_order?.length || 0})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}