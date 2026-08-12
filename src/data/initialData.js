// Données de Démonstration (uniquement chargées sur clic explicite "Tester la Démo")

export const DEMO_PRODUCTS = [
  {
    id: 'demo-prod-1',
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
    id: 'demo-prod-2',
    name: 'Ensemble WAX Kente Moderne (3 Pièces)',
    category: 'Ensembles',
    salePrice: 25000,
    purchasePrice: 15000,
    stock: 1,
    lowStockThreshold: 2,
    barcode: 'BF-ENS-002',
    variants: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-prod-3',
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
    id: 'demo-prod-4',
    name: 'Boubou Tradionnel Faso Danfani Premium',
    category: 'Boubous',
    salePrice: 45000,
    purchasePrice: 28000,
    stock: 2,
    lowStockThreshold: 2,
    barcode: 'BF-BOU-004',
    variants: ['Unique', 'Sur-mesure'],
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'demo-prod-5',
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
    id: 'demo-prod-6',
    name: 'Robe Legère Pagne Imprimé',
    category: 'Robes',
    salePrice: 15000,
    purchasePrice: 9000,
    stock: 0,
    lowStockThreshold: 2,
    barcode: 'BF-ROB-006',
    variants: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60'
  }
];

export const DEMO_CLIENTS = [
  {
    id: 'demo-cli-1',
    name: 'Mariam Ouédraogo',
    phone: '+22670123456',
    address: 'Secteur 15 (Ouaga 2000), Ouagadougou',
    createdAt: '2026-07-10'
  },
  {
    id: 'demo-cli-2',
    name: 'Fatou Traoré',
    phone: '+22676891122',
    address: 'Koulouba, Ouagadougou',
    createdAt: '2026-07-15'
  },
  {
    id: 'demo-cli-3',
    name: 'Ibrahim Sawadogo',
    phone: '+22665432109',
    address: 'Dafra, Bobo-Dioulasso',
    createdAt: '2026-07-20'
  }
];

const now = new Date();
const getRelativeDateStr = (daysAgo) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const DEMO_SALES = [
  {
    id: 'demo-sale-1',
    saleNumber: 'VNT-001',
    clientId: 'demo-cli-1',
    clientName: 'Mariam Ouédraogo',
    clientPhone: '+22670123456',
    items: [
      {
        productId: 'demo-prod-1',
        name: 'Robe Bazin Richesse Brodé (Taille L)',
        price: 35000,
        qty: 1,
        variant: 'L',
        total: 35000
      }
    ],
    totalAmount: 35000,
    paymentType: 'CASH_DIRECT',
    amountPaid: 35000,
    remainingBalance: 0,
    paymentMethod: 'ORANGE_MONEY',
    status: 'PAID',
    cashierName: 'Fatoumata K.',
    receiptNote: 'Merci pour votre fidélité !',
    createdAt: getRelativeDateStr(2) + 'T10:30:00'
  }
];

export const DEMO_PAYMENTS = [
  {
    id: 'demo-pay-1',
    saleId: 'demo-sale-1',
    clientId: 'demo-cli-1',
    amount: 35000,
    paymentMethod: 'ORANGE_MONEY',
    date: getRelativeDateStr(2) + 'T10:30:00',
    cashierName: 'Fatoumata K.'
  }
];

export const DEMO_WHATSAPP_LOGS = [];
export const DEMO_EXPENSES = [];
export const DEMO_CASH_CLOSINGS = [];

// Tableaux initiaux vierges obligatoires pour tout compte neuf
export const INITIAL_PRODUCTS = [];
export const INITIAL_CLIENTS = [];
export const INITIAL_SALES = [];
export const INITIAL_PAYMENTS = [];
export const INITIAL_WHATSAPP_LOGS = [];
export const INITIAL_EXPENSES = [];
export const INITIAL_CASH_CLOSINGS = [];
