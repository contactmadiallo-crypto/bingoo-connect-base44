import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const createNumberedIcon = (number, color) => {
  return new L.DivIcon({
    className: 'custom-numbered-icon',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

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

export default function DriverOrderMap({ order, orders, driver, optimizedRoute }) {
  const [mapCenter, setMapCenter] = useState([14.6928, -17.4467]);
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => {
    if (orders && orders.length > 1) {
      const locations = [];
      
      if (driver?.current_location) {
        locations.push([driver.current_location.lat, driver.current_location.lng]);
      }
      
      orders.forEach(o => {
        if (o.customer_location) {
          locations.push([o.customer_location.lat, o.customer_location.lng]);
        }
      });

      if (locations.length > 0) {
        setMapBounds(locations);
      }
    } else if (driver?.current_location) {
      setMapCenter([driver.current_location.lat, driver.current_location.lng]);
    } else if (order?.customer_location) {
      setMapCenter([order.customer_location.lat, order.customer_location.lng]);
    }
  }, [driver, order, orders]);

  const routePositions = useMemo(() => {
    if (!orders || orders.length <= 1 || !driver?.current_location) return [];
    
    const positions = [[driver.current_location.lat, driver.current_location.lng]];
    
    orders.forEach(o => {
      if (o.customer_location) {
        positions.push([o.customer_location.lat, o.customer_location.lng]);
      }
    });
    
    return positions;
  }, [orders, driver]);

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
        <MapUpdater center={mapCenter} bounds={mapBounds} />

        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#8B5CF6', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />
        )}

        {orders && orders.length > 1 ? (
          <>
            {orders.map((o, idx) => (
              o.customer_location && (
                <Marker
                  key={o.id}
                  position={[o.customer_location.lat, o.customer_location.lng]}
                  icon={createNumberedIcon(idx + 1, '#10B981')}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">Arrêt #{idx + 1}</p>
                      <p>{o.customer_name}</p>
                      <p className="text-xs text-slate-600">{o.customer_address}</p>
                      <p className="text-xs font-bold text-green-600 mt-1">
                        {(o.delivery_fee || 0).toFixed(0)} CFA
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </>
        ) : (
          order?.customer_location && (
            <Marker 
              position={[order.customer_location.lat, order.customer_location.lng]}
              icon={customerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Emplacement Client</p>
                  <p>{order.customer_name}</p>
                  <p className="text-xs text-slate-600">{order.customer_address}</p>
                </div>
              </Popup>
            </Marker>
          )
        )}

        {driver?.current_location && (
          <Marker 
            position={[driver.current_location.lat, driver.current_location.lng]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Votre Position</p>
                <p className="text-xs">
                  {order?.vehicle_type === 'bicycle' && '🚲 Vélo'}
                  {order?.vehicle_type === 'motorcycle' && '🏍️ Moto'}
                  {order?.vehicle_type === 'car' && '🚗 Voiture'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}