import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  MessageSquareText, 
  AlertTriangle,
  BarChart3,
  Settings,
  HelpCircle,
  TrendingDown,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
  Mail,
  Phone,
  Headphones,
  X,
  MoreHorizontal
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', shortLabel: 'Accueil', icon: LayoutDashboard },
  { id: 'pos', label: 'Caisse & Vente POS', shortLabel: 'Caisse', icon: ShoppingCart },
  { id: 'stock', label: 'Gestion du Stock', shortLabel: 'Stock', icon: Package, badgeKey: 'lowStock' },
  { id: 'expenses', label: 'Dépenses & Charges', shortLabel: 'Dépenses', icon: TrendingDown },
  { id: 'closing', label: 'Clôture de Caisse (Z)', shortLabel: 'Clôture', icon: Lock },
  { id: 'clients', label: 'Gestion des Clients', shortLabel: 'Clients', icon: Users },
  { id: 'relances', label: 'Relances WhatsApp', shortLabel: 'Relances', icon: MessageSquareText, badgeKey: 'pendingDebt' },
  { id: 'analytics', label: 'Compte de Résultat', shortLabel: 'Stats', icon: BarChart3 },
];

const Navigation = ({ 
  activeTab, 
  setActiveTab, 
  lowStockCount, 
  pendingRelancesCount,
  isCollapsed = false,
  setIsCollapsed,
  onOpenSupportModal
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 5 Onglets principaux pour le mobile
  const primaryMobileTabs = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'pos', label: 'Caisse', icon: ShoppingCart, isPosPill: true },
    { id: 'stock', label: 'Stock', icon: Package, badgeKey: 'lowStock' },
    { id: 'clients', label: 'Clients', icon: Users },
  ];

  return (
    <>
      {/* Sidebar navigation for Desktop - Flush Left, Collapsible */}
      <aside 
        className={`hidden lg:flex flex-col justify-between bg-[#064E3B] text-white border-r border-emerald-600/30 min-h-[calc(100vh-65px)] transition-all duration-300 select-none ${
          isCollapsed ? 'w-20 p-2.5' : 'w-64 p-4'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none space-y-3">
          
          {/* Header row with Title & Collapse Toggle Button */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} pt-1 pb-2 border-b border-emerald-700/50`}>
            {!isCollapsed && (
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Menu Principal
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Déplier le menu" : "Réduire le menu"}
              className="p-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-all shadow-sm border border-emerald-600/50 flex items-center justify-center"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Buttons List */}
          <div className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'} rounded-2xl text-xs font-semibold transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-bold shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-emerald-300' : 'text-white/70'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badges */}
                  {!isCollapsed ? (
                    <>
                      {item.badgeKey === 'lowStock' && lowStockCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {lowStockCount}
                        </span>
                      )}
                      {item.badgeKey === 'pendingDebt' && pendingRelancesCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          {pendingRelancesCount}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {item.badgeKey === 'lowStock' && lowStockCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#064E3B]">
                          {lowStockCount}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip on hover in collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Support / Aide Section */}
          <div className="pt-3 border-t border-emerald-700/50 space-y-1">
            {onOpenSupportModal && (
              <button
                onClick={onOpenSupportModal}
                title="Aide & Support (+226 60 55 77 77)"
                className="w-full flex items-center justify-center py-2 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <Headphones className="w-5 h-5 text-emerald-300" />
              </button>
            )}

            {/* Bouton Paramètres */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              title="Paramètres Boutique"
              className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2' : 'space-x-3 px-3 py-2 text-xs'} text-emerald-100/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors`}
            >
              <Settings className="w-4 h-4 text-emerald-300" />
              {!isCollapsed && <span>Paramètres Boutique</span>}
            </button>
          </div>

        </div>
      </aside>

      {/* 📱 ERGONOMIE MOBILE SUR-MESURE : Barre de navigation basse ultra-intuitive */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#064E3B]/95 backdrop-blur-2xl border-t border-emerald-600/40 text-white z-50 px-3 py-2 shadow-2xl">
        <div className="grid grid-cols-5 items-center justify-between max-w-md mx-auto">
          
          {primaryMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isPosPill) {
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab('pos');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center relative -top-3"
                >
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-emerald-600 text-white ring-4 ring-emerald-500/30' 
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white border border-emerald-400/40'
                  }`}>
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-[10px] font-extrabold mt-0.5 ${isActive ? 'text-emerald-300' : 'text-white/80'}`}>
                    Caisse POS
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center py-1 rounded-2xl text-center transition-all ${
                  isActive
                    ? 'text-emerald-300 font-bold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110 text-emerald-300' : ''}`} />
                <span className="text-[10px] font-semibold leading-none tracking-tight">
                  {tab.label}
                </span>

                {/* Mobile Badges */}
                {tab.badgeKey === 'lowStock' && lowStockCount > 0 && (
                  <span className="absolute top-0 right-2 bg-red-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#064E3B]">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Bouton Plus / Menu Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 rounded-2xl text-center transition-all ${
              isMobileMenuOpen ? 'text-emerald-300 font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              {(pendingRelancesCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </div>
            <span className="text-[10px] font-semibold leading-none tracking-tight">Plus</span>
          </button>

        </div>
      </nav>

      {/* 📱 MENU MOBILE DRAWER (Bottom Sheet pour les modules complémentaires) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#064E3B]/80 backdrop-blur-md z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 border-t border-emerald-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#064E3B] font-sans">Menu & Plus d'Options</h3>
                <p className="text-xs text-gray-500">Accédez à tous les modules métier de votre boutique</p>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              
              <button
                onClick={() => {
                  setActiveTab('expenses');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  activeTab === 'expenses' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <TrendingDown className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="font-bold text-xs block">Dépenses & Charges</span>
                  <span className="text-[10px] text-gray-500">Suivi des coûts</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('closing');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  activeTab === 'closing' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <Lock className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-bold text-xs block">Clôture de Caisse (Z)</span>
                  <span className="text-[10px] text-gray-500">Comptage physique</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('relances');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all relative ${
                  activeTab === 'relances' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <MessageSquareText className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-xs block">Relances WhatsApp</span>
                  <span className="text-[10px] text-gray-500">Rappels de créances</span>
                </div>
                {pendingRelancesCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingRelancesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-bold text-xs block">Compte de Résultat</span>
                  <span className="text-[10px] text-gray-500">Bénéfices & Analyses</span>
                </div>
              </button>

            </div>

            {/* Assistance WhatsApp Directe Mobile */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSupportModal && onOpenSupportModal();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-100/80 hover:bg-emerald-200 text-[#064E3B] font-bold text-xs flex items-center justify-center space-x-2 border border-emerald-300"
              >
                <Headphones className="w-4 h-4 text-emerald-700" />
                <span>Assistance & Support Client (+226 60 55 77 77)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
