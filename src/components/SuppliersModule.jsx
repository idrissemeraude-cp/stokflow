import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  MessageSquare, 
  PackagePlus, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  X,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';
import { buildWhatsappLink } from '../utils/whatsappAi';

const SuppliersModule = ({ 
  suppliers = [], 
  products = [], 
  sales = [], 
  onSaveSupplier, 
  onDeleteSupplier, 
  onReceiveStock,
  userRole = 'ADMIN'
}) => {
  const [activeSubTab, setActiveSubTab] = useState('reorder'); // 'reorder' | 'directory'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  // Modal de Réception de Stock
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedProductForReceive, setSelectedProductForReceive] = useState(null);
  const [receiveQuantity, setReceiveQuantity] = useState(10);
  const [receivePurchasePrice, setReceivePurchasePrice] = useState('');

  // Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    company: '',
    phone: '',
    city: 'Ouagadougou',
    category: 'Textile / Bazin',
    paymentTerms: 'Comptant à la livraison',
    notes: ''
  });

  // Calcul du Réassort Intelligent (Vélocité des ventes et estimation des ruptures)
  const calculateReorderSuggestions = () => {
    return products.map(product => {
      // Calculer le total vendu sur les 30 derniers jours
      const totalSold = sales.reduce((acc, sale) => {
        const item = sale.items.find(i => i.productId === product.id);
        return acc + (item ? item.qty : 0);
      }, 0);

      const dailyVelocity = totalSold > 0 ? (totalSold / 30) : 0.2; // Estimation minimale
      const daysRemaining = dailyVelocity > 0 ? Math.round(product.stock / dailyVelocity) : 99;
      
      const isCritical = product.stock <= (product.lowStockThreshold || 2);
      const isUrgent = daysRemaining <= 5 || isCritical;
      const suggestedQty = Math.max(10, Math.ceil(dailyVelocity * 30)); // Couverture pour 30 jours

      // Trouver le fournisseur suggéré
      const suggestedSupplier = suppliers.find(s => 
        s.category.toLowerCase().includes(product.category.toLowerCase())
      ) || suppliers[0];

      return {
        product,
        totalSold,
        dailyVelocity: dailyVelocity.toFixed(1),
        daysRemaining,
        isUrgent,
        isCritical,
        suggestedQty,
        supplier: suggestedSupplier
      };
    }).sort((a, b) => (a.daysRemaining - b.daysRemaining));
  };

  const reorderList = calculateReorderSuggestions();
  const urgentReordersCount = reorderList.filter(r => r.isUrgent).length;

  const handleOpenSupplierModal = (sup = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setSupplierForm(sup);
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        company: '',
        phone: '+226',
        city: 'Ouagadougou',
        category: 'Textile / Bazin',
        paymentTerms: 'Comptant à la livraison',
        notes: ''
      });
    }
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplierSubmit = (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;

    const payload = {
      ...supplierForm,
      id: editingSupplier ? editingSupplier.id : `sup-${Date.now()}`
    };

    onSaveSupplier(payload);
    setIsSupplierModalOpen(false);
  };

  const handleSendPurchaseOrderWhatsApp = (reorderItem) => {
    const sup = reorderItem.supplier;
    const prod = reorderItem.product;
    const phone = sup?.phone || '+22670000000';

    let msg = `📦 *BON DE COMMANDE DE RÉASSORT - STOCKFLOW*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `À l'attention de : *${sup?.name || 'Fournisseur'}* (${sup?.company || 'Fournisseur Partenaire'})\n`;
    msg += `📅 Date : ${formatDateFr(new Date().toISOString())}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Bonjour, nous souhaitons passer commande pour le réassort suivant :\n\n`;
    msg += `• Article : *${prod.name}*\n`;
    msg += `• Quantité souhaitée : *${reorderItem.suggestedQty} unités*\n`;
    msg += `• Réf / Catégorie : ${prod.category}\n\n`;
    msg += `Merci de nous confirmer la disponibilité et le délai de livraison à notre boutique.\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Bien cordialement.`;

    const url = buildWhatsappLink(phone, msg);
    window.open(url, '_blank');
  };

  const handleOpenReceiveModal = (product) => {
    setSelectedProductForReceive(product);
    setReceiveQuantity(10);
    setReceivePurchasePrice(product.purchasePrice || '');
    setIsReceiveModalOpen(true);
  };

  const handleConfirmReceiveStock = (e) => {
    e.preventDefault();
    if (!selectedProductForReceive || receiveQuantity <= 0) return;

    onReceiveStock({
      productId: selectedProductForReceive.id,
      quantityAdded: Number(receiveQuantity),
      newPurchasePrice: receivePurchasePrice ? Number(receivePurchasePrice) : selectedProductForReceive.purchasePrice
    });

    setIsReceiveModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Fournisseurs & Réapprovisionnement Intelligent
            </h2>
            <p className="text-xs text-gray-500">
              Anticipation des ruptures de stock, commandes fournisseurs WhatsApp et entrées de stock
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-gray-100 p-1 rounded-2xl flex text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('reorder')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeSubTab === 'reorder'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Réassort IA</span>
              {urgentReordersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full ml-1">
                  {urgentReordersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('directory')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeSubTab === 'directory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Répertoire Fournisseurs</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenSupplierModal()}
            className="px-4 py-2.5 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter Fournisseur</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: RÉASSORT INTELLIGENT */}
      {activeSubTab === 'reorder' && (
        <div className="space-y-4">
          
          {/* Bannière Alerte */}
          {urgentReordersCount > 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    {urgentReordersCount} article(s) nécessitent un réassort immédiat
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Ces produits risquent la rupture dans moins de 5 jours selon vos ventes récentes.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-3xl flex items-center space-x-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Vos niveaux de stock sont confortables pour l'ensemble de votre catalogue.</span>
            </div>
          )}

          {/* Grille des Suggestions de Réassort */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reorderList.map((item, idx) => {
              const p = item.product;
              return (
                <div 
                  key={p.id} 
                  className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    item.isCritical 
                      ? 'border-red-300 ring-1 ring-red-300' 
                      : item.isUrgent 
                      ? 'border-amber-300' 
                      : 'border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {p.category}
                        </span>
                        <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1 mt-0.5">
                          {p.name}
                        </h3>
                      </div>
                      
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.isCritical 
                          ? 'bg-red-100 text-red-700' 
                          : item.isUrgent 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock <= 0 ? 'RUPTURE' : `${p.stock} en stock`}
                      </span>
                    </div>

                    {/* Stats de vélocité */}
                    <div className="my-3 grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-2xl text-[11px]">
                      <div>
                        <span className="text-gray-500 block">Ventes / mois :</span>
                        <strong className="text-gray-800">{item.totalSold} unités</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Autonomie restante :</span>
                        <strong className={item.daysRemaining <= 3 ? 'text-red-600 font-bold' : 'text-gray-800'}>
                          ≈ {item.daysRemaining} jour(s)
                        </strong>
                      </div>
                    </div>

                    {/* Fournisseur assigné */}
                    <div className="text-[11px] text-gray-600 mb-3">
                      Fournisseur recommandé : <strong className="text-gray-800">{item.supplier?.name || 'Grossiste Général'}</strong>
                    </div>
                  </div>

                  {/* Boutons d'Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => handleSendPurchaseOrderWhatsApp(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                      title="Envoyer le bon de commande par WhatsApp au fournisseur"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Commander (+{item.suggestedQty})</span>
                    </button>

                    <button
                      onClick={() => handleOpenReceiveModal(p)}
                      className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                      title="Enregistrer une réception de marchandise pour cet article"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Réceptionner</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUBTAB 2: RÉPERTOIRE FOURNISSEURS */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {sup.category}
                      </span>
                      <h3 className="text-base font-extrabold text-gray-900 mt-1.5">
                        {sup.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-600">{sup.company}</p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenSupplierModal(sup)}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-gray-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSupplier(sup.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{sup.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{sup.paymentTerms}</span>
                    </div>
                    {sup.notes && (
                      <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-xl mt-2">
                        "{sup.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a
                    href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contacter sur WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: AJOUT / ÉDITION FOURNISSEUR */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom du Contact *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Ex: M. Moussa Traoré"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-semibold text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Entreprise / Grossiste</label>
                <input
                  type="text"
                  value={supplierForm.company}
                  onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })}
                  placeholder="Ex: Traoré & Frères Import-Export"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="+22670112233"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={supplierForm.category}
                    onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                    placeholder="Ex: Robes, Tissus, Chaussures"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Conditions de Paiement</label>
                <input
                  type="text"
                  value={supplierForm.paymentTerms}
                  onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                  placeholder="Ex: Acompte 30% puis solde à 15 jours"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E3B] hover:bg-emerald-950 text-white font-bold rounded-xl shadow-md"
                >
                  Enregistrer Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RÉCEPTION DE MARCHANDISE (ENTRÉE DE STOCK) */}
      {isReceiveModalOpen && selectedProductForReceive && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <PackagePlus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-900">
                  Réceptionner du Stock
                </h3>
              </div>
              <button onClick={() => setIsReceiveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceiveStock} className="mt-4 space-y-3 text-xs">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Article sélectionné :</span>
                <p className="font-extrabold text-sm text-gray-900">{selectedProductForReceive.name}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Stock actuel : <strong>{selectedProductForReceive.stock} unités</strong>
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Quantité reçue (à ajouter au stock) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={receiveQuantity}
                  onChange={(e) => setReceiveQuantity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-base font-black text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Prix d'Achat Unitaire (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  value={receivePurchasePrice}
                  onChange={(e) => setReceivePurchasePrice(e.target.value)}
                  placeholder={`Actuel: ${selectedProductForReceive.purchasePrice} FCFA`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600">
                Nouveau stock après validation : <strong>{selectedProductForReceive.stock + Number(receiveQuantity || 0)} unités</strong>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Valider l'Entrée de Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuppliersModule;
