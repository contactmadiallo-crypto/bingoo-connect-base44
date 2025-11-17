import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom animated driver icon
const driverIcon = new L.DivIcon({
  html: `
    <div style="position: relative; width: 40px; height: 40px;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); animation: pulse 2s infinite;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
      </div>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ripple 2s infinite;"></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
      }
      @keyframes ripple {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
    </style>
  `,
  className: 'custom-driver-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Custom destination icon
const destinationIcon = new L.DivIcon({
  html: `
    <div style="position: relative; width: 40px; height: 40px;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); width: 40px; height: 50px; background: #ef4444; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <div style="transform: rotate(45deg); color: white; font-size: 20px;">📍</div>
      </div>
    </div>
  `,
  className: 'custom-destination-icon',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
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

export default function DeliveryMap({ order }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [prevLocation, setPrevLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    if (order?.driver_location) {
      const newLocation = [order.driver_location.lat, order.driver_location.lng];
      
      // Store previous location for smooth transition
      if (driverLocation) {
        setPrevLocation(driverLocation);
      }
      
      setDriverLocation(newLocation);
      
      // Build route path history
      if (driverLocation && !routePath.some(p => p[0] === newLocation[0] && p[1] === newLocation[1])) {
        setRoutePath(prev => [...prev, newLocation]);
      }
    }
  }, [order?.driver_location]);

  const customerLocation = order?.customer_location 
    ? [order.customer_location.lat, order.customer_location.lng]
    : null;

  // Calculate bounds to fit both markers
  const bounds = customerLocation && driverLocation
    ? [driverLocation, customerLocation]
    : null;

  if (!order) return null;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Navigation className="w-5 h-5" />
            </motion.div>
            <h3 className="font-semibold">Suivi en Direct</h3>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            En livraison
          </Badge>
        </div>
      </div>
      
      <div className="h-[450px] relative">
        <MapContainer
          center={driverLocation || customerLocation || [14.7167, -17.4677]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapUpdater center={driverLocation} bounds={bounds} />
          
          {/* Route path trail */}
          {routePath.length > 1 && (
            <Polyline
              positions={routePath}
              pathOptions={{ 
                color: '#3b82f6', 
                weight: 4, 
                opacity: 0.6,
                dashArray: '10, 10'
              }}
            />
          )}

          {/* Estimated route line */}
          {driverLocation && customerLocation && (
            <Polyline
              positions={[driverLocation, customerLocation]}
              pathOptions={{ 
                color: '#10b981', 
                weight: 3, 
                opacity: 0.5,
                dashArray: '5, 10'
              }}
            />
          )}
          
          {/* Customer Location with accuracy circle */}
          {customerLocation && (
            <>
              <Circle
                center={customerLocation}
                radius={100}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.1,
                  weight: 2,
                  opacity: 0.3
                }}
              />
              <Marker position={customerLocation} icon={destinationIcon}>
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold text-lg mb-1">📍 Destination</p>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{order.customer_address}</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Driver Location with pulsing animation */}
          {driverLocation && (
            <>
              <Circle
                center={driverLocation}
                radius={50}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.2,
                  weight: 0
                }}
              />
              <Marker position={driverLocation} icon={driverIcon}>
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold text-lg mb-1">🏍️ Chauffeur</p>
                    <p className="font-semibold">{order.driver_name}</p>
                    {order.vehicle_type && (
                      <p className="text-sm text-slate-600 mt-1 capitalize">
                        Véhicule: {order.vehicle_type}
                      </p>
                    )}
                    <Badge className="mt-2 bg-green-500">En route</Badge>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
        
        {!driverLocation && order.status === 'out_for_delivery' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Navigation className="w-12 h-12 text-blue-500 mb-4" />
            </motion.div>
            <p className="text-slate-700 font-semibold">Localisation du chauffeur en cours...</p>
            <p className="text-sm text-slate-500 mt-1">La carte se mettra à jour automatiquement</p>
          </div>
        )}

        {/* Distance indicator */}
        {driverLocation && customerLocation && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-600">Distance approximative</p>
                <p className="font-bold text-blue-600">Calcul en cours...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}