import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  HardDrive, 
  ShieldCheck,
  Package,
  Users,
  ShoppingCart,
  TrendingDown,
  Lock
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';

const BackupRestoreModal = ({ 
  isOpen, 
  onClose, 
  localState = {}, 
  onRestoreData,
  onResetData,
  userRole = 'ADMIN'
}) => {
  const [fileToRestore, setFileToRestore] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 1. Exporter la sauvegarde complète en 1 clic
  const handleDownloadBackup = () => {
    const backupObj = {
      app: 'StockFlow Pro (FasoMode)',
      version: '2.0',
      exportDate: new Date().toISOString(),
      storeInfo: localState.storeInfo,
      products: localState.products || [],
      clients: localState.clients || [],
      sales: localState.sales || [],
      payments: localState.payments || [],
      expenses: localState.expenses || [],
      cashClosings: localState.cashClosings || [],
      suppliers: localState.suppliers || [],
      waLogs: localState.waLogs || []
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stockflow_backup_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. Traitement du fichier JSON importé
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg(null);
    setRestoreSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.products && !parsed.sales && !parsed.clients) {
          throw new Error("Ce fichier ne semble pas être une sauvegarde StockFlow Pro valide.");
        }
        setPreviewData(parsed);
        setFileToRestore(file);
      } catch (err) {
        setErrorMsg("Fichier invalide ou corrompu : " + err.message);
        setPreviewData(null);
        setFileToRestore(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Validation et écrasement sécurisé
  const handleConfirmRestore = () => {
    if (!previewData) return;
    if (userRole === 'CASHIER') {
      alert("⛔ Seul le Gérant peut restaurer une sauvegarde.");
      return;
    }

    if (window.confirm("⚠️ Attention : La restauration va remplacer vos données actuelles par celles de la sauvegarde. Continuer ?")) {
      onRestoreData(previewData);
      setRestoreSuccess(true);
      setTimeout(() => {
        setRestoreSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Sauvegarde & Restauration Locale
              </h3>
              <p className="text-xs text-gray-500">
                Protégez vos données sur clé USB ou disque dur externe sans dépendance cloud
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
          
          {/* Section 1 : Exporter */}
          <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Télécharger la Sauvegarde Complète</span>
              </h4>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Génère un fichier unique contenant l'intégralité du stock, des ventes, clients et caisses.
              </p>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 bg-[#064E3B] hover:bg-emerald-950 text-white font-bold rounded-2xl shadow-md transition-all whitespace-nowrap flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter (.JSON)</span>
            </button>
          </div>

          {/* Section 2 : Importer / Restaurer */}
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200 space-y-3">
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-gray-700" />
                <span>Restaurer à partir d'un Fichier</span>
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Chargez une sauvegarde antérieure pour retrouver toutes vos données en 2 secondes.
              </p>
            </div>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl bg-white text-gray-700 font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileJson className="w-4 h-4 text-emerald-700" />
              <span>{fileToRestore ? fileToRestore.name : 'Sélectionner le fichier .json de sauvegarde'}</span>
            </button>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Prévisualisation des données détectées */}
            {previewData && (
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-gray-700 font-bold border-b border-gray-100 pb-2">
                  <span>Aperçu de la sauvegarde :</span>
                  <span className="text-[10px] text-gray-500">{formatDateFr(previewData.exportDate)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div>📦 Produits : <strong>{previewData.products?.length || 0}</strong></div>
                  <div>👥 Clients : <strong>{previewData.clients?.length || 0}</strong></div>
                  <div>🛒 Ventes : <strong>{previewData.sales?.length || 0}</strong></div>
                  <div>💰 Dépenses : <strong>{previewData.expenses?.length || 0}</strong></div>
                </div>

                <button
                  onClick={handleConfirmRestore}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Remplacer & Restaurer ces Données</span>
                </button>
              </div>
            )}

            {restoreSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-300 font-bold flex items-center space-x-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>✅ Restauration effectuée avec succès !</span>
              </div>
            )}
          </div>

          {/* Section 3 : Réinitialiser */}
          <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
            <div className="text-[11px] text-red-900">
              <strong className="block">Réinitialisation de démonstration</strong>
              <span>Remet les exemples types pour tester l'application.</span>
            </div>

            <button
              onClick={onResetData}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-xs transition-all"
            >
              Réinitialiser
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BackupRestoreModal;
