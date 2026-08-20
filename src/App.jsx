import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DashboardModule from './components/DashboardModule';
import StockModule from './components/StockModule';
import ClientModule from './components/ClientModule';
import PosModule from './components/PosModule';
import WhatsappRelanceModule from './components/WhatsappRelanceModule';
import AnalyticsModule from './components/AnalyticsModule';
import CreditModal from './components/CreditModal';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';

// Nouveaux Modules Professionnels
import ReceiptModal from './components/ReceiptModal';
import ExpensesModule from './components/ExpensesModule';
import CashClosingModule from './components/CashClosingModule';
import CsvImportExportModal from './components/CsvImportExportModal';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import SupportModal from './components/SupportModal';
import DatabaseSettingsModal from './components/DatabaseSettingsModal';
import UsersModal from './components/UsersModal';

import {
  loadStoredData,
  saveProducts,
  saveClients,
  saveSales,
  savePayments,
  saveWaLogs,
  saveExpenses,
  saveCashClosings,
  saveUserRole,
  saveStoreInfo,
  resetToInitialData,
  emptyAllData,
  loadDemoData
} from './utils/storage';
import { syncEngine } from './services/syncEngine';
import { dbService, mappers } from './services/dbService';
import { getSupabaseConfig, getSupabaseClient } from './services/supabaseClient';

export function App() {
  // Global View State ('landing' | 'dashboard') - Persisté sur rafraîchissement
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('stockflow_current_view');
    const savedUser = localStorage.getItem('stockflow_user');
    if (savedView) return savedView;
    return savedUser ? 'dashboard' : 'landing';
  });

  // Auth Modal State ('login' | 'register' | null)
  const [authModalMode, setAuthModalMode] = useState(null);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('stockflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Navigation State inside App ('dashboard' | 'pos' | 'stock' | 'expenses' | 'closing' | 'clients' | 'relances' | 'analytics')
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('stockflow_active_tab');
    return savedTab || 'dashboard';
  });

  // Persistance de la vue globale et de l'onglet actif dans localStorage
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('stockflow_current_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('stockflow_active_tab', activeTab);
    }
  }, [activeTab]);

  // Security Role & PIN State
  const [userRole, setUserRole] = useState('ADMIN'); // 'ADMIN' | 'CASHIER'
  const [securityPin, setSecurityPin] = useState('1234');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // App Data State (0 items by default)
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [waLogs, setWaLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [cashClosings, setCashClosings] = useState([]);
  const [storeInfo, setStoreInfo] = useState({
    name: 'StockFlow Pro',
    ownerName: 'Gérant',
    phone: '+22600000000',
    city: 'Ouagadougou, Burkina Faso'
  });

  // Profiles & Multi-User State
  const [profiles, setProfiles] = useState([]);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Modals State
  const [creditModalSale, setCreditModalSale] = useState(null);
  const [currentReceiptSale, setCurrentReceiptSale] = useState(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [syncState, setSyncState] = useState(() => syncEngine.getState());

  // Cloud Import Handler
  const handleCloudDataImported = (cloudData) => {
    if (!cloudData) return;
    if (cloudData.products) {
      setProducts(cloudData.products);
      saveProducts(cloudData.products);
    }
    if (cloudData.clients) {
      setClients(cloudData.clients);
      saveClients(cloudData.clients);
    }
    if (cloudData.sales) {
      setSales(cloudData.sales);
      saveSales(cloudData.sales);
    }
    if (cloudData.payments) {
      setPayments(cloudData.payments);
      savePayments(cloudData.payments);
    }
    if (cloudData.expenses) {
      setExpenses(cloudData.expenses);
      saveExpenses(cloudData.expenses);
    }
    if (cloudData.cashClosings) {
      setCashClosings(cloudData.cashClosings);
      saveCashClosings(cloudData.cashClosings);
    }
    if (cloudData.waLogs) {
      setWaLogs(cloudData.waLogs);
      saveWaLogs(cloudData.waLogs);
    }
    if (cloudData.storeInfo) {
      setStoreInfo(cloudData.storeInfo);
      saveStoreInfo(cloudData.storeInfo);
    }
    if (cloudData.profiles) {
      setProfiles(cloudData.profiles);
    }
  };

  const handleClearAllData = () => {
    if (!window.confirm('Voulez-vous vraiment effacer toutes les données locales ?')) return;
    emptyAllData();
    setProducts([]);
    setClients([]);
    setSales([]);
    setPayments([]);
    setWaLogs([]);
    setExpenses([]);
    setCashClosings([]);
  };

  const handleLoadDemoData = () => {
    const demo = loadDemoData();
    setProducts(demo.products);
    setClients(demo.clients);
    setSales(demo.sales);
    setPayments(demo.payments);
    setWaLogs(demo.waLogs);
    setExpenses(demo.expenses);
    setCashClosings(demo.cashClosings);
    setStoreInfo(demo.storeInfo);
  };

  const handleRefreshProfiles = async () => {
    try {
      const fetched = await dbService.fetchProfiles();
      if (fetched) setProfiles(fetched);
    } catch (err) {
      console.warn('Erreur actualisation profils:', err);
    }
  };

  const handleSwitchUser = (selectedProfile) => {
    setCurrentUser(selectedProfile);
    localStorage.setItem('stockflow_user', JSON.stringify(selectedProfile));
    if (selectedProfile.role) {
      setUserRole(selectedProfile.role);
      saveUserRole(selectedProfile.role);
    }
    if (selectedProfile.storeName) {
      setStoreInfo(prev => ({
        ...prev,
        name: selectedProfile.storeName,
        ownerName: selectedProfile.ownerName || prev.ownerName,
        phone: selectedProfile.phone || prev.phone,
        city: selectedProfile.city || prev.city
      }));
    }
    setIsUsersModalOpen(false);
  };

  // Load data on mount and initialize Supabase realtime sync & Auth listener
  useEffect(() => {
    const loaded = loadStoredData();
    setProducts(loaded.products || []);
    setClients(loaded.clients || []);
    setSales(loaded.sales || []);
    setPayments(loaded.payments || []);
    setWaLogs(loaded.waLogs || []);
    setExpenses(loaded.expenses || []);
    setCashClosings(loaded.cashClosings || []);
    setUserRole(loaded.userRole || 'ADMIN');
    setSecurityPin(loaded.securityPin || '1234');
    if (loaded.storeInfo) setStoreInfo(loaded.storeInfo);

    // Initialiser le client Supabase Auth & Session listener
    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            phone: meta.phone || '',
            ownerName: meta.owner_name || 'Commerçant',
            storeName: meta.store_name || 'Ma Boutique',
            city: meta.city || 'Ouagadougou, Burkina Faso',
            plan: meta.plan || 'PRO',
            role: meta.role || 'ADMIN'
          };
          setCurrentUser(prev => prev || userObj);
          if (meta.role) setUserRole(meta.role);
        }
      }).catch(err => console.warn('Supabase getSession warning:', err));

      const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('stockflow_user');
        } else if (session?.user) {
          const meta = session.user.user_metadata || {};
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            phone: meta.phone || '',
            ownerName: meta.owner_name || 'Commerçant',
            storeName: meta.store_name || 'Ma Boutique',
            city: meta.city || 'Ouagadougou, Burkina Faso',
            plan: meta.plan || 'PRO',
            role: meta.role || 'ADMIN'
          };
          setCurrentUser(userObj);
          localStorage.setItem('stockflow_user', JSON.stringify(userObj));
          if (meta.role) setUserRole(meta.role);
        }
      });
    }

    // Initialiser le moteur de synchronisation
    syncEngine.init().then(async () => {
      const config = getSupabaseConfig();
      if (config.isConfigured) {
        try {
          const cloudData = await dbService.fetchAllFromCloud();
          if (cloudData) {
            handleCloudDataImported(cloudData);
          }
        } catch (err) {
          console.warn('[Supabase Init Auto-Fetch] info:', err.message);
        }
      }
    });

    const unsubSync = syncEngine.subscribe((state) => {
      setSyncState(state);
    });

    // Écouteur des changements distants en temps réel (multi-caisses / multi-appareils)
    const unsubRemote = syncEngine.onRemoteChange(({ entity, eventType, data, id }) => {
      if (eventType === 'DELETE') {
        if (entity === 'products') setProducts(prev => prev.filter(p => p.id !== id));
        if (entity === 'clients') setClients(prev => prev.filter(c => c.id !== id));
        if (entity === 'expenses') setExpenses(prev => prev.filter(e => e.id !== id));
        if (entity === 'profiles') setProfiles(prev => prev.filter(p => p.id !== id));
      } else if (data) {
        if (entity === 'products') {
          setProducts(prev => {
            const exists = prev.some(p => p.id === data.id);
            const updated = exists ? prev.map(p => p.id === data.id ? data : p) : [data, ...prev];
            saveProducts(updated);
            return updated;
          });
        } else if (entity === 'sales') {
          setSales(prev => {
            const exists = prev.some(s => s.id === data.id);
            const updated = exists ? prev.map(s => s.id === data.id ? data : s) : [data, ...prev];
            saveSales(updated);
            return updated;
          });
        } else if (entity === 'clients') {
          setClients(prev => {
            const exists = prev.some(c => c.id === data.id);
            const updated = exists ? prev.map(c => c.id === data.id ? data : c) : [data, ...prev];
            saveClients(updated);
            return updated;
          });
        } else if (entity === 'payments') {
          setPayments(prev => {
            const exists = prev.some(p => p.id === data.id);
            const updated = exists ? prev.map(p => p.id === data.id ? data : p) : [data, ...prev];
            savePayments(updated);
            return updated;
          });
        } else if (entity === 'expenses') {
          setExpenses(prev => {
            const exists = prev.some(e => e.id === data.id);
            const updated = exists ? prev.map(e => e.id === data.id ? data : e) : [data, ...prev];
            saveExpenses(updated);
            return updated;
          });
        } else if (entity === 'cashClosings') {
          setCashClosings(prev => {
            const exists = prev.some(c => c.id === data.id);
            const updated = exists ? prev.map(c => c.id === data.id ? data : c) : [data, ...prev];
            saveCashClosings(updated);
            return updated;
          });
        } else if (entity === 'profiles') {
          setProfiles(prev => {
            const exists = prev.some(p => p.id === data.id);
            return exists ? prev.map(p => p.id === data.id ? data : p) : [data, ...prev];
          });
        } else if (entity === 'storeInfo') {
          setStoreInfo(data);
          saveStoreInfo(data);
        }
      }
    });

    return () => {
      unsubSync();
      unsubRemote();
    };
  }, []);

  // Auth Handlers
  const handleLoginSuccess = async (userPayload, meta = {}) => {
    setCurrentUser(userPayload);
    localStorage.setItem('stockflow_user', JSON.stringify(userPayload));
    localStorage.setItem('stockflow_visited', 'true');
    if (userPayload.role) {
      setUserRole(userPayload.role);
      saveUserRole(userPayload.role);
    }
    setAuthModalMode(null);
    setCurrentView('dashboard');

    if (meta.isDemo) {
      // Chargement explicite des données de démonstration
      const demoData = loadDemoData();
      setProducts(demoData.products);
      setClients(demoData.clients);
      setSales(demoData.sales);
      setPayments(demoData.payments);
      setWaLogs(demoData.waLogs);
      setExpenses(demoData.expenses);
      setCashClosings(demoData.cashClosings);
      setStoreInfo(demoData.storeInfo);
      return;
    }

    if (meta.isRegister) {
      // 🚀 NOUVEAU COMPTE CRÉÉ : Tous les dashboards démarrent 100% VIDES
      emptyAllData();
      setProducts([]);
      setClients([]);
      setSales([]);
      setPayments([]);
      setWaLogs([]);
      setExpenses([]);
      setCashClosings([]);

      const newStoreInfo = {
        name: userPayload.storeName || 'Ma Boutique',
        ownerName: userPayload.ownerName || 'Gérant',
        phone: userPayload.phone || '',
        city: userPayload.city || 'Ouagadougou, Burkina Faso'
      };

      setStoreInfo(newStoreInfo);
      saveStoreInfo(newStoreInfo);

      // Enregistrer la boutique sur Supabase si connecté
      syncEngine.enqueue('UPSERT', 'store_info', mappers.storeInfoToRow(newStoreInfo));
      await handleRefreshProfiles();
      return;
    }

    // Connexion existante
    if (userPayload.storeName) {
      setStoreInfo(prev => ({
        ...prev,
        name: userPayload.storeName,
        ownerName: userPayload.ownerName || prev.ownerName,
        phone: userPayload.phone || prev.phone,
        city: userPayload.city || prev.city
      }));
    }

    // Tenter de récupérer les données distantes du compte
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        const cloudData = await dbService.fetchAllFromCloud();
        if (cloudData) {
          handleCloudDataImported(cloudData);
        }
      } catch (err) {
        console.warn('Erreur récupération données Cloud:', err.message);
      }
    }
  };

  const handleEnterDemo = () => {
    // Mode démo explicite demandé depuis la page d'accueil
    const demoData = loadDemoData();
    setProducts(demoData.products);
    setClients(demoData.clients);
    setSales(demoData.sales);
    setPayments(demoData.payments);
    setWaLogs(demoData.waLogs);
    setExpenses(demoData.expenses);
    setCashClosings(demoData.cashClosings);
    setStoreInfo(demoData.storeInfo);
    localStorage.setItem('stockflow_visited', 'true');
    setCurrentView('dashboard');
  };

  const handleGoToLanding = () => {
    setCurrentView('landing');
  };

  const handleGoToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Erreur Supabase signOut:', err);
      }
    }
    localStorage.removeItem('stockflow_user');
    localStorage.removeItem('stockflow_current_view');
    setCurrentUser(null);
    setCurrentView('landing');
  };

  // Handlers pour le Stock
  const handleSaveProduct = (productPayload) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === productPayload.id);
      let updated;
      if (exists) {
        updated = prev.map(p => p.id === productPayload.id ? productPayload : p);
      } else {
        updated = [productPayload, ...prev];
      }
      saveProducts(updated);
      return updated;
    });

    // Enqueue dans le moteur de synchro Supabase
    syncEngine.enqueue('UPSERT', 'products', mappers.productToRow(productPayload));
  };

  const handleDeleteProduct = (productId) => {
    if (userRole === 'CASHIER') {
      alert('⛔ Action non autorisée en mode Caissier.');
      return;
    }
    if (!window.confirm('Voulez-vous vraiment supprimer cet article du stock ?')) return;
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      saveProducts(updated);
      return updated;
    });

    // Suppression distante
    syncEngine.enqueue('DELETE', 'products', { id: productId });
  };

  // Importation massive CSV
  const handleImportProducts = (newProducts) => {
    setProducts(prev => {
      const updated = [...newProducts, ...prev];
      saveProducts(updated);
      return updated;
    });

    // Envoi de chaque produit importé vers la file de synchronisation
    newProducts.forEach(prod => {
      syncEngine.enqueue('UPSERT', 'products', mappers.productToRow(prod));
    });
  };

  // Handlers pour les Clients
  const handleSaveClient = (clientPayload) => {
    setClients(prev => {
      const exists = prev.some(c => c.id === clientPayload.id);
      let updated;
      if (exists) {
        updated = prev.map(c => c.id === clientPayload.id ? clientPayload : c);
      } else {
        updated = [clientPayload, ...prev];
      }
      saveClients(updated);
      return updated;
    });

    syncEngine.enqueue('UPSERT', 'clients', mappers.clientToRow(clientPayload));
  };

  const handleDeleteClient = (clientId) => {
    if (userRole !== 'ADMIN') {
      alert('Seul un administrateur peut supprimer un client.');
      return;
    }
    const clientToDelete = clients.find(c => c.id === clientId);
    const clientName = clientToDelete ? clientToDelete.name : 'ce client';
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${clientName} ? Cette action est irréversible.`)) {
      return;
    }

    setClients(prev => {
      const updated = prev.filter(c => c.id !== clientId);
      saveClients(updated);
      return updated;
    });

    syncEngine.enqueue('DELETE', 'clients', { id: clientId });
  };

  // Handler pour l'enregistrement d'une Vente (Caisse POS)
  const handleSaveSale = (salePayload, advanceMethod = 'CASH') => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prod => {
        const cartItem = salePayload.items.find(i => i.productId === prod.id);
        if (cartItem) {
          const updatedProd = {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.qty)
          };
          syncEngine.enqueue('UPSERT', 'products', mappers.productToRow(updatedProd));
          return updatedProd;
        }
        return prod;
      });
      saveProducts(updatedProducts);
      return updatedProducts;
    });

    if (salePayload.advancePaid > 0) {
      const initialPayment = {
        id: `pay-${Date.now()}`,
        saleId: salePayload.id,
        clientId: salePayload.clientId,
        clientName: salePayload.clientName,
        amount: salePayload.advancePaid,
        paymentMethod: advanceMethod,
        date: salePayload.createdAt,
        remainingBalanceAfter: salePayload.remainingDue,
        note: salePayload.paymentType === 'CASH' ? 'Règlement comptant' : 'Avance initiale lors de la commande'
      };

      setPayments(prevPay => {
        const updatedPay = [initialPayment, ...prevPay];
        savePayments(updatedPay);
        return updatedPay;
      });

      syncEngine.enqueue('UPSERT', 'payments', mappers.paymentToRow(initialPayment));
    }

    setSales(prevSales => {
      const updatedSales = [salePayload, ...prevSales];
      saveSales(updatedSales);
      return updatedSales;
    });

    syncEngine.enqueue('UPSERT', 'sales', mappers.saleToRow(salePayload));
  };

  // Handler pour l'ajout d'un règlement de crédit
  const handleAddPayment = ({ saleId, clientId, clientName, amount, paymentMethod, note }) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const newRemainingDue = Math.max(0, sale.remainingDue - amount);
    const newStatus = newRemainingDue === 0 ? 'PAID' : 'PARTIAL';

    let updatedSaleObj = null;
    setSales(prevSales => {
      const updatedSales = prevSales.map(s => {
        if (s.id === saleId) {
          updatedSaleObj = {
            ...s,
            remainingDue: newRemainingDue,
            status: newStatus
          };
          return updatedSaleObj;
        }
        return s;
      });
      saveSales(updatedSales);
      return updatedSales;
    });

    if (updatedSaleObj) {
      syncEngine.enqueue('UPSERT', 'sales', mappers.saleToRow(updatedSaleObj));
    }

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      saleId,
      clientId,
      clientName,
      amount,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      remainingBalanceAfter: newRemainingDue,
      note
    };

    setPayments(prevPay => {
      const updatedPay = [newPaymentRecord, ...prevPay];
      savePayments(updatedPay);
      return updatedPay;
    });

    syncEngine.enqueue('UPSERT', 'payments', mappers.paymentToRow(newPaymentRecord));
  };

  // Handlers pour les Dépenses
  const handleSaveExpense = (newExpense) => {
    setExpenses(prev => {
      const updated = [newExpense, ...prev];
      saveExpenses(updated);
      return updated;
    });

    syncEngine.enqueue('UPSERT', 'expenses', mappers.expenseToRow(newExpense));
  };

  const handleDeleteExpense = (expenseId) => {
    if (userRole === 'CASHIER') {
      alert('⛔ Action non autorisée en mode Caissier.');
      return;
    }
    if (!window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) return;
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== expenseId);
      saveExpenses(updated);
      return updated;
    });

    syncEngine.enqueue('DELETE', 'expenses', { id: expenseId });
  };

  // Handler pour la Clôture de Caisse
  const handleSaveCashClosing = (closingRecord) => {
    setCashClosings(prev => {
      const updated = [closingRecord, ...prev];
      saveCashClosings(updated);
      return updated;
    });

    syncEngine.enqueue('UPSERT', 'cash_closings', mappers.closingToRow(closingRecord));
  };

  // Log Dispatcher WhatsApp
  const handleSendWhatsappLog = (logPayload) => {
    setWaLogs(prev => {
      const updated = [logPayload, ...prev];
      saveWaLogs(updated);
      return updated;
    });

    syncEngine.enqueue('UPSERT', 'whatsapp_logs', mappers.waLogToRow(logPayload));
  };

  // Export JSON Backup
  const handleExportData = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      storeInfo,
      products,
      clients,
      sales,
      payments,
      waLogs,
      expenses,
      cashClosings
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to initial demo data (alias)
  const handleResetData = handleClearAllData;

  // Computed Indicators
  const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 2)).length;
  const totalPendingCredit = sales.reduce((acc, s) => acc + (s.remainingDue || 0), 0);
  const pendingRelancesCount = sales.filter(s => s.paymentType === 'CREDIT' && s.remainingDue > 0).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-obsidienne flex flex-col font-sans selection:bg-champagne selection:text-obsidienne">
      
      {/* LANDING PAGE VIEW */}
      {currentView === 'landing' ? (
        <LandingPage
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onEnterDemo={handleEnterDemo}
          currentUser={currentUser}
          onGoToDashboard={handleGoToDashboard}
          onLogout={handleLogout}
        />
      ) : (
        /* DASHBOARD APP VIEW */
        <>
          <Header
            storeInfo={storeInfo}
            lowStockCount={lowStockCount}
            totalPendingCredit={totalPendingCredit}
            onResetData={handleResetData}
            onExportData={handleExportData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onGoToLanding={handleGoToLanding}
            onLogout={handleLogout}
            userRole={userRole}
            onOpenRoleModal={() => setIsRoleModalOpen(true)}
            onOpenCsvModal={() => setIsCsvModalOpen(true)}
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
            onOpenUsersModal={() => setIsUsersModalOpen(true)}
            userCount={profiles.length || 1}
            syncState={syncState}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          />

          <div className="flex-1 flex w-full">
            
            <Navigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              lowStockCount={lowStockCount}
              pendingRelancesCount={pendingRelancesCount}
              userRole={userRole}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              onOpenSupportModal={() => setIsSupportModalOpen(true)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden pb-20 lg:pb-8">
              
              {activeTab === 'dashboard' && (
                <DashboardModule
                  sales={sales}
                  products={products}
                  clients={clients}
                  payments={payments}
                  expenses={expenses}
                  setActiveTab={setActiveTab}
                  onOpenCreditModal={(sale) => setCreditModalSale(sale)}
                  onOpenReceiptModal={(sale) => setCurrentReceiptSale(sale)}
                />
              )}

              {activeTab === 'pos' && (
                <PosModule
                  products={products}
                  clients={clients}
                  onSaveSale={handleSaveSale}
                  onSaveClient={handleSaveClient}
                  onOpenReceiptModal={(sale) => setCurrentReceiptSale(sale)}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'stock' && (
                <StockModule
                  products={products}
                  onSaveProduct={handleSaveProduct}
                  onDeleteProduct={handleDeleteProduct}
                  userRole={userRole}
                  onOpenCsvModal={() => setIsCsvModalOpen(true)}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesModule
                  expenses={expenses}
                  onSaveExpense={handleSaveExpense}
                  onDeleteExpense={handleDeleteExpense}
                  userRole={userRole}
                />
              )}

              {activeTab === 'closing' && (
                <CashClosingModule
                  sales={sales}
                  payments={payments}
                  expenses={expenses}
                  cashClosings={cashClosings}
                  storeInfo={storeInfo}
                  onSaveCashClosing={handleSaveCashClosing}
                  userRole={userRole}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsModule
                  sales={sales}
                  products={products}
                  payments={payments}
                  expenses={expenses}
                />
              )}

              {activeTab === 'clients' && (
                <ClientModule
                  clients={clients}
                  sales={sales}
                  payments={payments}
                  onSaveClient={handleSaveClient}
                  onDeleteClient={handleDeleteClient}
                  userRole={userRole}
                  onOpenCreditModal={(sale) => setCreditModalSale(sale)}
                  onOpenReceiptModal={(sale) => setCurrentReceiptSale(sale)}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'relances' && (
                <WhatsappRelanceModule
                  sales={sales}
                  storeInfo={storeInfo}
                  waLogs={waLogs}
                  onSendWhatsappLog={handleSendWhatsappLog}
                  onOpenCreditModal={(sale) => setCreditModalSale(sale)}
                />
              )}

            </main>
          </div>
        </>
      )}

      {/* Auth Modal (Inscription / Connexion) */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onLoginSuccess={handleLoginSuccess}
          onOpenDatabaseConfig={() => setIsDatabaseModalOpen(true)}
        />
      )}

      {/* Repayment Modal */}
      {creditModalSale && (
        <CreditModal
          sale={creditModalSale}
          onClose={() => setCreditModalSale(null)}
          onAddPayment={handleAddPayment}
        />
      )}

      {/* Thermal & Invoice Receipt Modal */}
      {currentReceiptSale && (
        <ReceiptModal
          sale={currentReceiptSale}
          storeInfo={storeInfo}
          onClose={() => setCurrentReceiptSale(null)}
        />
      )}

      {/* CSV / Excel Import & Export Modal */}
      {isCsvModalOpen && (
        <CsvImportExportModal
          products={products}
          sales={sales}
          clients={clients}
          expenses={expenses}
          payments={payments}
          onImportProducts={handleImportProducts}
          onClose={() => setIsCsvModalOpen(false)}
        />
      )}

      {/* Role & Security PIN Modal */}
      {isRoleModalOpen && (
        <RoleSwitcherModal
          currentRole={userRole}
          securityPin={securityPin}
          onRoleChange={(newRole) => {
            setUserRole(newRole);
            saveUserRole(newRole);
          }}
          onClose={() => setIsRoleModalOpen(false)}
          onOpenUsersModal={() => setIsUsersModalOpen(true)}
        />
      )}

      {/* Users & Team Management Modal */}
      <UsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        currentUser={currentUser}
        profiles={profiles}
        onSwitchUser={handleSwitchUser}
        onRefreshProfiles={handleRefreshProfiles}
      />

      {/* Support & Assistance Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Database & Cloud Settings Modal */}
      <DatabaseSettingsModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        localState={{
          products,
          clients,
          sales,
          payments,
          expenses,
          cashClosings,
          waLogs,
          storeInfo
        }}
        onCloudDataImported={handleCloudDataImported}
        onClearAllData={handleClearAllData}
        onLoadDemoData={handleLoadDemoData}
      />

    </div>
  );
}

export default App;
