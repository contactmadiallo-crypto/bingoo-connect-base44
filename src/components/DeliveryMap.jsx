import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, Car, Truck } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function DeliveryMap({ order }) {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    if (order?.driver_location) {
      setDriverLocation([order.driver_location.lat, order.driver_location.lng]);
    }
  }, [order]);

  const customerLocation = order?.customer_location 
    ? [order.customer_location.lat, order.customer_location.lng]
    : [14.7167, -17.4677]; // Default to Dakar, Senegal

  const vehicleIcon = {
    bicycle: <Bike className="w-4 h-4" />,
    motorcycle: <Bike className="w-4 h-4" />,
    car: <Car className="w-4 h-4" />
  };

  if (!order) return null;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Live Delivery Tracking</h3>
          {order.vehicle_type && (
            <Badge variant="outline" className="flex items-center gap-1">
              {vehicleIcon[order.vehicle_type]}
              {order.vehicle_type}
            </Badge>
          )}
        </div>
      </div>
      <div className="h-[400px] relative">
        <MapContainer
          center={driverLocation || customerLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={driverLocation || customerLocation} />
          
          {/* Customer Location */}
          {order.customer_location && (
            <Marker position={customerLocation}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">📍 Delivery Location</p>
                  <p className="text-sm">{order.customer_name}</p>
                  <p className="text-xs text-slate-600">{order.customer_location.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Driver Location */}
          {driverLocation && (
            <Marker position={driverLocation}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">🏍️ Driver Location</p>
                  <p className="text-sm">{order.driver_name}</p>
                  {order.vehicle_type && (
                    <p className="text-xs text-slate-600">Vehicle: {order.vehicle_type}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {!driverLocation && order.status === 'out_for_delivery' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 pointer-events-none">
            <p className="text-slate-600">Waiting for driver location...</p>
          </div>
        )}
      </div>
    </Card>
  );
}