import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle, ScanLine } from "lucide-react";
import { toast } from "sonner";

export default function QRScanner({ open, onOpenChange, onScan }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    if (open && !cameraActive) {
      startCamera();
    }
    if (!open) {
      stopCamera();
      setScanSuccess(false);
    }
    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      streamRef.current = stream;
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        
        setTimeout(() => {
          if ('BarcodeDetector' in window) {
            startBarcodeDetection();
          } else {
            toast.error("Votre navigateur ne supporte pas le scan QR");
            onOpenChange(false);
          }
        }, 300);
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Impossible d'accéder à la caméra");
      onOpenChange(false);
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startBarcodeDetection = async () => {
    try {
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      scanningRef.current = true;
      
      const detectQR = async () => {
        if (!scanningRef.current || !videoRef.current || videoRef.current.readyState !== 4) {
          if (scanningRef.current) {
            requestAnimationFrame(detectQR);
          }
          return;
        }
        
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue;
            handleScan(qrData);
            return;
          }
        } catch (e) {
          // Continue scanning
        }
        
        if (scanningRef.current) {
          requestAnimationFrame(detectQR);
        }
      };
      
      detectQR();
    } catch (err) {
      console.error("BarcodeDetector error:", err);
      toast.error("Erreur du scanner");
      onOpenChange(false);
    }
  };

  const handleScan = (data) => {
    if (scanSuccess) return;
    
    try {
      const url = new URL(data);
      const params = new URLSearchParams(url.search);
      const restaurantId = params.get('restaurant');
      const tableNumber = params.get('table') || null;

      if (restaurantId) {
        setScanSuccess(true);
        scanningRef.current = false;
        stopCamera();
        
        const message = tableNumber ? `Table ${tableNumber} détectée!` : 'Restaurant détecté!';
        toast.success(`✓ ${message}`);
        
        setTimeout(() => {
          onScan({ restaurantId, tableNumber });
          onOpenChange(false);
          setScanSuccess(false);
        }, 800);
      }
    } catch (err) {
      // Not a valid URL, continue scanning
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
                  placeholder="Collez le lien ici..."
                  value={tableCode}
                  onChange={(e) => setTableCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  className="text-sm"
                />
                <Button onClick={handleManualSubmit} className="w-full" disabled={!tableCode.trim()}>
                  Confirmer
                </Button>
              </div>
              {'BarcodeDetector' in window && (
                <div className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => { setManualMode(false); startCamera(); }}>
                    <Camera className="w-4 h-4 mr-2" />
                    Scanner avec la caméra
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-64 h-64 border-4 rounded-2xl transition-colors ${scanSuccess ? 'border-green-500' : 'border-white/50'}`}>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                  </div>
                </div>
                
                {scanSuccess && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      QR Code détecté!
                    </div>
                  </div>
                )}
                
                {cameraActive && !scanSuccess && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="bg-black/70 text-white text-sm py-2 px-4 rounded-full inline-block animate-pulse">
                      📱 Recherche du QR code...
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={() => { stopCamera(); setManualMode(true); }}>
                  <Keyboard className="w-4 h-4 mr-2" />
                  Mode manuel
                </Button>
              </div>
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