import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X, AlertCircle, Keyboard } from "lucide-react";
import { toast } from "sonner";

export default function QRScanner({ open, onOpenChange, onScan }) {
  const [manualMode, setManualMode] = useState(false);
  const [tableCode, setTableCode] = useState("");
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    if (open && !manualMode) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, manualMode]);

  const startCamera = async () => {
    try {
      // Check if BarcodeDetector is available
      if (!('BarcodeDetector' in window)) {
        setManualMode(true);
        toast.info("Scanner automatique non disponible. Mode manuel activé.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Initialize barcode detector
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
        startScanning();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setManualMode(true);
      toast.info("Mode manuel activé");
    }
  };

  const stopCamera = () => {
    setScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = async () => {
    if (!detectorRef.current || !videoRef.current) return;
    
    setScanning(true);
    
    const scan = async () => {
      if (!scanning && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            handleScan(barcodes[0].rawValue);
          }
        } catch (err) {
          console.error("Scan error:", err);
        }
      }
      
      if (scanning) {
        requestAnimationFrame(scan);
      }
    };
    
    scan();
  };

  const handleScan = (data) => {
    try {
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

  const handleManualSubmit = () => {
    if (!tableCode.trim()) {
      toast.error("Veuillez entrer le code de la table");
      return;
    }

    try {
      const url = new URL(tableCode);
      const params = new URLSearchParams(url.search);
      const restaurantId = params.get('restaurant');
      const tableNumber = params.get('table');

      if (restaurantId && tableNumber) {
        onScan({ restaurantId, tableNumber });
        onOpenChange(false);
        setTableCode("");
        toast.success(`Table ${tableNumber} activée!`);
      } else {
        toast.error("Code QR invalide");
      }
    } catch (err) {
      toast.error("Format de code invalide");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {manualMode ? <Keyboard className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            {manualMode ? "Entrer le Code Table" : "Scanner le QR Code"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {manualMode ? (
            <>
              <div className="space-y-3">
                <Label>Coller le lien du QR code</Label>
                <Input
                  placeholder="https://app.example.com/order?restaurant=...&table=..."
                  value={tableCode}
                  onChange={(e) => setTableCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button onClick={handleManualSubmit} className="w-full">
                  Confirmer
                </Button>
              </div>
              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={() => setManualMode(false)}>
                  <Camera className="w-4 h-4 mr-2" />
                  Scanner avec la caméra
                </Button>
              </div>
            </>
          ) : (
            <>
              {hasPermission === false ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm text-amber-800 mb-3">
                    Accès caméra non disponible
                  </p>
                  <Button onClick={() => setManualMode(true)} size="sm">
                    <Keyboard className="w-4 h-4 mr-2" />
                    Utiliser le mode manuel
                  </Button>
                </div>
              ) : (
                <>
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
                        📱 Pointez vers le QR code
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => setManualMode(true)}>
                      <Keyboard className="w-4 h-4 mr-2" />
                      Entrer le code manuellement
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          <div className="text-xs text-slate-600 text-center">
            <p>💡 Le QR code se trouve sur votre table au restaurant</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}