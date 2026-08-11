// Données initiales d'exemple pour "Boutique Elégance Faso" (Ouagadougou, Burkina Faso)

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Robe Bazin Richesse Brodé (Taille L)',
    category: 'Robes',
    salePrice: 35000,
    purchasePrice: 22000,
    stock: 5,
    lowStockThreshold: 2,
    barcode: 'BF-ROB-001',
    variants: ['M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1590549326166-7e0760d8bee3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-2',
    name: 'Ensemble WAX Kente Moderne (3 Pièces)',
    category: 'Ensembles',
    salePrice: 25000,
    purchasePrice: 15000,
    stock: 1, // Alerte stock bas !
    lowStockThreshold: 2,
    barcode: 'BF-ENS-002',
    variants: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-3',
    name: 'Chemise Homme Koko Dunda (Taille XL)',
    category: 'Chemises',
    salePrice: 18000,
    purchasePrice: 10000,
    stock: 8,
    lowStockThreshold: 2,
    barcode: 'BF-CHE-003',
    variants: ['M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-4',
    name: 'Boubou Tradionnel Faso Danfani Premium',
    category: 'Boubous',
    salePrice: 45000,
    purchasePrice: 28000,
    stock: 2, // Alerte stock bas !
    lowStockThreshold: 2,
    barcode: 'BF-BOU-004',
    variants: ['Unique', 'Sur-mesure'],
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-5',
    name: 'Sandales Artisanales Cuir Véritable',
    category: 'Chaussures',
    salePrice: 12000,
    purchasePrice: 7000,
    stock: 12,
    lowStockThreshold: 3,
    barcode: 'BF-CHA-005',
    variants: ['40', '41', '42', '43', '44'],
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'prod-6',
    name: 'Robe Legère Pagne Imprimé',
    category: 'Robes',
    salePrice: 15000,
    purchasePrice: 9000,
    stock: 0, // En rupture !
    lowStockThreshold: 2,
    barcode: 'BF-ROB-006',
    variants: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60'
  }
];

export const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    name: 'Mariam Ouédraogo',
    phone: '+22670123456',
    address: 'Secteur 15 (Ouaga 2000), Ouagadougou',
    createdAt: '2026-07-10'
  },
  {
    id: 'cli-2',
    name: 'Fatou Traoré',
    phone: '+22676891122',
    address: 'Koulouba, Ouagadougou',
    createdAt: '2026-07-15'
  },
  {
    id: 'cli-3',
    name: 'Ibrahim Sawadogo',
    phone: '+22665432109',
    address: 'Dafra, Bobo-Dioulasso',
    createdAt: '2026-07-20'
  },
  {
    id: 'cli-4',
    name: 'Awa Compaoré',
    phone: '+22678009988',
    address: 'Zogona, Ouagadougou',
    createdAt: '2026-07-28'
  }
];

// Helper date generator for dates relative to today
const getRelativeDateStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SALES = [
  {
    id: 'sale-101',
    clientId: 'cli-1',
    clientName: 'Mariam Ouédraogo',
    clientPhone: '+22670123456',
    items: [
      { productId: 'prod-1', name: 'Robe Bazin Richesse Brodé (Taille L)', qty: 1, price: 35000 },
      { productId: 'prod-5', name: 'Sandales Artisanales Cuir Véritable', qty: 1, price: 12000 }
    ],
    totalAmount: 47000,
    paymentType: 'CREDIT',
    advancePaid: 20000,
    remainingDue: 27000,
    dueDate: getRelativeDateStr(-3), // Retard de 3 jours (J+3)!
    status: 'PARTIAL',
    createdAt: getRelativeDateStr(-10)
  },
  {
    id: 'sale-102',
    clientId: 'cli-2',
    clientName: 'Fatou Traoré',
    clientPhone: '+22676891122',
    items: [
      { productId: 'prod-2', name: 'Ensemble WAX Kente Moderne (3 Pièces)', qty: 1, price: 25000 }
    ],
    totalAmount: 25000,
    paymentType: 'CREDIT',
    advancePaid: 10000,
    remainingDue: 15000,
    dueDate: getRelativeDateStr(0), // Échéance Aujourd'hui (Jour J)!
    status: 'PARTIAL',
    createdAt: getRelativeDateStr(-7)
  },
  {
    id: 'sale-103',
    clientId: 'cli-3',
    clientName: 'Ibrahim Sawadogo',
    clientPhone: '+22665432109',
    items: [
      { productId: 'prod-3', name: 'Chemise Homme Koko Dunda (Taille XL)', qty: 2, price: 18000 }
    ],
    totalAmount: 36000,
    paymentType: 'CREDIT',
    advancePaid: 16000,
    remainingDue: 20000,
    dueDate: getRelativeDateStr(2), // Dans 2 jours (J-2)!
    status: 'PARTIAL',
    createdAt: getRelativeDateStr(-4)
  },
  {
    id: 'sale-104',
    clientId: 'cli-4',
    clientName: 'Awa Compaoré',
    clientPhone: '+22678009988',
    items: [
      { productId: 'prod-4', name: 'Boubou Tradionnel Faso Danfani Premium', qty: 1, price: 45000 }
    ],
    totalAmount: 45000,
    paymentType: 'CASH',
    advancePaid: 45000,
    remainingDue: 0,
    dueDate: null,
    status: 'PAID',
    createdAt: getRelativeDateStr(-1)
  }
];

export const INITIAL_PAYMENTS = [
  {
    id: 'pay-1',
    saleId: 'sale-101',
    clientId: 'cli-1',
    clientName: 'Mariam Ouédraogo',
    amount: 20000,
    paymentMethod: 'ORANGE_MONEY',
    date: getRelativeDateStr(-10),
    remainingBalanceAfter: 27000,
    note: 'Avance initiale lors de la commande'
  },
  {
    id: 'pay-2',
    saleId: 'sale-102',
    clientId: 'cli-2',
    clientName: 'Fatou Traoré',
    amount: 10000,
    paymentMethod: 'CASH',
    date: getRelativeDateStr(-7),
    remainingBalanceAfter: 15000,
    note: 'Avance en boutique'
  },
  {
    id: 'pay-3',
    saleId: 'sale-103',
    clientId: 'cli-3',
    clientName: 'Ibrahim Sawadogo',
    amount: 16000,
    paymentMethod: 'MOOV_MONEY',
    date: getRelativeDateStr(-4),
    remainingBalanceAfter: 20000,
    note: 'Avance par Moov Money'
  }
];

export const INITIAL_WHATSAPP_LOGS = [
  {
    id: 'log-1',
    clientId: 'cli-1',
    clientName: 'Mariam Ouédraogo',
    phone: '+22670123456',
    message: 'Bonjour Mme Mariam Ouédraogo, petit rappel amical de la boutique FasoMode : un solde restant de 27 000 FCFA est arrivé à échéance. Merci pour votre confiance !',
    sentAt: getRelativeDateStr(0) + ' 09:30',
    type: 'AUTOMATED_SIMULATION',
    status: 'DELIVERED'
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    title: 'Loyer Boutique Mensuel',
    category: 'Loyer',
    amount: 50000,
    paymentMethod: 'CASH',
    date: getRelativeDateStr(-8),
    note: 'Loyer boutique mois en cours versé au bailleur'
  },
  {
    id: 'exp-2',
    title: 'Facture Électricité SONABEL',
    category: 'Électricité / Eau',
    amount: 15000,
    paymentMethod: 'ORANGE_MONEY',
    date: getRelativeDateStr(-5),
    note: 'Consommation climatisation et éclairage'
  },
  {
    id: 'exp-3',
    title: 'Transport Réapprovisionnement Marché Rood-Woko',
    category: 'Transport / Livraison',
    amount: 5000,
    paymentMethod: 'CASH',
    date: getRelativeDateStr(-2),
    note: 'Frais de taxi pour récupération des colis pagnes'
  },
  {
    id: 'exp-4',
    title: 'Sachets d\'emballage personnalisés',
    category: 'Fournitures',
    amount: 8000,
    paymentMethod: 'MOOV_MONEY',
    date: getRelativeDateStr(-1),
    note: 'Lot de 200 sacs kraft boutique'
  }
];

export const INITIAL_CASH_CLOSINGS = [
  {
    id: 'close-1',
    date: getRelativeDateStr(-1),
    closedAt: getRelativeDateStr(-1) + 'T19:30:00',
    cashSalesTotal: 45000,
    cashAdvancesTotal: 0,
    cashPaymentsTotal: 0,
    cashExpensesTotal: 8000,
    theoreticalCashTotal: 37000,
    physicalCashCounted: 37000,
    difference: 0,
    mobileMoneyTotal: 0,
    totalDailyRevenue: 45000,
    closedBy: 'Mme Fatoumata Kaboré',
    note: 'Caisse parfaitement équilibrée. Bonne journée de vente.'
  }
];

