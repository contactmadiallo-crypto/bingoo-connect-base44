import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeliveryAlert({ order, driverLocation }) {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!order || !order.estimated_time || !driverLocation || !order.customer_location) {
      setAlert(null);
      return;
    }

    // Calculate elapsed time since order was created
    const orderStartTime = new Date(order.created_date);
    const elapsedMinutes = Math.floor((Date.now() - orderStartTime.getTime()) / 60000);
    const estimatedTime = order.estimated_time || 30;

    // Calculate distance from current location to customer
    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      order.customer_location.lat,
      order.customer_location.lng
    );

    // Estimated time per km (assuming average speed of 30 km/h in city = 2 min/km)
    const estimatedMinutesRemaining = Math.ceil(distance * 2);
    const totalEstimatedTime = elapsedMinutes + estimatedMinutesRemaining;

    // Alert levels
    if (totalEstimatedTime > estimatedTime + 15) {
      setAlert({
        type: "critical",
        message: `⚠️ Retard Critique: ${Math.ceil(totalEstimatedTime - estimatedTime)} min de retard prévu`,
        description: `Distance restante: ${distance.toFixed(1)} km (~${estimatedMinutesRemaining} min)`,
        color: "bg-red-50 border-red-300 text-red-800"
      });
    } else if (totalEstimatedTime > estimatedTime + 5) {
      setAlert({
        type: "warning",
        message: `⏱️ Attention: Risque de retard de ${Math.ceil(totalEstimatedTime - estimatedTime)} min`,
        description: `Distance restante: ${distance.toFixed(1)} km (~${estimatedMinutesRemaining} min)`,
        color: "bg-orange-50 border-orange-300 text-orange-800"
      });
    } else if (elapsedMinutes > estimatedTime * 0.7) {
      setAlert({
        type: "info",
        message: `🚗 Livraison dans les temps - ${estimatedMinutesRemaining} min restantes`,
        description: `Distance restante: ${distance.toFixed(1)} km`,
        color: "bg-blue-50 border-blue-300 text-blue-800"
      });
    } else {
      setAlert(null);
    }
  }, [order, driverLocation]);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  if (!alert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Alert className={`${alert.color} border-2 mb-4`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {alert.type === "critical" && <AlertTriangle className="w-5 h-5" />}
              {alert.type === "warning" && <Clock className="w-5 h-5" />}
              {alert.type === "info" && <TrendingUp className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <AlertDescription className="font-semibold mb-1">
                {alert.message}
              </AlertDescription>
              <AlertDescription className="text-sm opacity-90">
                {alert.description}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}