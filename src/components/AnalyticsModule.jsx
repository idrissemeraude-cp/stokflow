import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  ArrowUpRight, 
  Zap,
  PackageCheck,
  Layers
} from 'lucide-react';
import { formatFCFA } from '../utils/storage';

const AnalyticsModule = ({ sales = [], products = [], payments = [], expenses = [] }) => {
  const [timeRange, setTimeRange] = useState('30_DAYS');

  // Calculated Metrics
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCashCollected = sales.reduce((acc, s) => {
    if (s.paymentType === 'CASH') return acc + s.totalAmount;
    return acc + (s.advancePaid || 0);
  }, 0) + payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalPendingCredit = sales.reduce((acc, s) => acc + (s.remainingDue || 0), 0);

  // Total cost of goods sold (COGS)
  const totalCostOfGoods = sales.reduce((acc, s) => {
    return acc + s.items.reduce((itemAcc, item) => {
      const prod = products.find(p => p.id === item.productId);
      const purchasePrice = prod ? (prod.purchasePrice || 0) : (item.price * 0.6);
      return itemAcc + (purchasePrice * item.qty);
    }, 0);
  }, 0);

  // Gross profit (Marge Brute)
  const grossProfit = Math.max(0, totalRevenue - totalCostOfGoods);

  // Operational expenses
  const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);

  // Real Net Profit (Bénéfice Net Réel = Marge Brute - Dépenses Opérationnelles)
  const realNetProfit = grossProfit - totalExpenses;
  const netProfitMarginPercent = totalRevenue > 0 ? ((realNetProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Category sales breakdown
  const categorySales = products.reduce((acc, p) => {
    const soldForProd = sales.reduce((sAcc, sale) => {
      const foundItem = sale.items.find(i => i.productId === p.id);
      return sAcc + (foundItem ? foundItem.qty * foundItem.price : 0);
    }, 0);
    acc[p.category] = (acc[p.category] || 0) + soldForProd;
    return acc;
  }, {});

  const totalCategoryRevenue = Object.values(categorySales).reduce((a, b) => a + b, 0) || 1;

  const categoryColors = {
    'Robes': '#10B981',
    'Ensembles': '#3B82F6',
    'Chemises': '#059669',
    'Boubous': '#8B5CF6',
    'Chaussures': '#EF4444',
    'Accessoires': '#EC4899'
  };

  // Mock monthly data points for glowing SVG chart
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'];
  const revenuePoints = [120, 180, 240, 210, 320, 390, 450, 520];
  const expensePoints = [80, 110, 150, 130, 200, 240, 280, 310];

  const maxVal = Math.max(...revenuePoints, ...expensePoints);
  const width = 600;
  const height = 220;
  const padding = 40;

  const getSvgCoords = (data) => {
    return data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return { x, y };
    });
  };

  const revCoords = getSvgCoords(revenuePoints);
  const expCoords = getSvgCoords(expensePoints);

  const makeSvgPath = (coords) => {
    return coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = coords[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const revPath = makeSvgPath(revCoords);
  const expPath = makeSvgPath(expCoords);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans tracking-tight">
              Analyses & Compte de Résultat Net
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suivez la rentabilité réelle de votre boutique : Chiffre d'affaires, coût des marchandises, charges et bénéfice net final.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-2rem border border-gray-200">
            <button
              onClick={() => setTimeRange('7_DAYS')}
              className={`px-3 py-1.5 rounded-2rem text-xs font-medium transition-all ${
                timeRange === '7_DAYS' ? 'bg-[#064E3B] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setTimeRange('30_DAYS')}
              className={`px-3 py-1.5 rounded-2rem text-xs font-medium transition-all ${
                timeRange === '30_DAYS' ? 'bg-[#064E3B] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 jours
            </button>
            <button
              onClick={() => setTimeRange('YEAR')}
              className={`px-3 py-1.5 rounded-2rem text-xs font-medium transition-all ${
                timeRange === 'YEAR' ? 'bg-[#064E3B] text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cette année
            </button>
          </div>

          <button 
            onClick={() => window.print()}
            className="btn-magnetic bg-[#064E3B] hover:bg-emerald-900 text-white px-4 py-2 rounded-2rem text-xs font-semibold flex items-center space-x-2 shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>Imprimer Rapport</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: CA Brut */}
        <div className="bg-white p-4 rounded-2rem border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">CA Brut Total</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2">
            {formatFCFA(totalRevenue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">{sales.length} ventes</span>
        </div>

        {/* Metric 2: Coût d'Achat Stock */}
        <div className="bg-white p-4 rounded-2rem border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Coût Stock Vendu</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-700 mt-2">
            -{formatFCFA(totalCostOfGoods)}
          </p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Prix d'achat fournisseur</span>
        </div>

        {/* Metric 3: Dépenses Opérationnelles */}
        <div className="bg-white p-4 rounded-2rem border border-red-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Dépenses Charges</span>
            <div className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-600 mt-2">
            -{formatFCFA(totalExpenses)}
          </p>
          <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">{expenses.length} dépenses</span>
        </div>

        {/* Metric 4: Bénéfice Net Réel */}
        <div className="bg-white p-4 rounded-2rem border-2 border-emerald-500 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">Bénéfice Net Réel</span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl font-extrabold mt-2 ${realNetProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatFCFA(realNetProfit)}
          </p>
          <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
            Marge nette : {netProfitMarginPercent}%
          </span>
        </div>

        {/* Metric 5: Créances en cours */}
        <div className="bg-white p-4 rounded-2rem border border-red-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Créances Dehors</span>
            <div className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-600 mt-2">
            {formatFCFA(totalPendingCredit)}
          </p>
          <span className="text-[10px] text-red-500 mt-0.5 block">À recouvrer WhatsApp</span>
        </div>
      </div>

      {/* Main Dark Glowing Chart (Revenues vs Expenses) */}
      <div className="bg-[#064E3B] text-white p-6 rounded-2rem border border-emerald-600 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <span className="text-xs text-emerald-300 uppercase tracking-widest font-semibold">
              Rapport de Performance Financière
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Recettes Globale vs Dépenses Approvisionnement
            </h3>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-100">Recettes (Ventes)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-teal-300"></span>
              <span className="text-emerald-100">Coût d'Achat (Stock)</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 min-w-[500px]">
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio, idx) => (
              <line
                key={idx}
                x1={padding}
                y1={padding + ratio * (height - 2 * padding)}
                x2={width - padding}
                y2={padding + ratio * (height - 2 * padding)}
                stroke="#ffffff"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            ))}

            {/* Filled Areas */}
            <path
              d={`${revPath} L ${revCoords[revCoords.length - 1].x} ${height - padding} L ${revCoords[0].x} ${height - padding} Z`}
              fill="url(#revGrad)"
            />
            <path
              d={`${expPath} L ${expCoords[expCoords.length - 1].x} ${height - padding} L ${expCoords[0].x} ${height - padding} Z`}
              fill="url(#expGrad)"
            />

            {/* Smooth Curve Lines */}
            <path d={revPath} fill="none" stroke="#10B981" strokeWidth="3" />
            <path d={expPath} fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeDasharray="6 3" />

            {/* Glowing Points */}
            {revCoords.map((pt, idx) => (
              <g key={`rev-${idx}`}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#10B981" />
                <circle cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" />
              </g>
            ))}

            {/* X Axis Labels */}
            {months.map((m, idx) => {
              const x = padding + (idx / (months.length - 1)) * (width - 2 * padding);
              return (
                <text
                  key={m}
                  x={x}
                  y={height - 10}
                  fill="#FFFFFF"
                  opacity="0.7"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                >
                  {m}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Secondary Row: Stock Turnover & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Stock Turnover */}
        <div className="bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#064E3B] font-sans text-base">
                Rotation & Écoulement du Stock
              </h3>
              <p className="text-xs text-gray-500">
                Performance globale des articles vendus par rapport au stock restants.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="space-y-4">
            {products.slice(0, 4).map((p) => {
              const totalUnitsSold = sales.reduce((acc, sale) => {
                const item = sale.items.find(i => i.productId === p.id);
                return acc + (item ? item.qty : 0);
              }, 0);

              const totalPotential = totalUnitsSold + p.stock || 1;
              const sellRatio = Math.round((totalUnitsSold / totalPotential) * 100);

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 truncate max-w-[220px]">{p.name}</span>
                    <span className="text-gray-500">
                      <strong>{totalUnitsSold}</strong> vendus / {p.stock} en stock
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, sellRatio))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Donut Chart - Category Distribution */}
        <div className="bg-white p-6 rounded-2rem border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#064E3B] font-sans text-base">
                Répartition des Ventes par Catégorie
              </h3>
              <p className="text-xs text-gray-500">
                Part de contribution de chaque gamme d'articles au chiffre d'affaires.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Donut Visual */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                {Object.entries(categorySales).map(([cat, val], idx, arr) => {
                  const percent = (val / totalCategoryRevenue) * 100;
                  const strokeDasharray = `${percent} ${100 - percent}`;
                  const prevPercentages = arr.slice(0, idx).reduce((acc, [_, v]) => acc + (v / totalCategoryRevenue) * 100, 0);
                  const strokeDashoffset = -prevPercentages;

                  return (
                    <circle
                      key={cat}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={categoryColors[cat] || '#9CA3AF'}
                      strokeWidth="16"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      pathLength="100"
                    />
                  );
                })}
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Part Majeure</span>
                <span className="text-sm font-bold text-gray-900">Bazin & WAX</span>
              </div>
            </div>

            {/* Category Legend list */}
            <div className="space-y-2 text-xs">
              {Object.entries(categorySales).map(([cat, val]) => {
                const percent = Math.round((val / totalCategoryRevenue) * 100);
                return (
                  <div key={cat} className="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoryColors[cat] || '#9CA3AF' }}
                      ></span>
                      <span className="font-medium text-gray-700">{cat}</span>
                    </div>
                    <span className="font-bold text-gray-900">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsModule;
