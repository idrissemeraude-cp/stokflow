import React, { useState } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  Package, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  ShoppingCart, 
  Calendar,
  MessageSquareText,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Layers,
  Sparkles,
  Download,
  Filter
} from 'lucide-react';
import { formatFCFA, formatDateFr, getDebtUrgencyStatus } from '../utils/storage';

const DashboardModule = ({ 
  sales = [], 
  products = [], 
  clients = [], 
  payments = [], 
  setActiveTab,
  onOpenCreditModal
}) => {
  const [chartPeriod, setChartPeriod] = useState('6_MONTHS');

  // KPI Calculations
  const totalSalesCount = sales.length;
  
  // Encaissements totaux reçus (Green)
  const totalCashCollected = sales.reduce((acc, sale) => {
    if (sale.paymentType === 'CASH') return acc + sale.totalAmount;
    return acc + (sale.advancePaid || 0);
  }, 0) + payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Total Créances Restantes à recouvrer (Red)
  const totalPendingCredit = sales.reduce((acc, sale) => acc + (sale.remainingDue || 0), 0);

  // Valeur totale du stock
  const totalStockValue = products.reduce((acc, p) => acc + (p.salePrice * p.stock), 0);
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  // Articles en alerte stock bas
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  // Ventes nécessitant une relance urgente
  const creditSalesToRemind = sales.filter(s => s.paymentType === 'CREDIT' && s.remainingDue > 0);

  // Recent Stock & Cash Movements stream
  const recentMovements = [
    ...sales.map(s => ({
      id: `m-sale-${s.id}`,
      type: 'VENTE',
      title: `Vente Caisse #${s.id.replace('sale-', '')}`,
      subtitle: `${s.clientName} • ${s.items.length} article(s)`,
      amount: s.paymentType === 'CASH' 
        ? `+${formatFCFA(s.totalAmount)} (Comptant)`
        : `Acompte: ${formatFCFA(s.advancePaid)} / Total: ${formatFCFA(s.totalAmount)}`,
      amountColor: s.paymentType === 'CASH' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold',
      badge: s.paymentType === 'CASH' ? 'Payé Espèces (Vert)' : 'Avance Crédit (Rouge)',
      badgeColor: s.paymentType === 'CASH' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700',
      icon: ShoppingCart,
      iconBg: s.paymentType === 'CASH' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
      date: formatDateFr(s.createdAt)
    })),
    ...payments.map(p => ({
      id: `m-pay-${p.id}`,
      type: 'REGLEMENT',
      title: `Règlement Créance`,
      subtitle: `${p.clientName} via ${p.paymentMethod.replace('_', ' ')}`,
      amount: `+${formatFCFA(p.amount)} (Règlement)`,
      amountColor: 'text-emerald-600 font-bold',
      badge: 'Encaissement (Vert)',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600',
      date: formatDateFr(p.date)
    })),
    ...products.filter(p => p.stock <= p.lowStockThreshold).map(p => ({
      id: `m-stock-${p.id}`,
      type: 'STOCK_ALERT',
      title: `Stock Bas : ${p.name}`,
      subtitle: `Reste ${p.stock} unité(s) en boutique`,
      amount: `${p.stock} restant`,
      amountColor: 'text-red-600 font-bold',
      badge: 'Alerte Stock',
      badgeColor: 'bg-red-100 text-red-700',
      icon: AlertTriangle,
      iconBg: 'bg-red-50 text-red-600',
      date: 'Aujourd\'hui'
    }))
  ].slice(0, 5);

  // Top clients ranking
  const topClients = clients.map(client => {
    const clientSales = sales.filter(s => s.clientId === client.id);
    const totalSpent = clientSales.reduce((acc, s) => acc + s.totalAmount, 0);
    return {
      ...client,
      totalSpent,
      salesCount: clientSales.length
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4);

  const maxSpent = Math.max(...topClients.map(c => c.totalSpent), 1);

  // Chart dataset for Inventory vs Sales
  const chartMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];
  const inventoryValues = [450, 420, 380, 510, 490, 530, 480, 550];
  const salesValues = [280, 320, 410, 390, 480, 520, 610, 670];
  const maxChartVal = 700;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-[#064E3B] text-white p-6 sm:p-8 rounded-2rem border border-emerald-600 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-800/80 text-emerald-200 text-xs uppercase font-semibold px-3 py-1 rounded-full border border-emerald-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                StockFlow Pro • Vue Synthétique
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2 font-sans">
              Tableau de Bord Commercial
            </h2>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Consultez en un coup d'œil l'état de votre trésorerie, la valeur du stock, les mouvements récents et relancez les clients débiteurs en 1-clic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('pos')}
              className="btn-magnetic bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-3 rounded-2rem shadow-lg shadow-emerald-900/30 flex items-center space-x-2 text-sm transition-all"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>+ Nouvelle Vente (POS)</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-2rem border border-white/20 text-sm flex items-center space-x-2 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Rapports Pro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Recettes Totales */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase font-semibold">Recettes Encaissées (Vert)</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {formatFCFA(totalCashCollected)}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +3.2%
            </span>
            <span className="text-xs text-gray-400">vs mois dernier</span>
          </div>
        </div>

        {/* KPI 2 : Alertes Stock Bas */}
        <div 
          onClick={() => setActiveTab('stock')}
          className="bg-white p-5 rounded-2rem border border-red-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-700 uppercase font-bold">Alertes Stock Bas (Rouge)</span>
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {lowStockProducts.length} <span className="text-sm font-normal text-gray-500">article(s)</span>
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Attention requise
            </span>
            <span className="text-xs text-gray-400 group-hover:text-red-600 transition-colors">Voir stock &rarr;</span>
          </div>
        </div>

        {/* KPI 3 : Total Articles en Stock */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase font-semibold">Stock Total</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {totalStockCount} <span className="text-sm font-normal text-gray-500">unités</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {products.length} références d'articles
          </p>
        </div>

        {/* KPI 4 : Valeur Totale du Stock */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase font-semibold">Valeur du Stock</span>
            <div className="w-9 h-9 rounded-full bg-[#F0FDF4] text-[#064E3B] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatFCFA(totalStockValue)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Estimation au prix de vente
          </p>
        </div>
      </div>

      {/* Interactive Chart: Inventory vs Sales */}
      <div className="bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-[#064E3B] font-sans text-lg">
              Évolution du Stock vs Ventes (Inventory vs Sales)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Comparaison mensuelle entre les volumes de ventes encaissées et le niveau de stock en boutique.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-400"></span>
              <span className="text-gray-600">Stock (Inventory)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-gray-600">Ventes (Sales)</span>
            </div>
          </div>
        </div>

        {/* Bar + Line Combined Visual Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[550px] h-64 flex items-end justify-between gap-4 pt-8 pb-4 border-b border-gray-100 px-4">
            {chartMonths.map((month, idx) => {
              const invHeight = (inventoryValues[idx] / maxChartVal) * 100;
              const saleHeight = (salesValues[idx] / maxChartVal) * 100;

              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#064E3B] text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none z-20 whitespace-nowrap">
                    Ventes: {salesValues[idx]}k FCFA • Stock: {inventoryValues[idx]}k
                  </div>

                  <div className="w-full flex items-end justify-center space-x-1.5 h-full">
                    <div 
                      className="w-4 sm:w-6 bg-emerald-100 group-hover:bg-emerald-200 rounded-t-md transition-all"
                      style={{ height: `${invHeight}%` }}
                    ></div>
                    <div 
                      className="w-4 sm:w-6 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-md transition-all shadow-sm"
                      style={{ height: `${saleHeight}%` }}
                    ></div>
                  </div>

                  <span className="text-[11px] text-gray-500 mt-2 font-semibold">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Movements */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#064E3B] font-sans text-base">
                Mouvements Récents & Activités
              </h3>
              <p className="text-xs text-gray-500">
                Historique en direct des ventes en caisse, encaissements (vert) et avances créances (rouge).
              </p>
            </div>

            <button 
              onClick={() => setActiveTab('pos')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentMovements.length > 0 ? (
              recentMovements.map((mov) => {
                const Icon = mov.icon;
                return (
                  <div 
                    key={mov.id}
                    className="flex items-center justify-between p-3 rounded-2rem border border-gray-100 hover:border-emerald-200 hover:bg-[#F0FDF4] transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-2rem ${mov.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-snug">
                          {mov.title}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {mov.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold ${mov.amountColor}`}>
                        {mov.amount}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${mov.badgeColor}`}>
                        {mov.badge}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 italic py-4 text-center">Aucun mouvement récent enregistré.</p>
            )}
          </div>
        </div>

        {/* Top Clients Ranking */}
        <div className="bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#064E3B] font-sans text-base">
                  Top Clients Fidèles
                </h3>
                <p className="text-xs text-gray-500">
                  Classement par volume d'achats cumulés.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('clients')}
                className="text-xs text-emerald-700 hover:underline font-bold"
              >
                Tous
              </button>
            </div>

            <div className="space-y-4">
              {topClients.map((c, idx) => {
                const ratio = Math.round((c.totalSpent / maxSpent) * 100);
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#064E3B] text-white font-bold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <span className="font-semibold text-gray-800">{c.name}</span>
                      </div>
                      <span className="font-bold text-emerald-800">
                        {formatFCFA(c.totalSpent)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(15, ratio)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('relances')}
              className="w-full btn-magnetic bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-2.5 rounded-2rem text-xs font-bold flex items-center justify-center space-x-2 transition-all"
            >
              <MessageSquareText className="w-4 h-4 text-red-600" />
              <span>Relancer les créances en Rouge via WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardModule;
