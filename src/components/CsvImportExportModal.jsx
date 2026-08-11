import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingDown,
  Info
} from 'lucide-react';
import { exportToCsv, parseProductsCsv, formatFCFA } from '../utils/storage';

const CsvImportExportModal = ({ 
  products = [], 
  sales = [], 
  clients = [], 
  expenses = [], 
  payments = [],
  onImportProducts, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'export'
  const [csvPreview, setCsvPreview] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // CSV File Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseProductsCsv(text);
        if (parsed.length === 0) {
          setImportError("Aucun produit valide trouvé dans le fichier CSV. Vérifiez les séparateurs (virgule ou point-virgule).");
          setCsvPreview([]);
        } else {
          setCsvPreview(parsed);
        }
      } catch (err) {
        setImportError("Erreur lors de la lecture du fichier CSV : " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (csvPreview.length === 0) return;
    onImportProducts(csvPreview);
    alert(`✅ ${csvPreview.length} produit(s) importé(s) avec succès dans le stock !`);
    onClose();
  };

  // Sample CSV Template Download
  const handleDownloadSampleCsv = () => {
    const sampleRows = [
      {
        Nom: 'Robe Wax Soirée',
        Categorie: 'Robes',
        'Prix de Vente': 28000,
        'Prix d\'Achat': 16000,
        Stock: 10,
        Seuil: 2,
        'Code-Barre': 'BF-ROB-010'
      },
      {
        Nom: 'Chemise Faso Danfani',
        Categorie: 'Chemises',
        'Prix de Vente': 20000,
        'Prix d\'Achat': 12000,
        Stock: 15,
        Seuil: 3,
        'Code-Barre': 'BF-CHE-011'
      },
      {
        Nom: 'Babouches Cuir Brodé',
        Categorie: 'Chaussures',
        'Prix de Vente': 14000,
        'Prix d\'Achat': 8000,
        Stock: 8,
        Seuil: 2,
        'Code-Barre': 'BF-CHA-012'
      }
    ];
    exportToCsv('modele_import_produits_stockflow.csv', sampleRows);
  };

  // Export handlers
  const handleExportStock = () => {
    const rows = products.map(p => ({
      ID: p.id,
      Code_Barre: p.barcode || '',
      Nom: p.name,
      Categorie: p.category,
      Prix_Vente_FCFA: p.salePrice,
      Prix_Achat_FCFA: p.purchasePrice || 0,
      Marge_Unitaire_FCFA: p.salePrice - (p.purchasePrice || 0),
      Stock_Actuel: p.stock,
      Seuil_Alerte: p.lowStockThreshold || 2,
      Valeur_Stock_Vente_FCFA: p.salePrice * p.stock
    }));
    exportToCsv(`stock_catalogue_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handleExportSales = () => {
    const rows = sales.map(s => ({
      Ref_Vente: s.id,
      Date: s.createdAt,
      Client: s.clientName,
      Telephone: s.clientPhone || '',
      Type_Paiement: s.paymentType,
      Total_Commande_FCFA: s.totalAmount,
      Avance_Versee_FCFA: s.advancePaid || 0,
      Reste_A_Payer_FCFA: s.remainingDue || 0,
      Date_Echeance: s.dueDate || '',
      Statut: s.status
    }));
    exportToCsv(`ventes_boutique_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handleExportDebts = () => {
    const debts = sales.filter(s => s.paymentType === 'CREDIT' && s.remainingDue > 0);
    const rows = debts.map(d => ({
      Ref_Vente: d.id,
      Date_Vente: d.createdAt,
      Client: d.clientName,
      Telephone: d.clientPhone,
      Total_Achat_FCFA: d.totalAmount,
      Avance_Payee_FCFA: d.advancePaid,
      Creance_Restante_FCFA: d.remainingDue,
      Date_Echeance: d.dueDate
    }));
    exportToCsv(`creances_clients_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-200 space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-lg text-[#064E3B] font-sans">
              Import & Export Excel / CSV
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'import' ? 'bg-white text-[#064E3B] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importer Catalogue (CSV)</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'export' ? 'bg-white text-[#064E3B] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter les Données (Excel)</span>
          </button>
        </div>

        {/* Tab 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Importez jusqu'à des centaines d'articles en quelques secondes.</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Format recommandé : fichier CSV avec colonnes (Nom, Catégorie, Prix de Vente, Prix d'Achat, Stock).
                </p>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="mt-1.5 inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
                >
                  <Download className="w-3 h-3" />
                  <span>Télécharger le modèle CSV d'exemple</span>
                </button>
              </div>
            </div>

            {/* Drop / File Picker Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-bold text-gray-700">
                {fileName ? fileName : "Cliquez ou glissez un fichier CSV ici"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Fichiers acceptés : .CSV, .TXT (séparateur virgule ou point-virgule)</p>
            </div>

            {importError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* CSV Preview Table */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-gray-800">
                  <span>Aperçu des articles détectés ({csvPreview.length}) :</span>
                  <span className="text-emerald-600 text-[11px]">Prêt à importer</span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="p-2">Nom</th>
                        <th className="p-2">Catégorie</th>
                        <th className="p-2 text-right">Prix Vente</th>
                        <th className="p-2 text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {csvPreview.slice(0, 10).map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 font-semibold text-gray-900">{p.name}</td>
                          <td className="p-2 text-gray-600">{p.category}</td>
                          <td className="p-2 text-right font-bold text-[#064E3B]">{formatFCFA(p.salePrice)}</td>
                          <td className="p-2 text-right font-bold text-emerald-700">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {csvPreview.length > 10 && (
                  <p className="text-[10px] text-gray-400 italic text-center">
                    + {csvPreview.length - 10} autre(s) article(s) non affiché(s) dans l'aperçu
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Importer Définitivement les {csvPreview.length} Articles</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto space-y-3 text-xs">
            <p className="text-gray-500">
              Téléchargez vos données au format CSV compatible avec Microsoft Excel, Google Sheets et vos logiciels comptables.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Export 1: Stock */}
              <div className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-gray-50/60 flex flex-col justify-between space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Catalogue & Stocks</h4>
                    <p className="text-[11px] text-gray-500">{products.length} référence(s)</p>
                  </div>
                </div>
                <button
                  onClick={handleExportStock}
                  className="w-full py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#064E3B] border border-emerald-300 font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger CSV</span>
                </button>
              </div>

              {/* Export 2: Ventes */}
              <div className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-gray-50/60 flex flex-col justify-between space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Historique des Ventes</h4>
                    <p className="text-[11px] text-gray-500">{sales.length} vente(s)</p>
                  </div>
                </div>
                <button
                  onClick={handleExportSales}
                  className="w-full py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger CSV</span>
                </button>
              </div>

              {/* Export 3: Créances */}
              <div className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-gray-50/60 flex flex-col justify-between space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dettes & Créances</h4>
                    <p className="text-[11px] text-gray-500">Clients débiteurs</p>
                  </div>
                </div>
                <button
                  onClick={handleExportDebts}
                  className="w-full py-2 rounded-xl bg-white hover:bg-red-50 text-red-900 border border-red-300 font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger CSV</span>
                </button>
              </div>

              {/* Export 4: Dépenses */}
              <div className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-gray-50/60 flex flex-col justify-between space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Frais & Dépenses</h4>
                    <p className="text-[11px] text-gray-500">{expenses.length} dépense(s)</p>
                  </div>
                </div>
                <button
                  onClick={() => exportToCsv(`depenses_${new Date().toISOString().split('T')[0]}.csv`, expenses)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger CSV</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CsvImportExportModal;
