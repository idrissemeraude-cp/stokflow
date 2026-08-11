import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  DollarSign, 
  TrendingUp,
  Image as ImageIcon,
  X,
  Check,
  PackageCheck,
  PackageX,
  SlidersHorizontal,
  ChevronRight,
  FileSpreadsheet,
  Barcode as BarcodeIcon,
  Layers,
  Lock
} from 'lucide-react';
import { formatFCFA } from '../utils/storage';

const CATEGORIES = ['Tous', 'Robes', 'Ensembles', 'Chemises', 'Boubous', 'Chaussures', 'Accessoires'];

const StockModule = ({ 
  products = [], 
  onSaveProduct, 
  onDeleteProduct, 
  userRole = 'ADMIN',
  onOpenCsvModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State with Barcode & Variants
  const [formData, setFormData] = useState({
    name: '',
    category: 'Robes',
    salePrice: '',
    purchasePrice: '',
    stock: '',
    lowStockThreshold: 2,
    barcode: '',
    variantsStr: 'S, M, L, XL'
  });

  // Total Summary KPI Counters for Stock Header
  const totalProductsCount = products.length;
  const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 2)).length;
  const inStockCount = products.filter(p => p.stock > (p.lowStockThreshold || 2)).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  // Filter products
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || 
                          p.category.toLowerCase().includes(term) ||
                          (p.barcode && p.barcode.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.stock <= p.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        salePrice: product.salePrice,
        purchasePrice: product.purchasePrice || 0,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold || 2,
        barcode: product.barcode || `BF-${product.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
        variantsStr: product.variants ? product.variants.join(', ') : 'Standard'
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Robes',
        salePrice: '',
        purchasePrice: '',
        stock: '',
        lowStockThreshold: 2,
        barcode: `BF-ART-${Date.now().toString().slice(-4)}`,
        variantsStr: 'S, M, L, XL'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.salePrice || formData.stock === '') return;

    const variants = formData.variantsStr
      ? formData.variantsStr.split(',').map(v => v.trim()).filter(Boolean)
      : ['Standard'];

    const productPayload = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      salePrice: Number(formData.salePrice),
      purchasePrice: Number(formData.purchasePrice || 0),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold || 2),
      barcode: formData.barcode.trim() || `BF-GEN-${Date.now()}`,
      variants: variants.length > 0 ? variants : ['Standard'],
      image: editingProduct?.image || 'https://images.unsplash.com/photo-1590549326166-7e0760d8bee3?w=500&auto=format&fit=crop&q=60'
    };

    onSaveProduct(productPayload);
    handleCloseModal();
  };

  const handleQuickAdjustStock = (product, delta) => {
    const updated = {
      ...product,
      stock: Math.max(0, product.stock + delta)
    };
    onSaveProduct(updated);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelectProduct = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2rem border border-emerald-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans tracking-tight">
              Gestion du Stock & Variantes
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Articles, déclinaisons (tailles/couleurs), codes-barres et alertes automatiques de réapprovisionnement.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenCsvModal}
            className="px-3.5 py-2.5 rounded-2rem bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span>Import / Export CSV</span>
          </button>          {userRole === 'ADMIN' && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-magnetic bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2rem shadow-md flex items-center justify-center space-x-1.5 text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Article</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Counter Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Counter 1: Total Products */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2rem bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Références</p>
              <p className="text-2xl font-bold text-gray-900">{totalProductsCount}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{totalStockUnits} unités</span>
        </div>

        {/* Counter 2: Low Stock Alerts (Red) */}
        <div 
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`bg-white p-5 rounded-2rem border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            showLowStockOnly ? 'border-red-500 ring-2 ring-red-500/20' : 'border-red-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2rem bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-red-800 uppercase font-semibold">Alertes Stock Bas</p>
              <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
            </div>
          </div>
          <span className="text-xs text-red-600 font-semibold">{showLowStockOnly ? 'Filtré' : 'Voir'}</span>
        </div>

        {/* Counter 3: In Stock */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2rem bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">En Stock Normal</p>
              <p className="text-2xl font-bold text-emerald-700">{inStockCount}</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-semibold">Optimal</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2rem border border-emerald-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, catégorie, code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2rem bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#064E3B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2rem border border-emerald-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3.5 px-4">Article & Variantes</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4 text-right">Prix Vente</th>
                <th className="py-3.5 px-4 text-right">Prix Achat</th>
                <th className="py-3.5 px-4 text-center">Niveau Stock</th>
                <th className="py-3.5 px-4 text-center">Ajustement Rapide</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isLow = p.stock <= p.lowStockThreshold;
                  const isOut = p.stock === 0;

                  return (
                    <tr 
                      key={p.id}
                      className={`hover:bg-[#F0FDF4] transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(p.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Product Name, Code-barre & Variants */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-900 font-sans leading-snug">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {p.barcode && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-200">
                                ❚❚ {p.barcode}
                              </span>
                            )}
                            {p.variants && p.variants.length > 0 && (
                              <span className="text-[10px] text-gray-500">
                                Var: {p.variants.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {p.category}
                        </span>
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                        {formatFCFA(p.salePrice)}
                      </td>

                      {/* Purchase Price (Hidden for Cashier) */}
                      <td className="py-3.5 px-4 text-right text-gray-500">
                        {userRole === 'ADMIN' ? (
                          formatFCFA(p.purchasePrice || 0)
                        ) : (
                          <span className="text-gray-400 font-mono text-xs flex items-center justify-end gap-1">
                            <Lock className="w-3 h-3 text-gray-400" />
                            ***
                          </span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                            isOut
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isLow
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isOut ? (
                              <>Rupture ({p.stock})</>
                            ) : isLow ? (
                              <><AlertTriangle className="w-3 h-3 text-red-600" /> Stock bas ({p.stock})</>
                            ) : (
                              <>En stock ({p.stock})</>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Quick Adjust +/- Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center bg-gray-100 rounded-2rem p-1 border border-gray-200">
                          <button
                            onClick={() => handleQuickAdjustStock(p, -1)}
                            title="Diminuer le stock (-1)"
                            className="w-6 h-6 rounded-full bg-white hover:bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-sm transition-all text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-xs">
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleQuickAdjustStock(p, 1)}
                            title="Augmenter le stock (+1)"
                            className="w-6 h-6 rounded-full bg-white hover:bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Modifier l'article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {userRole === 'ADMIN' && (
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Supprimer du stock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 italic">
                    Aucun article trouvé avec ces critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-lg rounded-2rem shadow-2xl overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#064E3B] text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-lg font-sans">
                  {editingProduct ? 'Modifier l\'Article' : 'Ajouter un Nouvel Article'}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nom de l'article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Robe Bazin Richesse Brodé"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    {CATEGORIES.filter(c => c !== 'Tous').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Stock Initial *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="ex: 10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Prix Vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="ex: 25000"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-emerald-300 rounded-2rem font-extrabold text-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Prix Achat (Coût FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="ex: 15000"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem focus:outline-none"
                  />
                </div>
              </div>

              {/* Barcode & Variants Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Code-Barre / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="ex: BF-ROB-001"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Variantes (Tailles / Couleurs)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: S, M, L, XL"
                    value={formData.variantsStr}
                    onChange={(e) => setFormData({ ...formData, variantsStr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-2rem text-xs text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-magnetic bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-2rem text-xs shadow-md"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default StockModule;
