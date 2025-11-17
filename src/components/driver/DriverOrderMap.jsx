import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const restaurantIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0VGNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+NvTwvdGV4dD48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const customerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzEwQjk4MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+PoDwvdGV4dD48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzM5NTBGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+amiA8L3RleHQ+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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

export default function DriverOrderMap({ order, driver }) {
  const [mapCenter, setMapCenter] = useState([14.6928, -17.4467]); // Default Dakar

  useEffect(() => {
    if (driver?.current_location) {
      setMapCenter([driver.current_location.lat, driver.current_location.lng]);
    } else if (order.customer_location) {
      setMapCenter([order.customer_location.lat, order.customer_location.lng]);
    }
  }, [driver, order]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} />

        {order.customer_location && (
          <Marker 
            position={[order.customer_location.lat, order.customer_location.lng]}
            icon={customerIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Customer Location</p>
                <p>{order.customer_name}</p>
                <p className="text-xs text-slate-600">{order.customer_address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {driver?.current_location && (
          <Marker 
            position={[driver.current_location.lat, driver.current_location.lng]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Your Location</p>
                <p className="text-xs">
                  {order.vehicle_type === 'bicycle' && '🚲 Bicycle'}
                  {order.vehicle_type === 'motorcycle' && '🏍️ Motorcycle'}
                  {order.vehicle_type === 'car' && '🚗 Car'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}