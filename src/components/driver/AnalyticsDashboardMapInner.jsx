import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function AnalyticsDashboardMapInner({ topZones, mapCenter }) {
  const maxCount = Math.max(...topZones.map(z => z.count));

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {topZones.map((zone, idx) => {
        const radius = 100 + (zone.count / maxCount) * 400;
        const opacity = 0.3 + (zone.count / maxCount) * 0.4;

        return (
          <Circle
            key={idx}
            center={[zone.lat, zone.lng]}
            radius={radius}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: opacity
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{zone.count} livraisons</p>
                <p className="text-green-600">{zone.earnings.toFixed(0)} CFA gagnés</p>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
}