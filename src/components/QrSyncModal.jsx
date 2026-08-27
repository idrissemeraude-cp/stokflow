import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  Check, 
  Copy, 
  QrCode as QrIcon, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Store
} from 'lucide-react';

const QrSyncModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  storeInfo, 
  supabaseConfig,
  products = [],
  clients = [],
  sales = [],
  payments = [],
  expenses = []
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Payload compact de synchronisation mobile (Produits, Stocks, Prix de Vente)
  const compactProducts = (products || []).slice(0, 50).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    salePrice: p.salePrice,
    purchasePrice: p.purchasePrice,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    barcode: p.barcode
  }));

  const syncPayload = {
    user: currentUser || { ownerName: storeInfo?.ownerName || 'Gérant', storeName: storeInfo?.name || 'StockFlow Pro' },
    store: storeInfo || { name: 'StockFlow Pro', city: 'Ouagadougou' },
    config: supabaseConfig || {},
    products: compactProducts,
    clients: (clients || []).slice(0, 20),
    sales: (sales || []).slice(0, 20),
    payments: (payments || []).slice(0, 20),
    expenses: (expenses || []).slice(0, 20),
    timestamp: Date.now()
  };

  const jsonString = JSON.stringify(syncPayload);
  const encodedPayload = btoa(unescape(encodeURIComponent(jsonString)));

  const baseUrl = window.location.origin + window.location.pathname;
  const qrSyncUrl = `${baseUrl}?qr_sync=${encodedPayload}`;

  // Génération 100% locale du QR Code via Canvas
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(qrSyncUrl, {
      margin: 2,
      width: 320,
      color: {
        dark: '#064E3B',
        light: '#FFFFFF'
      }
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Erreur génération QR Code local:', err);
        // Fallback QuickChart
        setQrDataUrl(`https://quickchart.io/qr?text=${encodeURIComponent(qrSyncUrl)}&size=300`);
      });
  }, [isOpen, qrSyncUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrSyncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
      <div className="bg-white rounded-3rem max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 overflow-hidden relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2rem bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <QrIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 font-sans tracking-tight">
              Connexion Téléphone par QR Code
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Connectez votre smartphone instantanément à votre boutique {storeInfo?.name || 'StockFlow'}.
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-gradient-to-br from-[#064E3B] to-teal-950 p-6 rounded-3rem text-center space-y-4 text-white shadow-inner">
          <div className="inline-block p-4 bg-white rounded-2rem shadow-xl border-4 border-emerald-300 min-h-[220px] min-w-[220px] flex items-center justify-center">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code de synchronisation"
                className="w-52 h-52 sm:w-60 sm:h-60 mx-auto object-contain rounded-xl"
              />
            ) : (
              <div className="text-emerald-800 text-xs font-bold animate-pulse p-8">
                Génération du QR Code...
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 border border-emerald-400/30 mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>{storeInfo?.name || 'StockFlow Pro'}</span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              Gérant: <strong>{storeInfo?.ownerName || 'Commerçant'}</strong>
            </p>
          </div>
        </div>

        {/* Instructions rapides */}
        <div className="space-y-3 bg-emerald-50/70 p-4 rounded-2rem border border-emerald-100 text-xs">
          <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Comment se connecter sur son téléphone ?
          </h4>
          <ol className="space-y-2 text-emerald-900 list-decimal list-inside font-medium leading-relaxed">
            <li>Ouvrez l'<strong>appareil photo</strong> de votre téléphone (Android ou iPhone).</li>
            <li>Visez le <strong>QR Code</strong> ci-dessus sur l'écran de votre ordinateur.</li>
            <li>Appuyez sur le lien jaune/bleu qui apparaît pour ouvrir la boutique.</li>
            <li><strong>Magie !</strong> Votre téléphone se connecte instantanément et charge tous vos produits, prix et stocks !</li>
          </ol>
        </div>

        {/* Actions alternatives : Copier lien direct */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className={`w-full sm:flex-1 py-3 px-4 rounded-2rem text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-emerald-700" />}
            <span>{copied ? 'Lien copié dans le presse-papier !' : 'Copier le lien de connexion direct'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2rem text-xs font-bold transition-all"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default QrSyncModal;
