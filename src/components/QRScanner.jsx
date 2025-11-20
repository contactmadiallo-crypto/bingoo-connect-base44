import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ScanLine } from "lucide-react";
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
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 2560, min: 640 },
          height: { ideal: 1440, min: 480 },
          aspectRatio: { ideal: 16/9 },
          frameRate: { ideal: 60, min: 30 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        // Fallback if exact environment camera fails
        constraints.video.facingMode = "environment";
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      streamRef.current = stream;
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        await videoRef.current.play();
        
        // Wait for video to be ready
        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = resolve;
        });
        
        if ('BarcodeDetector' in window) {
          startBarcodeDetection();
        } else {
          toast.error("Votre navigateur ne supporte pas le scan QR");
          onOpenChange(false);
        }
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
      let lastScanTime = 0;
      const scanInterval = 100; // Scan every 100ms for faster detection
      
      const detectQR = async () => {
        if (!scanningRef.current || !videoRef.current) {
          return;
        }

        const now = Date.now();
        if (now - lastScanTime < scanInterval) {
          requestAnimationFrame(detectQR);
          return;
        }
        
        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            
            if (barcodes.length > 0 && !scanSuccess) {
              const qrData = barcodes[0].rawValue;
              handleScan(qrData);
              return;
            }
            
            lastScanTime = now;
          } catch (e) {
            // Continue scanning
          }
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <ScanLine className="w-6 h-6 text-orange-600" />
            Scanner le QR Code du Restaurant
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-square shadow-2xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            
            {/* Scanning frame with animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`relative w-72 h-72 transition-all duration-300 ${scanSuccess ? 'scale-110' : 'scale-100'}`}>
                <div className={`w-full h-full border-4 rounded-3xl transition-colors ${scanSuccess ? 'border-green-500' : 'border-white/60'}`}>
                  {/* Corner markers */}
                  <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
                  <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
                  <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />
                  
                  {/* Scanning line animation */}
                  {!scanSuccess && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent scanning-line" />
                  )}
                </div>
              </div>
            </div>
            
            {scanSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-sm">
                <div className="bg-green-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-lg shadow-2xl animate-bounce">
                  <CheckCircle className="w-6 h-6" />
                  Restaurant Détecté!
                </div>
              </div>
            )}
            
            {cameraActive && !scanSuccess && (
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold py-3 px-6 rounded-full inline-flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Pointez vers le QR code du restaurant
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center text-sm text-slate-600 space-y-1">
            <p className="font-semibold">📱 Alignez le QR code dans le cadre orange</p>
            <p className="text-xs">Le scan se fait automatiquement</p>
          </div>
        </div>
      </DialogContent>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scanning-line {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}