import {
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_SALES,
  INITIAL_PAYMENTS,
  INITIAL_WHATSAPP_LOGS,
  INITIAL_EXPENSES,
  INITIAL_CASH_CLOSINGS
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'stockflow_v2_clean_products',
  CLIENTS: 'stockflow_v2_clean_clients',
  SALES: 'stockflow_v2_clean_sales',
  PAYMENTS: 'stockflow_v2_clean_payments',
  WA_LOGS: 'stockflow_v2_clean_walogs',
  STORE_INFO: 'stockflow_v2_clean_store_info',
  EXPENSES: 'stockflow_v2_clean_expenses',
  CASH_CLOSINGS: 'stockflow_v2_clean_cash_closings',
  USER_ROLE: 'stockflow_v2_clean_user_role',
  SECURITY_PIN: 'stockflow_v2_clean_security_pin'
};

// Nettoyage automatique immédiat des anciennes clés de test du navigateur
if (typeof window !== 'undefined' && window.localStorage) {
  const legacyKeys = [
    'fasomode_products_v1',
    'fasomode_clients_v1',
    'fasomode_sales_v1',
    'fasomode_payments_v1',
    'fasomode_walogs_v1',
    'fasomode_store_info_v1',
    'fasomode_expenses_v1',
    'fasomode_cash_closings_v1',
    'fasomode_user_role_v1',
    'fasomode_security_pin_v1'
  ];
  legacyKeys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch (_) {}
  });
}

// Formateur monétaire pour FCFA (Franc CFA)
export const formatFCFA = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
};

// Formateur de date français
export const formatDateFr = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Obtenir le nombre de jours de différence par rapport à aujourd'hui (0 = aujourd'hui, <0 = passé, >0 = futur)
export const getDaysDiffFromToday = (targetDateStr) => {
  if (!targetDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
};

// Statut d'échéance d'une créance
export const getDebtUrgencyStatus = (dueDateStr) => {
  if (!dueDateStr) return { code: 'NORMAL', label: 'Régulier', badgeColor: 'bg-gray-100 text-gray-700 border-gray-200' };
  
  const daysDiff = getDaysDiffFromToday(dueDateStr);
  
  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      code: 'OVERDUE',
      label: `Retard de ${overdueDays} jour${overdueDays > 1 ? 's' : ''}`,
      badgeColor: 'bg-red-100 text-red-700 border-red-300 font-semibold',
      triggerType: 'J+3'
    };
  } else if (daysDiff === 0) {
    return {
      code: 'DUE_TODAY',
      label: "Échéance Aujourd'hui",
      badgeColor: 'bg-red-100 text-red-800 border-red-300 font-semibold',
      triggerType: 'Jour J'
    };
  } else if (daysDiff <= 2) {
    return {
      code: 'DUE_SOON',
      label: `Dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      triggerType: 'J-2'
    };
  } else {
    return {
      code: 'FUTURE',
      label: `Échéance le ${formatDateFr(dueDateStr)}`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      triggerType: 'FUTURE'
    };
  }
};

// Génération du texte de reçu WhatsApp formaté
export const generateReceiptWhatsAppText = (sale, storeInfo) => {
  if (!sale) return '';
  const isCredit = sale.paymentType === 'CREDIT';
  
  const itemsList = sale.items.map(item => {
    const variantStr = item.variant ? ` (${item.variant})` : '';
    return `• *${item.name}${variantStr}* : ${item.qty}x ${formatFCFA(item.price)} = ${formatFCFA(item.qty * item.price)}`;
  }).join('\n');

  let text = `🧾 *REÇU DE CAISSE - ${storeInfo.name.toUpperCase()}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📍 ${storeInfo.city} | 📞 ${storeInfo.phone}\n`;
  text += `📅 Date : ${formatDateFr(sale.createdAt)}\n`;
  text += `🏷️ Réf Vente : #${sale.id.replace('sale-', '')}\n`;
  text += `👤 Client : *${sale.clientName}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `*DÉTAILS DES ARTICLES :*\n${itemsList}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 *TOTAL COMMANDE : ${formatFCFA(sale.totalAmount)}*\n`;
  
  if (isCredit) {
    text += `🔴 Avance versée : ${formatFCFA(sale.advancePaid)}\n`;
    text += `⚠️ *RESTE À PAYER : ${formatFCFA(sale.remainingDue)}*\n`;
    if (sale.dueDate) {
      text += `⏳ Date limite de règlement : *${formatDateFr(sale.dueDate)}*\n`;
    }
  } else {
    text += `✅ *Statut : RÉGLÉ AU COMPTANT*\n`;
  }
  
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🙏 *Merci pour votre fidélité et à très bientôt chez ${storeInfo.name} !*`;
  
  return text;
};

// Export CSV Universel
export const exportToCsv = (filename, rows) => {
  if (!rows || !rows.length) return;
  const separator = ';';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n|;)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parseur CSV pour importation d'articles
export const parseProductsCsv = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length < 2) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    // Mappage tolérant des colonnes
    const name = row['nom'] || row['name'] || row['article'] || row['produit'] || values[0];
    if (!name) continue;

    const category = row['categorie'] || row['category'] || row['famille'] || 'Divers';
    const salePrice = Number(row['prix de vente'] || row['saleprice'] || row['prix_vente'] || row['prix'] || values[1]) || 0;
    const purchasePrice = Number(row['prix d\'achat'] || row['purchaseprice'] || row['prix_achat'] || values[2]) || Math.round(salePrice * 0.6);
    const stock = Number(row['stock'] || row['quantite'] || row['qty'] || values[3]) || 0;
    const lowStockThreshold = Number(row['seuil'] || row['alerte'] || values[4]) || 2;
    const barcode = row['code-barre'] || row['barcode'] || row['code'] || `BF-IMP-${Date.now()}-${i}`;

    results.push({
      id: `prod-csv-${Date.now()}-${i}`,
      name,
      category,
      salePrice,
      purchasePrice,
      stock,
      lowStockThreshold,
      barcode,
      variants: ['Standard'],
      image: 'https://images.unsplash.com/photo-1590549326166-7e0760d8bee3?w=500&auto=format&fit=crop&q=60'
    });
  }

  return results;
};

// Initialisation et lecture du LocalStorage avec valeurs par défaut (Vide par défaut pour nouveaux comptes)
export const loadStoredData = () => {
  const getOrSet = (key, defaultData) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return defaultData;
    }
  };

  return {
    products: getOrSet(STORAGE_KEYS.PRODUCTS, []),
    clients: getOrSet(STORAGE_KEYS.CLIENTS, []),
    sales: getOrSet(STORAGE_KEYS.SALES, []),
    payments: getOrSet(STORAGE_KEYS.PAYMENTS, []),
    waLogs: getOrSet(STORAGE_KEYS.WA_LOGS, []),
    expenses: getOrSet(STORAGE_KEYS.EXPENSES, []),
    cashClosings: getOrSet(STORAGE_KEYS.CASH_CLOSINGS, []),
    userRole: localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'ADMIN',
    securityPin: localStorage.getItem(STORAGE_KEYS.SECURITY_PIN) || '1234',
    storeInfo: getOrSet(STORAGE_KEYS.STORE_INFO, {
      name: 'StockFlow Pro',
      ownerName: 'Gérant',
      phone: '+22600000000',
      city: 'Ouagadougou, Burkina Faso'
    })
  };
};

// Sauvegarde globale
export const saveStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Erreur de sauvegarde LocalStorage:', err);
  }
};

export const saveProducts = (products) => saveStoredData(STORAGE_KEYS.PRODUCTS, products);
export const saveClients = (clients) => saveStoredData(STORAGE_KEYS.CLIENTS, clients);
export const saveSales = (sales) => saveStoredData(STORAGE_KEYS.SALES, sales);
export const savePayments = (payments) => saveStoredData(STORAGE_KEYS.PAYMENTS, payments);
export const saveWaLogs = (waLogs) => saveStoredData(STORAGE_KEYS.WA_LOGS, waLogs);
export const saveStoreInfo = (storeInfo) => saveStoredData(STORAGE_KEYS.STORE_INFO, storeInfo);
export const saveExpenses = (expenses) => saveStoredData(STORAGE_KEYS.EXPENSES, expenses);
export const saveCashClosings = (cashClosings) => saveStoredData(STORAGE_KEYS.CASH_CLOSINGS, cashClosings);
export const saveUserRole = (role) => localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
export const saveSecurityPin = (pin) => localStorage.setItem(STORAGE_KEYS.SECURITY_PIN, pin);

// Remise à zéro complète (BDD 100% vide pour nouveau compte)
export const emptyAllData = () => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CASH_CLOSINGS, JSON.stringify([]));
  return {
    products: [],
    clients: [],
    sales: [],
    payments: [],
    waLogs: [],
    expenses: [],
    cashClosings: []
  };
};

// Chargement explicite des données de démonstration
export const loadDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(INITIAL_WHATSAPP_LOGS));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
  localStorage.setItem(STORAGE_KEYS.CASH_CLOSINGS, JSON.stringify(INITIAL_CASH_CLOSINGS));
  localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify({
    name: 'Boutique Élégance Faso',
    ownerName: 'Mme Fatoumata Kaboré',
    phone: '+22670001122',
    city: 'Ouagadougou, Burkina Faso'
  }));
  return {
    products: INITIAL_PRODUCTS,
    clients: INITIAL_CLIENTS,
    sales: INITIAL_SALES,
    payments: INITIAL_PAYMENTS,
    waLogs: INITIAL_WHATSAPP_LOGS,
    expenses: INITIAL_EXPENSES,
    cashClosings: INITIAL_CASH_CLOSINGS,
    storeInfo: {
      name: 'Boutique Élégance Faso',
      ownerName: 'Mme Fatoumata Kaboré',
      phone: '+22670001122',
      city: 'Ouagadougou, Burkina Faso'
    }
  };
};

// Alias pour compatibilité
export const resetToInitialData = loadDemoData;


