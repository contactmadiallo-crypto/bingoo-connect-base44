import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function QRScanner({ open, onOpenChange, onScan }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        startScanning();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = () => {
    // Import QR scanner library dynamically
    import('jsqr').then(({ default: jsQR }) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      scanIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            handleScan(code.data);
          }
        }
      }, 300);
    }).catch(err => {
      console.error("QR library error:", err);
      setError("Erreur lors du chargement du scanner QR");
    });
  };

  const handleScan = (data) => {
    try {
      // Parse URL params from scanned data
      const url = new URL(data);
      const params = new URLSearchParams(url.search);
      const restaurantId = params.get('restaurant');
      const tableNumber = params.get('table');

      if (restaurantId && tableNumber) {
        stopCamera();
        onScan({ restaurantId, tableNumber });
        onOpenChange(false);
        toast.success(`Table ${tableNumber} scannée!`);
      }
    } catch (err) {
      console.error("QR parse error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scanner le QR Code de la Table
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasPermission === false ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-red-800">
                Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.
              </p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <div className="absolute inset-0 border-4 border-white/30 m-8 rounded-lg pointer-events-none" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="bg-black/70 text-white text-sm py-2 px-4 rounded-full inline-block">
                  📱 Pointez vers le QR code de la table
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="text-xs text-slate-600 text-center">
            <p>💡 Conseil: Assurez-vous que le QR code est bien visible et éclairé</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}