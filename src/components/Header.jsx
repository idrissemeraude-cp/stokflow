import React from 'react';
import { 
  ShoppingBag, 
  AlertTriangle, 
  CreditCard, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Home,
  ShieldCheck,
  FileSpreadsheet,
  Menu,
  SlidersHorizontal
} from 'lucide-react';
import { formatFCFA } from '../utils/storage';

const Header = ({ 
  storeInfo, 
  lowStockCount, 
  totalPendingCredit, 
  onResetData, 
  onExportData, 
  activeTab, 
  setActiveTab,
  onLogout,
  userRole = 'ADMIN',
  onOpenRoleModal,
  onOpenCsvModal,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenDatabaseModal,
  syncState = { status: 'UNCONFIGURED', pendingCount: 0 }
}) => {
  return (
    <header className="bg-[#064E3B] text-white border-b border-emerald-600/40 sticky top-0 z-40 shadow-xl print:hidden w-full">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left Side: Collapse Toggle + Brand & Store Name */}
        <div className="flex items-center space-x-3">
          
          {/* Menu Toggle / Options Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Déplier le menu latéral" : "Replier le menu latéral"}
            className="hidden lg:flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white border border-white/15 transition-all items-center justify-center"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300">
              <ShoppingBag className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white leading-tight font-sans">
                  StockFlow Pro
                </h1>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {storeInfo.name || 'Boutique'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/70 hidden sm:block">
                {storeInfo.city} • Caisse & Relances WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/60" />
            <input
              type="text"
              placeholder="Rechercher un produit, client, vente, créance..."
              onClick={() => setActiveTab('pos')}
              className="w-full pl-10 pr-4 py-1.5 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-emerald-100/60 focus:outline-none focus:border-emerald-300 focus:bg-white/15 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Indicators & Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Role Switcher Pill */}
          <button
            type="button"
            onClick={onOpenRoleModal}
            title="Changer de rôle (Admin / Caissier)"
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
              userRole === 'ADMIN'
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 hover:bg-amber-500/30'
                : 'bg-blue-500/20 border-blue-400/50 text-blue-200 hover:bg-blue-500/30'
            }`}
          >
            <span>{userRole === 'ADMIN' ? '👑 Gérant' : '👤 Caissier'}</span>
          </button>

          {/* Alertes Stock Bas Pill (Red) */}
          <div 
            onClick={() => setActiveTab('stock')}
            className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl cursor-pointer transition-all ${
              lowStockCount > 0 
                ? 'bg-red-500/20 border border-red-400 text-red-200 hover:bg-red-500/30' 
                : 'bg-white/10 border border-white/20 text-emerald-100'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-red-300 animate-bounce' : 'text-emerald-200/60'}`} />
            <span className="text-xs font-semibold">Stock bas : <strong>{lowStockCount}</strong></span>
          </div>

          {/* Import / Export CSV */}
          <button
            onClick={onOpenCsvModal}
            title="Importation / Exportation Excel & CSV"
            className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-2xl text-xs items-center space-x-1.5 transition-all border border-white/20 font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>Excel/CSV</span>
          </button>

          {/* Home Page / Déconnexion */}
          <button
            onClick={onLogout}
            title="Retourner à la page de présentation"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/40 px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Accueil</span>
          </button>

        </div>

      </div>
    </header>
  );
};

export default Header;
