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
  List, 
  Trash2, 
  Receipt, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MapPin,
  Tag
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';
import { buildWhatsappLink } from '../utils/whatsappAi';

const ClientModule = ({ 
  clients = [], 
  sales = [], 
  payments = [], 
  onSaveClient, 
  onDeleteClient,
  onDeleteSale,
  onDeletePayment,
  userRole = 'ADMIN',
  onOpenCreditModal,
  onOpenReceiptModal,
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
    const totalPurchased = clientSales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
    const totalDue = clientSales.reduce((acc, s) => acc + (Number(s.remainingDue !== undefined ? s.remainingDue : s.remainingBalance) || 0), 0);
    const totalPaid = Math.max(0, totalPurchased - totalDue);
    const clientPayments = payments.filter(p => p.clientId === clientId);

    return {
      sales: clientSales,
      payments: clientPayments,
      totalPurchased,
      totalPaid,
      totalDue,
      ordersCount: clientSales.length
    };
  };

  const handleDelete = (e, clientId) => {
    if (e) e.stopPropagation();
    if (onDeleteClient) {
      onDeleteClient(clientId);
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null);
      }
    }
  };

  // Filter clients list
  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || 
           (c.phone && c.phone.includes(term)) ||
           (c.company && c.company.toLowerCase().includes(term)) ||
           (c.address && c.address.toLowerCase().includes(term));
  });

  // Top Global Metrics for Client Header
  const totalClientsCount = clients.length;
  const clientsWithDebt = clients.filter(c => getClientFinancials(c.id).totalDue > 0).length;
  const totalDebtSum = clients.reduce((acc, c) => acc + getClientFinancials(c.id).totalDue, 0);

  // Selected client active calculations
  const activeClientFinancials = selectedClient ? getClientFinancials(selectedClient.id) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans tracking-tight">
              Gestion des Clients & Comptes
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Portefeuille clients, historique complet des factures, fiches d'achats et suivi des créances.
          </p>
        </div>

        <button
          onClick={handleOpenClientModal}
          className="btn-magnetic bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>+ Nouveau Client</span>
        </button>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Clients */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Portefeuille Clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalClientsCount}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-semibold">Enregistrés</span>
        </div>

        {/* Metric 2: Clients à Crédit */}
        <div 
          onClick={() => setActiveTab && setActiveTab('relances')}
          className="bg-white p-5 rounded-3xl border border-red-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-red-700 uppercase font-bold">Clients Débiteurs</p>
              <p className="text-2xl font-bold text-red-600">{clientsWithDebt}</p>
            </div>
          </div>
          <span className="text-xs text-red-600 font-bold bg-red-100 px-2.5 py-1 rounded-full">
            Relancer &rarr;
          </span>
        </div>

        {/* Metric 3: Total En-cours Créances */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Encours Créances Total</p>
              <p className="text-2xl font-bold text-red-600">{formatFCFA(totalDebtSum)}</p>
            </div>
          </div>
          <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
            À recouvrer
          </span>
        </div>
      </div>

      {/* Search & Layout View Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client par nom, téléphone, entreprise, quartier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-[#064E3B] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grille Cartes</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'table' ? 'bg-[#064E3B] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Vue Tableau</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        filteredClients.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucun client trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => {
              const financials = getClientFinancials(client.id);
              const initial = (client.name || 'C').charAt(0).toUpperCase();

              const overdueSale = financials.sales.find(s => (s.remainingDue || s.remainingBalance || 0) > 0);
              const waLink = overdueSale 
                ? buildWhatsappLink(client.phone, client.name, overdueSale.remainingDue || overdueSale.remainingBalance, overdueSale.dueDate, overdueSale.id)
                : `https://wa.me/${(client.phone || '').replace(/[^0-9]/g, '')}`;

              return (
                <div 
                  key={client.id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                >
                  <div>
                    {/* Top Client Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#064E3B] text-white font-bold text-lg flex items-center justify-center border-2 border-emerald-400 shadow-sm">
                          {initial}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 font-sans text-base leading-snug">
                            {client.name}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            {client.company || 'Particulier'}
                          </p>
                        </div>
                      </div>

                      {financials.totalDue > 0 ? (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-200">
                          Reste dû
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                          À jour
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

                      {client.address && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> Adresse :
                          </span>
                          <span className="text-gray-700 truncate max-w-[160px]" title={client.address}>
                            {client.address}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> Factures / Achats :
                        </span>
                        <strong className="text-gray-900">{financials.ordersCount} commande(s)</strong>
                      </div>
                    </div>

                    {/* Financial Stats */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F0FDF4] p-3 rounded-2xl border border-emerald-100 mb-4">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Achats</span>
                        <p className="text-sm font-bold text-gray-900">
                          {formatFCFA(financials.totalPurchased)}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">Reste à Payer</span>
                        <p className={`text-sm font-bold ${financials.totalDue > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {formatFCFA(financials.totalDue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 bg-[#064E3B] hover:bg-emerald-900 text-white py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                      title="Ouvrir la fiche et l'historique complet des factures"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Fiche & Historique</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                    </button>

                    {client.phone && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-2xl flex items-center justify-center transition-all shadow"
                        title="Envoyer un message WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {userRole === 'ADMIN' && (
                      <button
                        onClick={(e) => handleDelete(e, client.id)}
                        className="p-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer ce client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase text-gray-500 font-semibold">
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4">Adresse</th>
                  <th className="py-3.5 px-4 text-center">Commandes</th>
                  <th className="py-3.5 px-4 text-right">Achats Cumulés</th>
                  <th className="py-3.5 px-4 text-right">Solde Dû</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredClients.map((client) => {
                  const financials = getClientFinancials(client.id);
                  return (
                    <tr key={client.id} className="hover:bg-[#F0FDF4] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 font-sans text-sm">{client.name}</div>
                        <div className="text-[11px] text-gray-400">{client.company || 'Particulier'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">{client.phone}</td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-[150px] truncate">{client.address || '—'}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {financials.ordersCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {formatFCFA(financials.totalPurchased)}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-extrabold ${financials.totalDue > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {formatFCFA(financials.totalDue)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition-all flex items-center space-x-1"
                          >
                            <span>Fiche & Historique</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          {userRole === 'ADMIN' && (
                            <button
                              onClick={(e) => handleDelete(e, client.id)}
                              className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer ce client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 MODAL FICHE & HISTORIQUE CLIENT COMPLET (ACHATS, FACTURES, RÈGLEMENTS) */}
      {/* ========================================================================= */}
      {selectedClient && activeClientFinancials && (
        <div className="fixed inset-0 bg-[#064E3B]/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white text-gray-900 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#064E3B] via-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-700">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-emerald-400 text-emerald-200 font-bold text-2xl flex items-center justify-center shadow-md">
                  {(selectedClient.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-xl sm:text-2xl font-sans tracking-tight">
                      {selectedClient.name}
                    </h3>
                    {activeClientFinancials.totalDue > 0 ? (
                      <span className="bg-red-500/20 text-red-300 border border-red-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Solde Débiteur
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Compte à Jour
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-200/90 mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-emerald-300" />
                      {selectedClient.company || 'Client Particulier'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-300" />
                      {selectedClient.phone}
                    </span>
                    {selectedClient.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                        {selectedClient.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal Header */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                {selectedClient.phone && (
                  <>
                    <a
                      href={`tel:${selectedClient.phone}`}
                      className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Appeler par téléphone"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/${(selectedClient.phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center space-x-1.5 text-xs font-bold shadow"
                      title="Ouvrir WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </>
                )}

                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(null, selectedClient.id)}
                    className="p-2.5 rounded-2xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white transition-colors"
                    title="Supprimer ce client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button 
                  onClick={() => setSelectedClient(null)} 
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
              
              {/* Financial KPI Strip inside modal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Total Achats</span>
                  <span className="text-base sm:text-lg font-extrabold text-gray-900">
                    {formatFCFA(activeClientFinancials.totalPurchased)}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {activeClientFinancials.ordersCount} commande(s)
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Total Déjà Réglé</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                    {formatFCFA(activeClientFinancials.totalPaid)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    Encaissé
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm">
                  <span className="text-[10px] text-red-700 uppercase font-bold block">Reste à Payer (Dette)</span>
                  <span className={`text-base sm:text-lg font-extrabold ${activeClientFinancials.totalDue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {formatFCFA(activeClientFinancials.totalDue)}
                  </span>
                  <span className="text-[10px] text-red-500 font-medium block mt-0.5">
                    {activeClientFinancials.totalDue > 0 ? 'Solde en attente' : 'Aucune dette'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">Date d'Inscription</span>
                  <span className="text-sm sm:text-base font-bold text-gray-800">
                    {formatDateFr(selectedClient.createdAt)}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                    Client vérifié
                  </span>
                </div>
              </div>

              {/* Section 1: Historique Complet des Achats & Factures */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-bold text-base text-gray-900 font-sans">
                      Historique des Achats & Factures ({activeClientFinancials.sales.length})
                    </h4>
                  </div>
                </div>

                {activeClientFinancials.sales.length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-300 text-center text-gray-400 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="text-sm font-medium">Ce client n'a pas encore effectué d'achats enregistrés.</p>
                    <p className="text-xs text-gray-400">Passez par la Caisse & Vente POS pour enregistrer une première vente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeClientFinancials.sales.map((sale) => {
                      const remaining = Number(sale.remainingDue !== undefined ? sale.remainingDue : sale.remainingBalance) || 0;
                      const paid = Number(sale.amountPaid !== undefined ? sale.amountPaid : sale.advancePaid) || 0;
                      const isCredit = remaining > 0;

                      return (
                        <div 
                          key={sale.id}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all space-y-3"
                        >
                          {/* Invoice Top Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-xl bg-gray-100 text-gray-800">
                                #{sale.id.replace('sale-', '').substring(0, 8)}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {formatDateFr(sale.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {isCredit ? (
                                <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Crédit (Reste: {formatFCFA(remaining)})</span>
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Payé au Comptant</span>
                                </span>
                              )}

                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                                {sale.paymentMethod || sale.paymentType || 'CASH'}
                              </span>
                            </div>
                          </div>

                          {/* Items Breakdown Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-gray-400 border-b border-gray-100 pb-1">
                                  <th className="py-1 font-semibold">Article / Produit</th>
                                  <th className="py-1 font-semibold text-center">Variante</th>
                                  <th className="py-1 font-semibold text-center">Qté</th>
                                  <th className="py-1 font-semibold text-right">Prix Unitaire</th>
                                  <th className="py-1 font-semibold text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {Array.isArray(sale.items) && sale.items.map((item, idx) => (
                                  <tr key={idx} className="text-gray-700">
                                    <td className="py-1.5 font-bold text-gray-900">
                                      {item.name}
                                    </td>
                                    <td className="py-1.5 text-center text-gray-500">
                                      {item.variant || 'Standard'}
                                    </td>
                                    <td className="py-1.5 text-center font-bold">
                                      {item.qty}
                                    </td>
                                    <td className="py-1.5 text-right text-gray-600">
                                      {formatFCFA(item.price)}
                                    </td>
                                    <td className="py-1.5 text-right font-bold text-gray-900">
                                      {formatFCFA(item.qty * item.price)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Invoice Financial Footer & Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 bg-gray-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 rounded-b-2xl">
                            <div className="flex items-center space-x-4 text-xs">
                              <div>
                                <span className="text-gray-500 text-[11px]">Total Facture : </span>
                                <strong className="text-gray-900 font-bold">{formatFCFA(sale.totalAmount)}</strong>
                              </div>
                              <div>
                                <span className="text-gray-500 text-[11px]">Versé : </span>
                                <strong className="text-emerald-700 font-bold">{formatFCFA(paid)}</strong>
                              </div>
                              {isCredit && (
                                <div>
                                  <span className="text-red-600 text-[11px] font-bold">Reste Dû : </span>
                                  <strong className="text-red-600 font-extrabold">{formatFCFA(remaining)}</strong>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {onOpenReceiptModal && (
                                <button
                                  onClick={() => onOpenReceiptModal(sale)}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 flex items-center space-x-1 transition-all"
                                  title="Imprimer ou afficher le reçu thermique"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Voir Reçu</span>
                                </button>
                              )}

                              {isCredit && onOpenCreditModal && (
                                <button
                                  onClick={() => onOpenCreditModal(sale)}
                                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow flex items-center space-x-1 transition-all"
                                  title="Enregistrer un versement pour solder la créance"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>Régler Crédit</span>
                                </button>
                              )}

                              {onDeleteSale && (
                                <button
                                  onClick={() => onDeleteSale(sale.id)}
                                  className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all"
                                  title="Supprimer cette vente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Historique des Règlements de Dette */}
              {activeClientFinancials.payments.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-base text-gray-900 font-sans">
                      Historique des Règlements & Acomptes ({activeClientFinancials.payments.length})
                    </h4>
                  </div>

                  <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-purple-50 text-purple-900 font-bold border-b border-purple-100">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Montant Encaissé</th>
                          <th className="p-3">Mode Règlement</th>
                          <th className="p-3">Note / Référence</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-50">
                        {activeClientFinancials.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="p-3 font-medium text-gray-600">
                              {formatDateFr(p.date)}
                            </td>
                            <td className="p-3 font-extrabold text-emerald-700">
                              +{formatFCFA(p.amount)}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                {p.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500 text-[11px]">
                              {p.note || 'Règlement de dette'}
                            </td>
                            <td className="p-3 text-right">
                              {onDeletePayment && (
                                <button
                                  onClick={() => onDeletePayment(p.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Supprimer ce paiement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Fiche client mise à jour en temps réel
              </span>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                Fermer la Fiche
              </button>
            </div>

          </div>
        </div>
      )}

      {/* New Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#064E3B] text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-lg font-sans">Nouveau Client</h3>
              </div>
              <button onClick={() => setIsClientModalOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mariam Ouédraogo"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Numéro Téléphone (WhatsApp) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: +22670123456"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Entreprise / Société (optionnelle)
                </label>
                <input
                  type="text"
                  placeholder="ex: Faso Fashion SARL"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Adresse / Quartier (optionnelle)
                </label>
                <input
                  type="text"
                  placeholder="ex: Ouaga 2000, Secteur 15"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-magnetic bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs shadow-md"
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
