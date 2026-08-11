import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  UserPlus, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  X,
  PhoneCall,
  Scan,
  Receipt,
  Tag,
  Smartphone
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';
import BarcodeScannerModal from './BarcodeScannerModal';

const PosModule = ({ 
  products = [], 
  clients = [], 
  onSaveSale, 
  onSaveClient, 
  onOpenReceiptModal,
  setActiveTab 
}) => {
  // Shopping Cart State [{ product, qty, variant }]
  const [cart, setCart] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Payment Logic State
  const [paymentType, setPaymentType] = useState('CASH'); // 'CASH' | 'CREDIT'
  const [cashPaymentMethod, setCashPaymentMethod] = useState('CASH'); // CASH | ORANGE_MONEY | MOOV_MONEY | WAVE
  const [advancePaid, setAdvancePaid] = useState('');
  const [advanceMethod, setAdvanceMethod] = useState('CASH'); // CASH | ORANGE_MONEY | MOOV_MONEY | WAVE
  
  // Date d'échéance par défaut : Dans 7 jours
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };
  const [dueDate, setDueDate] = useState(getDefaultDueDate());

  // Search, Scanner & Quick Client modal
  const [productSearch, setProductSearch] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '+226', address: '' });

  // Add item to cart (with optional variant)
  const handleAddToCart = (product, selectedVariant = null) => {
    if (product.stock <= 0) return;

    const variant = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.variant === variant);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(item => item.product.id === product.id && item.variant === variant ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1, variant }];
    });
  };

  // Modify cart item quantity
  const handleUpdateQty = (productId, variant, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.variant === variant) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) return item;
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveFromCart = (productId, variant) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.variant === variant)));
  };

  // Cart Calculations
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.qty), 0);
  const parsedAdvance = paymentType === 'CASH' ? cartTotal : (Number(advancePaid) || 0);
  const remainingDue = Math.max(0, cartTotal - parsedAdvance);

  // Rapid Client Creation Submit
  const handleCreateClientSubmit = (e) => {
    e.preventDefault();
    if (!newClientForm.name.trim() || !newClientForm.phone.trim()) return;

    const newClient = {
      id: `cli-${Date.now()}`,
      name: newClientForm.name.trim(),
      phone: newClientForm.phone.trim(),
      address: newClientForm.address.trim() || 'Ouagadougou, Burkina Faso',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveClient(newClient);
    setSelectedClientId(newClient.id);
    setIsNewClientModalOpen(false);
  };

  // Validate Final Sale
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const client = clients.find(c => c.id === selectedClientId) || {
      id: 'cli-anonymous',
      name: 'Client de passage (Boutique)',
      phone: ''
    };

    const salePayload = {
      id: `sale-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        variant: item.variant || null,
        qty: item.qty,
        price: item.product.salePrice
      })),
      totalAmount: cartTotal,
      paymentType,
      advancePaid: parsedAdvance,
      advanceMethod: paymentType === 'CASH' ? cashPaymentMethod : advanceMethod,
      remainingDue: paymentType === 'CASH' ? 0 : remainingDue,
      dueDate: paymentType === 'CREDIT' ? dueDate : null,
      status: paymentType === 'CASH' || remainingDue === 0 ? 'PAID' : 'PARTIAL',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveSale(salePayload, salePayload.advanceMethod);

    // Automatically trigger receipt modal
    if (onOpenReceiptModal) {
      onOpenReceiptModal(salePayload);
    }

    setCart([]);
    setAdvancePaid('');
    setSelectedClientId('');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2rem border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans">
              Prise de Commande & Caisse Enregistreuse
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sélectionnez les articles, attribuez le client et générez le reçu officiel en 1 clic.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="btn-magnetic bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-2rem flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>Scanner Code-Barres</span>
          </button>

          <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-3 py-1.5 rounded-2rem flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Caisse Ouverte
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Catalog Item Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Chercher par nom, catégorie ou code-barre..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2rem bg-white border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2rem border border-emerald-200 flex items-center justify-center transition-colors"
              title="Scanner un code-barres"
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const inCart = cart.filter(item => item.product.id === product.id);
              const totalInCartQty = inCart.reduce((sum, i) => sum + i.qty, 0);
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className={`p-3 rounded-2rem border transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isOutOfStock
                      ? 'bg-gray-100 border-gray-200 opacity-60'
                      : totalInCartQty > 0
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-white hover:bg-emerald-50/40 border-emerald-100 hover:shadow'
                  }`}
                >
                  {totalInCartQty > 0 && (
                    <span className="absolute top-2 right-2 bg-[#064E3B] text-emerald-300 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                      {totalInCartQty}
                    </span>
                  )}

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/80">
                        {product.category}
                      </span>
                      {product.barcode && (
                        <span className="text-[9px] font-mono text-gray-400">
                          {product.barcode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Variants Quick Select Buttons */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100/80">
                      <span className="text-[10px] text-gray-400 font-semibold block mb-1">
                        Variante / Taille :
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((v) => (
                          <button
                            key={v}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(product, v)}
                            className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-700 text-[10px] font-bold transition-colors"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-700 font-mono">
                      {formatFCFA(product.salePrice)}
                    </span>
                    
                    {!product.variants || product.variants.length === 0 ? (
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(product)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-600 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter</span>
                      </button>
                    ) : (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOutOfStock ? 'Rupture' : `Stock: ${product.stock}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Cart Summary & Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2rem border border-emerald-200/80 shadow-md space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-[#064E3B] flex items-center gap-2 font-sans">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                Panier ({cart.reduce((a, c) => a + c.qty, 0)} articles)
              </h3>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCart([])}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Vider Panier
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center bg-[#F0FDF4] rounded-2rem border border-dashed border-emerald-200 text-emerald-700/60 space-y-1">
                <ShoppingCart className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="text-xs font-bold">Panier vide</p>
                <p className="text-[11px]">Cliquez sur un vêtement ou scannez un code-barres pour l'ajouter.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {cart.map(({ product, qty, variant }) => (
                  <div key={`${product.id}-${variant || 'default'}`} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <h5 className="font-bold text-gray-900 truncate">
                        {product.name}
                        {variant && <span className="text-emerald-700 font-bold ml-1">({variant})</span>}
                      </h5>
                      <span className="text-emerald-700 font-bold">{formatFCFA(product.salePrice)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-0.5">
                        <button 
                          onClick={() => handleUpdateQty(product.id, variant, -1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold">{qty}</span>
                        <button 
                          onClick={() => handleUpdateQty(product.id, variant, 1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => handleRemoveFromCart(product.id, variant)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Display Strip */}
            <div className="bg-[#064E3B] text-white p-4 rounded-2rem border border-emerald-600 space-y-2">
              {paymentType === 'CASH' ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-200 uppercase font-semibold">Total Payé (Comptant) :</span>
                  <span className="text-2xl font-bold text-[#10B981]">
                    {formatFCFA(cartTotal)}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-200">Avance Versée aujourd'hui :</span>
                    <span className="font-bold text-red-400 text-base">
                      {formatFCFA(parsedAdvance)}
                    </span>
                  </div>

                  <div className="w-full border-t border-emerald-600/60 my-1"></div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-200">Reste à payer (Crédit) :</span>
                    <span className="font-bold text-red-400">
                      {formatFCFA(remainingDue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-600">
                    <span className="font-semibold text-white">Montant Total Commande :</span>
                    <span className="font-bold text-white text-lg">
                      {formatFCFA(cartTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Selection Section */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-xs text-gray-700">Sélection du Client *</label>
                <button
                  type="button"
                  onClick={() => {
                    setNewClientForm({ name: '', phone: '+226', address: '' });
                    setIsNewClientModalOpen(true);
                  }}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nouveau client rapide</span>
                </button>
              </div>

              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2rem bg-gray-50 border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              >
                <option value="">-- Client de passage (Boutique) --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Toggle (COMPTANT vs CRÉDIT) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="block font-bold text-xs text-gray-700">Mode de Règlement *</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('CASH')}
                  className={`p-3 rounded-2rem text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                    paymentType === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Règlement COMPTANT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('CREDIT')}
                  className={`p-3 rounded-2rem text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                    paymentType === 'CREDIT'
                      ? 'bg-red-600 text-white border-red-700 font-bold shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Vente à CRÉDIT</span>
                </button>
              </div>

              {/* Sub-selector for CASH (Espèces vs Mobile Money) */}
              {paymentType === 'CASH' && (
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                  <label className="block font-bold text-[11px] text-emerald-900">Canal d'encaissement :</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'CASH', label: 'Espèces' },
                      { id: 'ORANGE_MONEY', label: 'Orange Money' },
                      { id: 'MOOV_MONEY', label: 'Moov Money' },
                      { id: 'WAVE', label: 'Wave' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setCashPaymentMethod(method.id)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                          cashPaymentMethod === method.id
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                            : 'bg-white text-gray-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields if CREDIT selected */}
              {paymentType === 'CREDIT' && (
                <div className="p-4 rounded-2rem bg-red-50/80 border border-red-200 space-y-3">
                  
                  {/* Somme donnée (Avance) */}
                  <div>
                    <label className="block font-bold text-xs text-red-900 mb-1">
                      Somme versée aujourd'hui (Acompte FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={cartTotal}
                      placeholder="ex: 5000 (ou 0 FCFA)"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2rem bg-white border border-red-300 font-bold text-red-600 text-sm focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Mode de l'avance */}
                  {Number(advancePaid) > 0 && (
                    <div>
                      <label className="block font-bold text-xs text-red-900 mb-1">Mode de règlement de l'avance</label>
                      <select
                        value={advanceMethod}
                        onChange={(e) => setAdvanceMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-2rem bg-white border border-red-300 text-xs font-medium"
                      >
                        <option value="CASH">Espèces</option>
                        <option value="ORANGE_MONEY">Orange Money</option>
                        <option value="MOOV_MONEY">Moov Money</option>
                        <option value="WAVE">Wave</option>
                      </select>
                    </div>
                  )}

                  {/* Visual Breakdown */}
                  <div className="bg-white p-3.5 rounded-2rem border border-red-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Somme versée (Acompte) :</span>
                      <span className="font-bold text-red-600 text-sm">
                        {formatFCFA(parsedAdvance)}
                      </span>
                    </div>

                    <div className="w-full border-t border-gray-200 my-1"></div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#064E3B] font-bold">Montant Total Commande :</span>
                      <span className="font-bold text-black text-sm">
                        {formatFCFA(cartTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Date Limite de Paiement */}
                  <div>
                    <label className="block font-bold text-xs text-red-900 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-red-700" />
                      Date Limite de Paiement *
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2rem bg-white border border-red-300 text-xs font-semibold text-gray-800 focus:outline-none"
                    />
                  </div>

                </div>
              )}

            </div>

            {/* Validation Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-2rem font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-xl ${
                cart.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white btn-magnetic shadow-emerald-500/20'
              }`}
            >
              <Receipt className="w-5 h-5 text-white" />
              <span>Valider & Générer Reçu ({formatFCFA(cartTotal)})</span>
            </button>

          </div>
        </div>

      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          products={products}
          onSelectProduct={(product) => handleAddToCart(product)}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Fast New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2rem max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-[#064E3B] font-sans">Création Rapide de Client</h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-xs text-gray-700 mb-1">Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Roukiatou Kaboré"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({...newClientForm, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-2rem bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-700 mb-1">WhatsApp (+226...) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+22670998877"
                  value={newClientForm.phone}
                  onChange={(e) => setNewClientForm({...newClientForm, phone: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-2rem bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-2rem bg-gray-100 text-gray-700 text-xs hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2rem bg-[#064E3B] text-white font-bold text-xs hover:bg-emerald-900 border border-emerald-600 shadow-md"
                >
                  Créer et Sélectionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PosModule;
