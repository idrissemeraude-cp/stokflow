import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Camera, 
  X, 
  Search, 
  CheckCircle, 
  Package, 
  Plus, 
  Barcode as BarcodeIcon,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { formatFCFA } from '../utils/storage';

const BarcodeScannerModal = ({ products = [], onSelectProduct, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedProduct, setScannedProduct] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Search product by barcode or SKU
  const handleLookup = (code) => {
    const clean = code.trim().toLowerCase();
    if (!clean) return;

    const found = products.find(p => 
      (p.barcode && p.barcode.toLowerCase() === clean) ||
      p.id.toLowerCase() === clean ||
      p.name.toLowerCase().includes(clean)
    );

    if (found) {
      setScannedProduct(found);
    } else {
      setScannedProduct(null);
    }
  };

  // Trigger camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError("La caméra n'est pas supportée sur ce navigateur.");
      }
    } catch (err) {
      console.warn("Accès caméra refusé ou non disponible :", err);
      setCameraError("Impossible d'activer la caméra (autorisation requise ou caméra occupée).");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleAddFoundProduct = () => {
    if (scannedProduct) {
      onSelectProduct(scannedProduct);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <Scan className="w-5 h-5 text-emerald-600 animate-pulse" />
            <h3 className="font-bold text-lg text-[#064E3B] font-sans">
              Scanner Code-barres & QR Code
            </h3>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Box */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 border-2 border-emerald-500/40 aspect-video flex items-center justify-center text-white">
          {cameraActive ? (
            <>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Laser scanning visual line */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-32 border-2 border-dashed border-emerald-400 rounded-xl relative">
                  <div className="w-full h-0.5 bg-red-500 shadow-md shadow-red-500 absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono mt-2 bg-black/60 px-2 py-0.5 rounded">
                  Placez le code-barres dans le cadre
                </span>
              </div>
            </>
          ) : (
            <div className="text-center p-4 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-emerald-400 opacity-80" />
              <p className="text-xs text-gray-300">
                {cameraError || "Scannez avec la caméra de votre smartphone ou tablette."}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Activer la Caméra
              </button>
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU / Douchette Input */}
        <div className="space-y-2">
          <label className="block font-bold text-xs text-gray-700">
            Saisie Manuelle ou Douchette Code-barres
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <BarcodeIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ex: BF-ROB-001 ou BF-ENS-002"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  handleLookup(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleLookup(manualCode)}
              className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Quick Sample Code Pills */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Codes disponibles en démonstration :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 4).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setManualCode(p.barcode || p.id);
                  handleLookup(p.barcode || p.id);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold hover:bg-emerald-100"
              >
                {p.barcode || p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Match Result Display */}
        {scannedProduct && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fadeIn">
            <div className="flex items-start space-x-3">
              <img 
                src={scannedProduct.image || 'https://images.unsplash.com/photo-1590549326166-7e0760d8bee3?w=500&auto=format&fit=crop&q=60'} 
                alt={scannedProduct.name}
                className="w-14 h-14 object-cover rounded-xl border border-emerald-200 flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  {scannedProduct.category}
                </span>
                <h4 className="font-bold text-xs text-gray-900 truncate mt-1">
                  {scannedProduct.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-extrabold text-[#064E3B] text-sm">
                    {formatFCFA(scannedProduct.salePrice)}
                  </span>
                  <span className={`text-[10px] font-bold ${scannedProduct.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    Stock: {scannedProduct.stock} dispo
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddFoundProduct}
              disabled={scannedProduct.stock <= 0}
              className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md ${
                scannedProduct.stock > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter au Panier de Caisse</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BarcodeScannerModal;
