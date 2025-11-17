import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, User, Phone, Package, MessageSquare, Zap, MapPin, Clock } from "lucide-react";
import AdminAuthGuard from "../components/AdminAuthGuard";
import DriverNotificationDialog from "../components/admin/DriverNotificationDialog";
import { toast } from "sonner";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const createDriverIcon = (status, isAvailable) => {
  const colors = {
    active: "#10b981",
    offline: "#94a3b8",
    inactive: "#ef4444"
  };
  
  const color = !isAvailable ? colors.offline : status === 'active' ? colors.active : colors.inactive;
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"><span style="font-size: 20px;">🚗</span></div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createOrderIcon = (idx) => {
  return L.divIcon({
    html: `<div style="background-color: #f59e0b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${idx}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function DriverTrackingContent() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState([14.6937, -17.4441]); // Dakar
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: drivers = [] } = useQuery({
    queryKey: ['all-drivers'],
    queryFn: () => base44.entities.DeliveryPartner.list(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: activeOrders = [] } = useQuery({
    queryKey: ['active-driver-orders'],
    queryFn: () => base44.entities.Order.filter({ 
      status: { $in: ['confirmed', 'preparing', 'ready', 'out_for_delivery'] }
    }),
    refetchInterval: 5000,
  });

  const getDriverOrders = (driverId) => {
    return activeOrders.filter(o => o.delivery_partner_id === driverId);
  };

  const getDriverStatus = (driver) => {
    const orders = getDriverOrders(driver.id);
    if (!driver.is_available) return "offline";
    if (orders.some(o => o.status === 'out_for_delivery')) return "delivering";
    if (orders.length > 0) return "active";
    return "available";
  };

  const filteredDrivers = drivers.filter(d => {
    if (statusFilter === "all") return true;
    const status = getDriverStatus(d);
    return status === statusFilter;
  });

  const driversWithLocation = filteredDrivers.filter(d => d.current_location?.lat && d.current_location?.lng);

  const stats = {
    total: drivers.length,
    online: drivers.filter(d => d.is_available).length,
    delivering: drivers.filter(d => {
      const orders = getDriverOrders(d.id);
      return orders.some(o => o.status === 'out_for_delivery');
    }).length,
    available: drivers.filter(d => {
      const orders = getDriverOrders(d.id);
      return d.is_available && orders.length === 0;
    }).length,
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    if (driver.current_location) {
      setMapCenter([driver.current_location.lat, driver.current_location.lng]);
    }
  };

  const handleSendNotification = (driver) => {
    setSelectedDriver(driver);
    setNotificationDialog(true);
  };

  const statusColors = {
    offline: "bg-slate-100 text-slate-700",
    available: "bg-green-100 text-green-700",
    active: "bg-blue-100 text-blue-700",
    delivering: "bg-orange-100 text-orange-700"
  };

  const statusLabels = {
    offline: "Hors Ligne",
    available: "Disponible",
    active: "Actif",
    delivering: "En Livraison"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🚚 Suivi des Chauffeurs en Temps Réel</h1>
          <p className="text-slate-600">Gérez et suivez tous vos chauffeurs sur la carte</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("all")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Chauffeurs</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Navigation className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("available")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Disponibles</p>
                  <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("delivering")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">En Livraison</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.delivering}</p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("offline")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Hors Ligne</p>
                  <p className="text-3xl font-bold text-slate-600">{stats.total - stats.online}</p>
                </div>
                <User className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Carte en Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] rounded-lg overflow-hidden border-2 border-slate-200">
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater center={mapCenter} />

                    {driversWithLocation.map((driver) => {
                      const status = getDriverStatus(driver);
                      const orders = getDriverOrders(driver.id);
                      
                      return (
                        <React.Fragment key={driver.id}>
                          <Marker
                            position={[driver.current_location.lat, driver.current_location.lng]}
                            icon={createDriverIcon(driver.status, driver.is_available)}
                            eventHandlers={{
                              click: () => handleDriverClick(driver)
                            }}
                          >
                            <Popup>
                              <div className="p-2">
                                <p className="font-bold text-sm mb-1">{driver.full_name}</p>
                                <Badge className={statusColors[status]}>
                                  {statusLabels[status]}
                                </Badge>
                                <p className="text-xs mt-2">🚗 {driver.vehicle_type}</p>
                                {orders.length > 0 && (
                                  <p className="text-xs mt-1">📦 {orders.length} commande(s)</p>
                                )}
                              </div>
                            </Popup>
                          </Marker>

                          {orders.map((order, idx) => {
                            if (!order.customer_location?.lat || !order.customer_location?.lng) return null;
                            
                            const route = [
                              [driver.current_location.lat, driver.current_location.lng],
                              [order.customer_location.lat, order.customer_location.lng]
                            ];

                            return (
                              <React.Fragment key={order.id}>
                                <Polyline
                                  positions={route}
                                  color="#f59e0b"
                                  weight={3}
                                  opacity={0.6}
                                  dashArray="5, 10"
                                />
                                <Marker
                                  position={[order.customer_location.lat, order.customer_location.lng]}
                                  icon={createOrderIcon(idx + 1)}
                                >
                                  <Popup>
                                    <div className="p-2">
                                      <p className="font-bold text-sm">{order.order_number}</p>
                                      <p className="text-xs">{order.customer_name}</p>
                                      <p className="text-xs text-slate-600">{order.customer_address}</p>
                                    </div>
                                  </Popup>
                                </Marker>
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liste des Chauffeurs</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
                {filteredDrivers.map((driver) => {
                  const status = getDriverStatus(driver);
                  const orders = getDriverOrders(driver.id);
                  
                  return (
                    <div
                      key={driver.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedDriver?.id === driver.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                      onClick={() => handleDriverClick(driver)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{driver.full_name}</p>
                            <Badge className={statusColors[status]} size="sm">
                              {statusLabels[status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            🚗 {driver.vehicle_type} • ⭐ {driver.rating?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {orders.length > 0 && (
                        <div className="bg-orange-50 rounded p-2 mb-2">
                          <p className="text-xs font-semibold text-orange-900 mb-1">
                            📦 {orders.length} Commande(s) Active(s)
                          </p>
                          {orders.map((order, idx) => (
                            <p key={order.id} className="text-xs text-orange-700">
                              {idx + 1}. {order.order_number} - {order.customer_name}
                            </p>
                          ))}
                        </div>
                      )}

                      {driver.current_location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Position: {driver.current_location.lat.toFixed(4)}, {driver.current_location.lng.toFixed(4)}
                        </p>
                      )}

                      {!driver.current_location && (
                        <p className="text-xs text-red-500">❌ Position GPS non disponible</p>
                      )}

                      <Button
                        size="sm"
                        className="w-full mt-3"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendNotification(driver);
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Envoyer Notification
                      </Button>
                    </div>
                  );
                })}

                {filteredDrivers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p>Aucun chauffeur trouvé</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedDriver && (
              <Card className="border-2 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">Détails Chauffeur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold">{selectedDriver.full_name}</p>
                    <p className="text-xs text-slate-600">{selectedDriver.phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Véhicule</p>
                      <p className="font-semibold">{selectedDriver.vehicle_type}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Note</p>
                      <p className="font-semibold">⭐ {selectedDriver.rating?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Livraisons</p>
                      <p className="font-semibold">{selectedDriver.total_deliveries || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <p className="text-slate-600">Statut</p>
                      <Badge className={statusColors[getDriverStatus(selectedDriver)]}>
                        {statusLabels[getDriverStatus(selectedDriver)]}
                      </Badge>
                    </div>
                  </div>

                  {selectedDriver.current_location && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">📍 Position GPS</p>
                      <p className="text-xs text-blue-700">
                        Lat: {selectedDriver.current_location.lat.toFixed(6)}
                      </p>
                      <p className="text-xs text-blue-700">
                        Lng: {selectedDriver.current_location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <DriverNotificationDialog
        driver={selectedDriver}
        open={notificationDialog}
        onOpenChange={setNotificationDialog}
      />
    </div>
  );
}

export default function DriverTracking() {
  return (
    <AdminAuthGuard>
      <DriverTrackingContent />
    </AdminAuthGuard>
  );
}