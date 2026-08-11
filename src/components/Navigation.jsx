import React from 'react';
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
  Headphones
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', shortLabel: 'Accueil', icon: LayoutDashboard },
  { id: 'pos', label: 'Caisse & Vente POS', shortLabel: 'Caisse', icon: ShoppingCart, highlight: true },
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
                      : item.highlight
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30'
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
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {pendingRelancesCount}
                        </span>
                      )}
                    </>
                  ) : (
                    /* Collapsed dot badge */
                    <>
                      {item.badgeKey === 'lowStock' && lowStockCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#064E3B]"></span>
                      )}
                      {item.badgeKey === 'pendingDebt' && pendingRelancesCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border border-[#064E3B] animate-pulse"></span>
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

          {/* Bottom Section: Aide & Support + Paramètres */}
          <div className={`pt-3 border-t border-emerald-700/60 ${isCollapsed ? 'space-y-2' : 'space-y-2'}`}>
            
            {/* Fenêtre / Carte Aide & Support (Mode Déplié) */}
            {!isCollapsed ? (
              <div className="bg-white/10 border border-emerald-400/20 rounded-2xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                    <Headphones className="w-4 h-4" />
                    <span>Aide & Support</span>
                  </div>
                  <button 
                    onClick={onOpenSupportModal}
                    className="text-[10px] text-emerald-200 underline hover:text-white"
                  >
                    Détails
                  </button>
                </div>

                <div className="space-y-1 text-[11px] text-emerald-100/90">
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <a href="tel:+22660557777" className="font-semibold hover:underline">
                      +226 60 55 77 77
                    </a>
                  </div>
                  <div className="flex items-center space-x-1.5 truncate">
                    <Mail className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <a href="mailto:gansoreemeraude@gmail.com" className="truncate hover:underline" title="gansoreemeraude@gmail.com">
                      gansoreemeraude@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-1.5 truncate">
                    <Mail className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <a href="mailto:gicb7612@gmail.com" className="truncate hover:underline" title="gicb7612@gmail.com">
                      gicb7612@gmail.com
                    </a>
                  </div>
                </div>

                <button
                  onClick={onOpenSupportModal}
                  className="w-full mt-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-100 hover:text-white text-[10px] font-bold py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Ouvrir l'Assistance</span>
                </button>
              </div>
            ) : (
              /* Mode replié : bouton icône simple */
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

      {/* Bottom Bar Navigation for Mobile & Tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#064E3B]/95 backdrop-blur-xl border-t border-emerald-600/40 text-white z-50 px-2 py-1 shadow-2xl overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max mx-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-center transition-all ${
                  isActive
                    ? 'text-emerald-300 font-bold bg-emerald-500/20 shadow-sm'
                    : item.highlight
                    ? 'text-emerald-200 font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'scale-110 text-emerald-300' : ''}`} />
                <span className="text-[9px] leading-none tracking-tight whitespace-nowrap">
                  {item.shortLabel}
                </span>

                {/* Mobile Badges */}
                {item.badgeKey === 'lowStock' && lowStockCount > 0 && (
                  <span className="absolute -top-1 right-0.5 bg-red-600 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#064E3B]">
                    {lowStockCount}
                  </span>
                )}
                {item.badgeKey === 'pendingDebt' && pendingRelancesCount > 0 && (
                  <span className="absolute -top-1 right-0.5 bg-red-600 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#064E3B] animate-pulse">
                    {pendingRelancesCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Bouton Support Mobile */}
          <button
            onClick={onOpenSupportModal}
            className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-center text-emerald-200 hover:text-white"
          >
            <Headphones className="w-4 h-4 mb-0.5 text-emerald-300" />
            <span className="text-[9px] leading-none tracking-tight whitespace-nowrap">Support</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
