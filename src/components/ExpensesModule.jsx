import React, { useState } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  DollarSign, 
  Calendar, 
  FileSpreadsheet, 
  Building, 
  Zap, 
  Truck, 
  Users, 
  Package, 
  Wrench, 
  Receipt,
  X,
  CheckCircle2,
  PieChart,
  Tag
} from 'lucide-react';
import { formatFCFA, formatDateFr, exportToCsv } from '../utils/storage';

const EXPENSE_CATEGORIES = [
  { id: 'Toutes', name: 'Toutes les catégories', icon: Tag, color: 'bg-gray-100 text-gray-800' },
  { id: 'Loyer', name: 'Loyer Boutique', icon: Building, color: 'bg-purple-100 text-purple-800' },
  { id: 'Électricité / Eau', name: 'Électricité & Eau (SONABEL/ONEA)', icon: Zap, color: 'bg-amber-100 text-amber-800' },
  { id: 'Transport / Livraison', name: 'Transport & Livraisons', icon: Truck, color: 'bg-blue-100 text-blue-800' },
  { id: 'Salaires', name: 'Salaires & Commissions', icon: Users, color: 'bg-emerald-100 text-emerald-800' },
  { id: 'Fournitures', name: 'Fournitures & Emballages', icon: Package, color: 'bg-pink-100 text-pink-800' },
  { id: 'Maintenance', name: 'Maintenance & Réparations', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
  { id: 'Autre', name: 'Autres Frais Généraux', icon: Receipt, color: 'bg-gray-100 text-gray-800' }
];

const ExpensesModule = ({ expenses = [], onSaveExpense, onDeleteExpense, userRole = 'ADMIN' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Loyer',
    amount: '',
    paymentMethod: 'CASH',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // KPI Calculations
  const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
  const totalCount = expenses.length;

  // Breakdown per category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'Aucune';
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

  // Filtered Expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.note && exp.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'Toutes' || exp.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = () => {
    setFormData({
      title: '',
      category: 'Loyer',
      amount: '',
      paymentMethod: 'CASH',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    const newExpense = {
      id: `exp-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      date: formData.date,
      note: formData.note.trim()
    };

    onSaveExpense(newExpense);
    setIsModalOpen(false);
  };

  const handleExportExpenses = () => {
    const rows = expenses.map(exp => ({
      ID: exp.id,
      Date: exp.date,
      Titre: exp.title,
      Categorie: exp.category,
      Montant_FCFA: exp.amount,
      Mode_Paiement: exp.paymentMethod,
      Notes: exp.note || ''
    }));
    exportToCsv(`depenses_boutique_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans">
              Gestion des Dépenses & Petite Caisse
            </h2>
            <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">
              Charges Opérationnelles
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suivi des frais de la boutique (loyer, factures, transport, salaires) pour calculer le bénéfice net réel.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExpenses}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="btn-magnetic bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Dépense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Dépenses */}
        <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Dépenses Enregistrées
            </span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {formatFCFA(totalExpenses)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {totalCount} opération(s) de dépenses au total
          </p>
        </div>

        {/* Card 2: Poste Principal */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Poste Principal de Charge
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-800 mt-2 truncate">
            {topCategoryName}
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            {formatFCFA(topCategoryAmount)} ({totalExpenses > 0 ? Math.round((topCategoryAmount / totalExpenses) * 100) : 0}% du total)
          </p>
        </div>

        {/* Card 3: Moyenne par Dépense */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dépense Moyenne
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">
            {formatFCFA(totalCount > 0 ? Math.round(totalExpenses / totalCount) : 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Par opération enregistrée
          </p>
        </div>

      </div>

      {/* Category breakdown mini progress cards */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-emerald-600" />
          Répartition des charges de la boutique
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(categoryTotals).map(([cat, amount]) => {
            const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
            return (
              <div key={cat} className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-bold text-gray-700 truncate">{cat}</div>
                <div className="text-xs font-extrabold text-red-600 mt-1">{formatFCFA(amount)}</div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="text-[10px] text-gray-400 text-right mt-0.5">{percent}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une dépense (ex: Loyer, SONABEL, taxi, sachets...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none"
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase">
            Historique des Dépenses ({filteredExpenses.length})
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune dépense trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Intitulé de la Dépense</th>
                  <th className="p-3.5">Catégorie</th>
                  <th className="p-3.5">Mode Règlement</th>
                  <th className="p-3.5 text-right">Montant</th>
                  {userRole === 'ADMIN' && <th className="p-3.5 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 text-gray-600 font-medium">
                      {formatDateFr(exp.date)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{exp.title}</div>
                      {exp.note && <div className="text-[11px] text-gray-400 mt-0.5">{exp.note}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        exp.paymentMethod === 'CASH' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : exp.paymentMethod === 'ORANGE_MONEY' 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {exp.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-red-600 text-sm">
                      -{formatFCFA(exp.amount)}
                    </td>
                    {userRole === 'ADMIN' && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer cette dépense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-lg text-gray-900 font-sans">
                  Enregistrer une Dépense
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Motif / Intitulé de la dépense *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Facture SONABEL, Achat sachets, Transport colis..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-300 font-semibold focus:outline-none"
                  >
                    <option value="Loyer">Loyer Boutique</option>
                    <option value="Électricité / Eau">Électricité & Eau</option>
                    <option value="Transport / Livraison">Transport & Livraisons</option>
                    <option value="Salaires">Salaires & Commissions</option>
                    <option value="Fournitures">Fournitures & Emballages</option>
                    <option value="Maintenance">Maintenance & Réparations</option>
                    <option value="Autre">Autre charge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Montant (FCFA) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="ex: 15000"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-red-300 text-red-600 font-extrabold focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mode de Paiement *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-300 font-semibold focus:outline-none"
                  >
                    <option value="CASH">Espèces (Caisse boutique)</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="MOOV_MONEY">Moov Money</option>
                    <option value="WAVE">Wave</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-2xl bg-gray-50 border border-gray-300 font-semibold focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Note complémentaire (optionnelle)</label>
                <input
                  type="text"
                  placeholder="ex: Reçu #4592, payé à M. Traoré"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20"
                >
                  Enregistrer la Dépense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ExpensesModule;
