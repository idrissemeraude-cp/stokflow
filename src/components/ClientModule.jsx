import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  CreditCard, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  History, 
  ArrowRight,
  UserCheck,
  ChevronRight,
  X,
  Mail,
  Building,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  List
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';
import { buildWhatsappLink } from '../utils/whatsappAi';

const ClientModule = ({ 
  clients = [], 
  sales = [], 
  payments = [], 
  onSaveClient, 
  onOpenCreditModal,
  setActiveTab 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // New Client Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    address: ''
  });

  const handleOpenClientModal = () => {
    setClientForm({ name: '', phone: '+226', email: '', company: '', address: '' });
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.phone.trim()) return;

    const newClient = {
      id: `cli-${Date.now()}`,
      name: clientForm.name.trim(),
      phone: clientForm.phone.trim(),
      email: clientForm.email.trim() || `${clientForm.name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      company: clientForm.company.trim() || 'Client Particulier',
      address: clientForm.address.trim() || 'Ouagadougou, Burkina Faso',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveClient(newClient);
    setIsClientModalOpen(false);
    setSelectedClient(newClient);
  };

  // Calculs financiers par client
  const getClientFinancials = (clientId) => {
    const clientSales = sales.filter(s => s.clientId === clientId);
    const totalPurchased = clientSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalDue = clientSales.reduce((acc, s) => acc + (s.remainingDue || 0), 0);
    const clientPayments = payments.filter(p => p.clientId === clientId);

    return {
      sales: clientSales,
      payments: clientPayments,
      totalPurchased,
      totalDue,
      ordersCount: clientSales.length
    };
  };

  // Filter clients list
  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || 
           c.phone.includes(term) ||
           (c.company && c.company.toLowerCase().includes(term));
  });

  // Top Global Metrics for Client Header
  const totalClientsCount = clients.length;
  const clientsWithDebt = clients.filter(c => getClientFinancials(c.id).totalDue > 0).length;
  const totalDebtSum = clients.reduce((acc, c) => acc + getClientFinancials(c.id).totalDue, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar matching StockFlow Pro Client Management */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2rem border border-emerald-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans tracking-tight">
              Gestion des Clients (Client Management)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gérez votre portefeuille clients, suivez le volume d'achats et enregistrez les règlements de créances.
          </p>
        </div>

        <button
          onClick={handleOpenClientModal}
          className="btn-magnetic bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2rem shadow-md flex items-center justify-center space-x-2 text-sm transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>+ Nouveau Client</span>
        </button>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Clients */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2rem bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Portefeuille Clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalClientsCount}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold">Actifs</span>
        </div>

        {/* Metric 2: Clients à Crédit (Red) */}
        <div 
          onClick={() => setActiveTab('relances')}
          className="bg-white p-5 rounded-2rem border border-red-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2rem bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-red-700 uppercase font-bold">Clients Débiteurs (Rouge)</p>
              <p className="text-2xl font-bold text-red-600">{clientsWithDebt}</p>
            </div>
          </div>
          <span className="text-xs text-red-600 font-bold bg-red-100 px-2.5 py-1 rounded-full">
            Relancer &rarr;
          </span>
        </div>

        {/* Metric 3: Total En-cours Créances */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2rem bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Encours Crédits (Rouge)</p>
              <p className="text-2xl font-bold text-red-600">{formatFCFA(totalDebtSum)}</p>
            </div>
          </div>
          <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
            En attente
          </span>
        </div>
      </div>

      {/* Search & Layout View Switcher */}
      <div className="bg-white p-4 rounded-2rem border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client par nom, téléphone, entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2rem text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-[#064E3B] text-white shadow' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grille Cartes</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'table' ? 'bg-[#064E3B] text-white shadow' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Vue Tableau</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const financials = getClientFinancials(client.id);
            const initial = client.name.charAt(0).toUpperCase();

            const overdueSale = financials.sales.find(s => s.remainingDue > 0);
            const waLink = overdueSale 
              ? buildWhatsappLink(client.phone, client.name, overdueSale.remainingDue, overdueSale.dueDate, overdueSale.id)
              : null;

            return (
              <div 
                key={client.id}
                className="bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  {/* Top Client Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#064E3B] text-white font-bold text-lg flex items-center justify-center border-2 border-emerald-400 shadow-sm">
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 font-sans text-base leading-snug">
                          {client.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          {client.company || 'Client Particulier'}
                        </p>
                      </div>
                    </div>

                    {financials.totalDue > 0 ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-200">
                        Reste dû (Rouge)
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        À jour (Vert)
                      </span>
                    )}
                  </div>

                  {/* Client Info List */}
                  <div className="space-y-2 text-xs border-t border-b border-gray-100 py-3 my-3 text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Téléphone :
                      </span>
                      <strong className="text-gray-900">{client.phone}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> Email :
                      </span>
                      <span className="text-gray-700 truncate max-w-[170px]">
                        {client.email || `${client.name.toLowerCase().replace(/\s+/g, '')}@mail.com`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> Total Commandes :
                      </span>
                      <strong className="text-gray-900">{financials.ordersCount} achat(s)</strong>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F0FDF4] p-3 rounded-2rem border border-emerald-100 mb-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Achats Cumulés</span>
                      <p className="text-sm font-bold text-gray-900">
                        {formatFCFA(financials.totalPurchased)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">Solde Reste Dû</span>
                      <p className={`text-sm font-bold ${financials.totalDue > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {formatFCFA(financials.totalDue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 bg-[#064E3B] hover:bg-emerald-900 text-white py-2 rounded-2rem text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>Fiche & Historique</span>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                  </button>

                  {financials.totalDue > 0 && waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-2rem flex items-center justify-center transition-all shadow"
                      title="Relancer via WhatsApp 1-Clic"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2rem border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-semibold">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4">Adresse</th>
                  <th className="py-3.5 px-4 text-right">Achats Cumulés</th>
                  <th className="py-3.5 px-4 text-right">Solde Dû</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredClients.map((client) => {
                  const financials = getClientFinancials(client.id);
                  return (
                    <tr key={client.id} className="hover:bg-[#F0FDF4] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 font-sans">{client.name}</div>
                        <div className="text-[10px] text-gray-400">{client.company || 'Particulier'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">{client.phone}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">{client.address}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {formatFCFA(financials.totalPurchased)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${financials.totalDue > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {formatFCFA(financials.totalDue)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-xs text-emerald-700 hover:underline font-bold"
                        >
                          Détails &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-2rem shadow-2xl overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#064E3B] text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-lg font-sans">Nouveau Client</h3>
              </div>
              <button onClick={() => setIsClientModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mariam Ouédraogo"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Numéro Téléphone (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: +22670123456"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Entreprise / Société
                </label>
                <input
                  type="text"
                  placeholder="ex: Faso Fashion SARL"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Adresse / Quartier
                </label>
                <input
                  type="text"
                  placeholder="ex: Ouaga 2000, Secteur 15"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2rem text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-2rem text-xs text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-magnetic bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-2rem text-xs shadow-md"
                >
                  Enregistrer Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientModule;
