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
  Filter,
  Wallet,
  Calculator,
  PiggyBank,
  TrendingDown,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { formatFCFA, formatDateFr, getDebtUrgencyStatus } from '../utils/storage';

const DashboardModule = ({ 
  sales = [], 
  products = [], 
  clients = [], 
  payments = [], 
  expenses = [],
  setActiveTab,
  onOpenCreditModal,
  onOpenReceiptModal,
  onDeleteSale,
  onDeletePayment,
  onDeleteExpense
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

  // CALCULS FINANCIERS DU STOCK ET DES BÉNÉFICES
  // 1. PRIX TOTAL D'ACHAT (Tout ce qui a été acheté en stock)
  const totalPurchasePriceStock = products.reduce((acc, p) => acc + ((Number(p.purchasePrice) || 0) * (Number(p.stock) || 0)), 0);

  // 2. PRIX TOTAL DE VENTE (Tout ce qu'on devrait recevoir si tout est vendu)
  const totalSalePriceStock = products.reduce((acc, p) => acc + ((Number(p.salePrice) || 0) * (Number(p.stock) || 0)), 0);

  // 3. BÉNÉFICE ESTIMÉ À LA FIN (Prix Total de Vente - Prix Total d'Achat)
  const expectedProfitStock = totalSalePriceStock - totalPurchasePriceStock;

  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  // CALCULS DES VENTES RÉALISÉES ET DÉPENSES
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
  const totalCostOfGoodsSold = sales.reduce((acc, s) => {
    return acc + (s.items || []).reduce((itemAcc, item) => {
      const prod = products.find(p => p.id === item.productId);
      const purchasePrice = prod ? (prod.purchasePrice || 0) : 0;
      return itemAcc + (purchasePrice * item.qty);
    }, 0);
  }, 0);
  const grossMargin = Math.max(0, totalRevenue - totalCostOfGoodsSold);
  const totalExpenses = (expenses || []).reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
  const netProfit = grossMargin - totalExpenses;

  // Articles en alerte stock bas
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  // Ventes nécessitant une relance urgente
  const creditSalesToRemind = sales.filter(s => s.paymentType === 'CREDIT' && s.remainingDue > 0);

  // Recent Stock & Cash Movements stream
  const recentMovements = [
    ...sales.map(s => ({
      id: `m-sale-${s.id}`,
      rawId: s.id,
      rawType: 'SALE',
      rawObj: s,
      type: 'VENTE',
      title: `Vente Caisse #${String(s.id || '').replace('sale-', '')}`,
      subtitle: `${s.clientName || 'Client'} • ${(s.items || []).length} article(s)`,
      amount: s.paymentType === 'CASH' 
        ? `+${formatFCFA(s.totalAmount)} (Comptant)`
        : `Acompte: ${formatFCFA(s.advancePaid)} / Total: ${formatFCFA(s.totalAmount)}`,
      amountColor: s.paymentType === 'CASH' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold',
      badge: s.paymentType === 'CASH' ? 'Payé Espèces' : 'Avance Crédit',
      badgeColor: s.paymentType === 'CASH' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700',
      icon: ShoppingCart,
      iconBg: s.paymentType === 'CASH' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
      date: formatDateFr(s.createdAt)
    })),
    ...payments.map(p => ({
      id: `m-pay-${p.id}`,
      rawId: p.id,
      rawType: 'PAYMENT',
      rawObj: p,
      type: 'REGLEMENT',
      title: `Règlement Créance`,
      subtitle: `${p.clientName || 'Client'} via ${String(p.paymentMethod || 'CASH').replace('_', ' ')}`,
      amount: `+${formatFCFA(p.amount)} (Règlement)`,
      amountColor: 'text-emerald-600 font-bold',
      badge: 'Encaissement',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600',
      date: formatDateFr(p.date)
    })),
    ...(expenses || []).map(e => ({
      id: `m-exp-${e.id}`,
      rawId: e.id,
      rawType: 'EXPENSE',
      rawObj: e,
      type: 'DEPENSE',
      title: `Dépense: ${e.title}`,
      subtitle: `${e.category || 'Divers'} via ${e.paymentMethod || 'CASH'}`,
      amount: `-${formatFCFA(e.amount)}`,
      amountColor: 'text-amber-600 font-bold',
      badge: 'Dépense',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: TrendingDown,
      iconBg: 'bg-amber-50 text-amber-600',
      date: formatDateFr(e.date)
    }))
  ].slice(0, 6);

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

  // Dynamic monthly aggregation for Inventory & Sales
  const monthNamesFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();

  const dynamicMonthsData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonthIdx - 5 + i, 1);
    const mIdx = d.getMonth();
    const yr = d.getFullYear();
    const label = monthNamesFr[mIdx];
    const monthKey = `${yr}-${String(mIdx + 1).padStart(2, '0')}`;

    const monthSalesTotal = sales
      .filter(s => s.createdAt && s.createdAt.startsWith(monthKey))
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

    const isCurrentMonth = i === 5;
    const monthStockVal = isCurrentMonth ? totalStockValue : (monthSalesTotal > 0 ? totalStockValue : 0);

    return {
      label,
      monthKey,
      salesVal: monthSalesTotal,
      stockVal: monthStockVal
    };
  });

  const chartMonths = dynamicMonthsData.map(m => m.label);
  const salesValues = dynamicMonthsData.map(m => m.salesVal);
  const inventoryValues = dynamicMonthsData.map(m => m.stockVal);
  const rawMax = Math.max(...salesValues, ...inventoryValues, 10000);
  const maxChartVal = rawMax > 0 ? rawMax : 10000;

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
        {/* KPI 1 : Prix Total d'Achat */}
        <div className="bg-white p-5 rounded-2rem border border-amber-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900 uppercase font-extrabold">Prix Total d'Achat</span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">
            {formatFCFA(totalPurchasePriceStock)}
          </p>
          <span className="text-[10px] text-gray-500 font-medium mt-2 block">
            Coût d'achat de tout ce que vous avez acheté ({totalStockCount} unités)
          </span>
        </div>

        {/* KPI 2 : Prix Total de Vente (À recevoir) */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-900 uppercase font-extrabold">Prix Total de Vente</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {formatFCFA(totalSalePriceStock)}
          </p>
          <span className="text-[10px] text-gray-500 font-medium mt-2 block">
            Montant total à recevoir si tout est vendu
          </span>
        </div>

        {/* KPI 3 : Bénéfice Attendu (À la fin) */}
        <div className="bg-white p-5 rounded-2rem border border-emerald-300 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-900 uppercase font-extrabold">Bénéfice à la fin</span>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${expectedProfitStock >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatFCFA(expectedProfitStock)}
          </p>
          <span className="text-[10px] text-emerald-800 font-bold mt-2 block">
            Bénéfice que vous êtes censé avoir (Vente - Achat)
          </span>
        </div>

        {/* KPI 4 : Bénéfice Net Réel actuel en poche */}
        <div className="bg-white p-5 rounded-2rem border border-blue-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-900 uppercase font-extrabold">Bénéfice Net Réel</span>
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            {formatFCFA(netProfit)}
          </p>
          <span className="text-[10px] text-gray-500 font-medium mt-2 block">
            Gain net réel encaissé (après ventes & dépenses)
          </span>
        </div>
      </div>

      {/* 📊 BILAN FINANCIER DÉTAILLÉ : CALCUL DU BÉNÉFICE ET DES DÉPENSES */}
      <div className="bg-gradient-to-br from-[#064E3B] via-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3rem shadow-xl border border-emerald-700/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-700/50 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2rem bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white font-sans tracking-tight">
                Bilan des Prix d'Achat, de Vente et du Bénéfice Final
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Calcul en 3 étapes : Prix d'Achat + Prix de Vente = Bénéfice à la fin.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-2rem text-xs font-bold transition-all"
            >
              Voir Compte de Résultat &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Étape 1 : Prix Total d'Achat */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2rem border border-white/10 space-y-1.5">
            <span className="text-xs text-amber-200/90 font-extrabold uppercase tracking-wider block">
              1. Prix Total d'Achat (Tout ce que vous avez acheté)
            </span>
            <p className="text-2xl font-black text-amber-300">{formatFCFA(totalPurchasePriceStock)}</p>
            <span className="text-[10px] text-amber-200/70 block">Somme totale des coûts d'achat fournisseurs</span>
          </div>

          {/* Étape 2 : Prix Total de Vente */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2rem border border-white/10 space-y-1.5">
            <span className="text-xs text-emerald-200/90 font-extrabold uppercase tracking-wider block">
              2. Prix Total de Vente (Tout ce que vous devez recevoir)
            </span>
            <p className="text-2xl font-black text-white">{formatFCFA(totalSalePriceStock)}</p>
            <span className="text-[10px] text-emerald-300 block">Somme totale des prix de vente fixés</span>
          </div>

          {/* Étape 3 : Bénéfice à la fin */}
          <div className="bg-emerald-500/30 backdrop-blur-md p-5 rounded-2rem border border-emerald-400/50 space-y-1.5 shadow-inner">
            <span className="text-xs text-emerald-100 font-black uppercase tracking-wider block">
              3. Bénéfice (Ce que vous êtes censé avoir à la fin)
            </span>
            <p className={`text-2xl sm:text-3xl font-black ${expectedProfitStock >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {formatFCFA(expectedProfitStock)}
            </p>
            <span className="text-[10px] text-emerald-200 font-semibold block">Prix de Vente - Prix d'Achat</span>
          </div>
        </div>

        {/* Détails complémentaires : Dépenses & Bénéfice Net Réel */}
        <div className="pt-4 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-300 font-bold block">Ventes encaissées :</span>
            <strong className="text-white text-sm">{formatFCFA(totalRevenue)}</strong> ({totalSalesCount} vente(s))
          </div>
          <div className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/40">
            <span className="text-red-300 font-bold block">Somme des dépenses & charges :</span>
            <strong className="text-red-200 text-sm">- {formatFCFA(totalExpenses)}</strong> ({(expenses || []).length} charge(s))
          </div>
          <div className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/40">
            <span className="text-emerald-300 font-bold block">Bénéfice Net Réel en poche :</span>
            <strong className="text-emerald-300 text-sm">{formatFCFA(netProfit)}</strong>
          </div>
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
            {dynamicMonthsData.map((m) => {
              const invHeight = maxChartVal > 0 ? (m.stockVal / maxChartVal) * 100 : 0;
              const saleHeight = maxChartVal > 0 ? (m.salesVal / maxChartVal) * 100 : 0;

              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#064E3B] text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none z-20 whitespace-nowrap">
                    Ventes: {formatFCFA(m.salesVal)} • Stock: {formatFCFA(m.stockVal)}
                  </div>

                  <div className="w-full flex items-end justify-center space-x-1.5 h-full">
                    <div 
                      className="w-4 sm:w-6 bg-emerald-100 group-hover:bg-emerald-200 rounded-t-md transition-all"
                      style={{ height: `${Math.max(invHeight > 0 ? 5 : 0, invHeight)}%` }}
                    ></div>
                    <div 
                      className="w-4 sm:w-6 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-md transition-all shadow-sm"
                      style={{ height: `${Math.max(saleHeight > 0 ? 5 : 0, saleHeight)}%` }}
                    ></div>
                  </div>

                  <span className="text-[11px] text-gray-500 mt-2 font-semibold">
                    {m.label}
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

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-xs font-bold ${mov.amountColor}`}>
                          {mov.amount}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${mov.badgeColor}`}>
                          {mov.badge}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (mov.rawType === 'SALE' && onDeleteSale) onDeleteSale(mov.rawId);
                          else if (mov.rawType === 'PAYMENT' && onDeletePayment) onDeletePayment(mov.rawId);
                          else if (mov.rawType === 'EXPENSE' && onDeleteExpense) onDeleteExpense(mov.rawId);
                        }}
                        title="Supprimer ce mouvement"
                        className="p-1.5 rounded-xl text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0 border border-transparent hover:border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              {topClients.length > 0 ? (
                topClients.map((c, idx) => {
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
                })
              ) : (
                <p className="text-xs text-gray-500 italic py-6 text-center">
                  Aucun client enregistré pour l'instant.
                </p>
              )}
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
