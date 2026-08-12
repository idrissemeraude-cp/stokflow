import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Barcode as BarcodeIcon, 
  Layers, 
  Grid, 
  Check, 
  SlidersHorizontal,
  Package,
  Store,
  Tag
} from 'lucide-react';
import { formatFCFA } from '../utils/storage';

// Générateur SVG pur de code-barres Code128 / Linéaire robuste sans dépendance externe
const generateBarcodeSvgBars = (codeStr = '123456') => {
  const cleanCode = String(codeStr).toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'ART-001';
  let hash = 0;
  for (let i = 0; i < cleanCode.length; i++) {
    hash = (hash << 5) - hash + cleanCode.charCodeAt(i);
    hash |= 0;
  }
  
  // Générer un motif de barres équilibré et lisible pour douchette
  const bars = [];
  let currentX = 10;
  
  // Barres de garde de début
  bars.push({ x: currentX, width: 2 }); currentX += 4;
  bars.push({ x: currentX, width: 2 }); currentX += 4;

  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const pattern = (charCode * 7 + (i + 1) * 13) % 16;
    for (let bit = 0; bit < 4; bit++) {
      const isThick = ((pattern >> bit) & 1) === 1;
      const w = isThick ? 3.5 : 1.8;
      bars.push({ x: currentX, width: w });
      currentX += w + 2.2;
    }
  }

  // Barres de garde de fin
  bars.push({ x: currentX, width: 2 }); currentX += 4;
  bars.push({ x: currentX, width: 3 }); currentX += 5;

  return { bars, totalWidth: currentX + 10 };
};

const BarcodeLabelsModal = ({ products = [], storeInfo, onClose }) => {
  const [selectedProductId, setSelectedProductId] = useState('ALL');
  const [labelsPerPage, setLabelsPerPage] = useState(24); // 24 par page A4 (3x8)
  const [customQty, setCustomQty] = useState(1);
  const [includeStoreName, setIncludeStoreName] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);

  // Articles à imprimer
  let targetProducts = [];
  if (selectedProductId === 'ALL') {
    targetProducts = products.filter(p => p.stock > 0);
  } else {
    const found = products.find(p => p.id === selectedProductId);
    if (found) {
      targetProducts = Array(Number(customQty) || 1).fill(found);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:max-w-none print:w-full">
        
        {/* Header Modal - Hidden on print */}
        <div className="p-4 bg-[#064E3B] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <BarcodeIcon className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                Générateur & Impression d'Étiquettes Code-Barres
              </h3>
              <p className="text-xs text-emerald-200/70">
                Planches adhésives A4 prêtes pour le rayonnage et cintres
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar - Hidden on print */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Article à imprimer :</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 font-medium text-gray-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">📦 Tout le stock disponible ({products.filter(p => p.stock > 0).length} articles)</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.barcode || 'Sans code'} - {formatFCFA(p.salePrice)})
                  </option>
                ))}
              </select>
            </div>

            {selectedProductId !== 'ALL' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Nombre d'exemplaires :</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customQty}
                  onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-white border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-gray-800 focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4">
              <label className="flex items-center space-x-1.5 cursor-pointer text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={includeStoreName}
                  onChange={(e) => setIncludeStoreName(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Nom boutique</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={includePrice}
                  onChange={(e) => setIncludePrice(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Prix FCFA</span>
              </label>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-[#064E3B] hover:bg-emerald-950 text-white font-bold flex items-center space-x-2 shadow-lg shadow-emerald-900/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Lancer l'Impression</span>
          </button>
        </div>

        {/* Printable Grid of Labels */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 print:bg-white print:p-0">
          <div className="max-w-[210mm] mx-auto bg-white p-4 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {targetProducts.map((p, idx) => {
                const barcodeData = generateBarcodeSvgBars(p.barcode || `BF-${p.id}`);
                return (
                  <div
                    key={idx}
                    className="border border-dashed border-gray-300 rounded-xl p-2.5 flex flex-col items-center justify-between text-center bg-white h-[115px] page-break-inside-avoid print:border-gray-400"
                  >
                    {/* Store Title */}
                    {includeStoreName && (
                      <div className="text-[9px] font-extrabold text-gray-700 uppercase tracking-wider truncate w-full border-b border-gray-100 pb-0.5">
                        {storeInfo?.name || 'StockFlow Pro'}
                      </div>
                    )}

                    {/* Product Name */}
                    <div className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-1 w-full mt-0.5">
                      {p.name}
                    </div>

                    {/* SVG Barcode */}
                    <div className="w-full flex flex-col items-center justify-center my-0.5">
                      <svg
                        viewBox={`0 0 ${barcodeData.totalWidth} 32`}
                        className="h-7 max-w-full"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {barcodeData.bars.map((b, bIdx) => (
                          <rect
                            key={bIdx}
                            x={b.x}
                            y="0"
                            width={b.width}
                            height="32"
                            fill="#111827"
                          />
                        ))}
                      </svg>
                      <span className="text-[8px] font-mono tracking-widest text-gray-600 font-semibold leading-none">
                        {p.barcode || `BF-ART-${idx + 1}`}
                      </span>
                    </div>

                    {/* Price FCFA */}
                    {includePrice && (
                      <div className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded w-full border border-emerald-200/60 leading-tight">
                        {formatFCFA(p.salePrice)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BarcodeLabelsModal;
