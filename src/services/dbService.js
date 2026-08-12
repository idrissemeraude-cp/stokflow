import { getSupabaseClient } from './supabaseClient';

// ============================================================================
// 🔄 CONVERTISSEURS FORMAT JAVASCRIPT (camelCase) <-> POSTGRESQL (snake_case)
// ============================================================================

export const mappers = {
  // PRODUITS
  productToRow: (p) => ({
    id: p.id,
    name: p.name || 'Sans nom',
    category: p.category || 'Divers',
    sale_price: Number(p.salePrice) || 0,
    purchase_price: Number(p.purchasePrice) || 0,
    stock: Number(p.stock) || 0,
    low_stock_threshold: Number(p.lowStockThreshold) || 2,
    barcode: p.barcode || null,
    variants: p.variants || ['Standard'],
    image: p.image || null,
    updated_at: new Date().toISOString()
  }),
  rowToProduct: (r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    salePrice: Number(r.sale_price) || 0,
    purchasePrice: Number(r.purchase_price) || 0,
    stock: Number(r.stock) || 0,
    lowStockThreshold: Number(r.low_stock_threshold) || 2,
    barcode: r.barcode || '',
    variants: Array.isArray(r.variants) ? r.variants : ['Standard'],
    image: r.image || ''
  }),

  // CLIENTS
  clientToRow: (c) => ({
    id: c.id,
    name: c.name || 'Client',
    phone: c.phone || null,
    address: c.address || null,
    created_at: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),
  rowToClient: (r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone || '',
    address: r.address || '',
    createdAt: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  }),

  // VENTES
  saleToRow: (s) => ({
    id: s.id,
    client_id: s.clientId || null,
    client_name: s.clientName || 'Client Comptant',
    client_phone: s.clientPhone || null,
    items: s.items || [],
    total_amount: Number(s.totalAmount) || 0,
    payment_type: s.paymentType || 'CASH',
    advance_paid: Number(s.advancePaid) || 0,
    remaining_due: Number(s.remainingDue) || 0,
    due_date: s.dueDate || null,
    status: s.status || (s.remainingDue > 0 ? 'PARTIAL' : 'PAID'),
    created_at: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),
  rowToSale: (r) => ({
    id: r.id,
    clientId: r.client_id || '',
    clientName: r.client_name,
    clientPhone: r.client_phone || '',
    items: Array.isArray(r.items) ? r.items : [],
    totalAmount: Number(r.total_amount) || 0,
    paymentType: r.payment_type || 'CASH',
    advancePaid: Number(r.advance_paid) || 0,
    remainingDue: Number(r.remaining_due) || 0,
    dueDate: r.due_date || null,
    status: r.status || 'PAID',
    createdAt: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  }),

  // PAIEMENTS
  paymentToRow: (p) => ({
    id: p.id,
    sale_id: p.saleId || null,
    client_id: p.clientId || null,
    client_name: p.clientName || 'Client',
    amount: Number(p.amount) || 0,
    payment_method: p.paymentMethod || 'CASH',
    date: p.date || new Date().toISOString().split('T')[0],
    remaining_balance_after: Number(p.remainingBalanceAfter) || 0,
    note: p.note || null,
    created_at: new Date().toISOString()
  }),
  rowToPayment: (r) => ({
    id: r.id,
    saleId: r.sale_id || '',
    clientId: r.client_id || '',
    clientName: r.client_name || '',
    amount: Number(r.amount) || 0,
    paymentMethod: r.payment_method || 'CASH',
    date: r.date || new Date().toISOString().split('T')[0],
    remainingBalanceAfter: Number(r.remaining_balance_after) || 0,
    note: r.note || ''
  }),

  // DÉPENSES
  expenseToRow: (e) => ({
    id: e.id,
    title: e.title || 'Dépense',
    category: e.category || 'Divers',
    amount: Number(e.amount) || 0,
    payment_method: e.paymentMethod || 'CASH',
    date: e.date || new Date().toISOString().split('T')[0],
    note: e.note || null,
    created_at: new Date().toISOString()
  }),
  rowToExpense: (r) => ({
    id: r.id,
    title: r.title,
    category: r.category || 'Divers',
    amount: Number(r.amount) || 0,
    paymentMethod: r.payment_method || 'CASH',
    date: r.date || new Date().toISOString().split('T')[0],
    note: r.note || ''
  }),

  // CLÔTURES DE CAISSE
  closingToRow: (c) => ({
    id: c.id,
    date: c.date || new Date().toISOString().split('T')[0],
    closed_at: c.closedAt || new Date().toISOString(),
    cash_sales_total: Number(c.cashSalesTotal) || 0,
    cash_advances_total: Number(c.cashAdvancesTotal) || 0,
    cash_payments_total: Number(c.cashPaymentsTotal) || 0,
    cash_expenses_total: Number(c.cashExpensesTotal) || 0,
    theoretical_cash_total: Number(c.theoreticalCashTotal) || 0,
    physical_cash_counted: Number(c.physicalCashCounted) || 0,
    difference: Number(c.difference) || 0,
    mobile_money_total: Number(c.mobileMoneyTotal) || 0,
    total_daily_revenue: Number(c.totalDailyRevenue) || 0,
    closed_by: c.closedBy || 'Gérant',
    note: c.note || null,
    created_at: new Date().toISOString()
  }),
  rowToClosing: (r) => ({
    id: r.id,
    date: r.date,
    closedAt: r.closed_at,
    cashSalesTotal: Number(r.cash_sales_total) || 0,
    cashAdvancesTotal: Number(r.cash_advances_total) || 0,
    cashPaymentsTotal: Number(r.cash_payments_total) || 0,
    cashExpensesTotal: Number(r.cash_expenses_total) || 0,
    theoreticalCashTotal: Number(r.theoretical_cash_total) || 0,
    physicalCashCounted: Number(r.physical_cash_counted) || 0,
    difference: Number(r.difference) || 0,
    mobileMoneyTotal: Number(r.mobile_money_total) || 0,
    totalDailyRevenue: Number(r.total_daily_revenue) || 0,
    closedBy: r.closed_by || '',
    note: r.note || ''
  }),

  // JOURNAUX WHATSAPP
  waLogToRow: (w) => ({
    id: w.id,
    client_id: w.clientId || null,
    client_name: w.clientName || 'Client',
    phone: w.phone || null,
    message: w.message || '',
    sent_at: w.sentAt || new Date().toLocaleString('fr-FR'),
    type: w.type || 'AUTOMATED_SIMULATION',
    status: w.status || 'DELIVERED',
    created_at: new Date().toISOString()
  }),
  rowToWaLog: (r) => ({
    id: r.id,
    clientId: r.client_id || '',
    clientName: r.client_name || '',
    phone: r.phone || '',
    message: r.message,
    sentAt: r.sent_at || '',
    type: r.type || 'AUTOMATED_SIMULATION',
    status: r.status || 'DELIVERED'
  }),

  // STORE INFO
  storeInfoToRow: (s) => ({
    id: 'default_store',
    name: s.name || 'StockFlow Pro',
    owner_name: s.ownerName || 'Gérant',
    phone: s.phone || '+22600000000',
    city: s.city || 'Ouagadougou, Burkina Faso',
    updated_at: new Date().toISOString()
  }),
  rowToStoreInfo: (r) => ({
    name: r.name || 'StockFlow Pro',
    ownerName: r.owner_name || 'Gérant',
    phone: r.phone || '+22600000000',
    city: r.city || 'Ouagadougou, Burkina Faso'
  })
};

// ============================================================================
// ☁️ OPÉRATIONS CRUD SUPABASE
// ============================================================================

export const dbService = {
  // Récupérer toutes les données depuis Supabase de manière sécurisée
  async fetchAllFromCloud() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase non configuré');

    const safeFetch = async (tableName, orderCol = 'created_at') => {
      try {
        let query = client.from(tableName).select('*');
        if (orderCol) {
          query = query.order(orderCol, { ascending: false });
        }
        const { data, error } = await query;
        if (error) {
          console.warn(`[Supabase safeFetch] ${tableName}:`, error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn(`[Supabase safeFetch catch] ${tableName}:`, err);
        return [];
      }
    };

    const [
      products,
      clients,
      sales,
      payments,
      expenses,
      cashClosings,
      waLogs,
      storeInfo
    ] = await Promise.all([
      safeFetch('products'),
      safeFetch('clients'),
      safeFetch('sales'),
      safeFetch('payments'),
      safeFetch('expenses'),
      safeFetch('cash_closings'),
      safeFetch('whatsapp_logs'),
      safeFetch('store_info', null)
    ]);

    return {
      products: products.map(mappers.rowToProduct),
      clients: clients.map(mappers.rowToClient),
      sales: sales.map(mappers.rowToSale),
      payments: payments.map(mappers.rowToPayment),
      expenses: expenses.map(mappers.rowToExpense),
      cashClosings: cashClosings.map(mappers.rowToClosing),
      waLogs: waLogs.map(mappers.rowToWaLog),
      storeInfo: storeInfo && storeInfo[0] ? mappers.rowToStoreInfo(storeInfo[0]) : null
    };
  },

  // Insertion ou mise à jour unitaire
  async upsertRow(table, rowData) {
    const client = getSupabaseClient();
    if (!client) return { skipped: true };

    const { data, error } = await client.from(table).upsert(rowData, { onConflict: 'id' });
    if (error) throw error;
    return { success: true, data };
  },

  // Suppression unitaire
  async deleteRow(table, id) {
    const client = getSupabaseClient();
    if (!client) return { skipped: true };

    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Exportation complète locale -> Cloud (Push)
  async pushLocalToCloud(localData) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase n\'est pas configuré.');

    const stats = { products: 0, clients: 0, sales: 0, expenses: 0, payments: 0, closings: 0 };

    if (localData.products?.length) {
      const rows = localData.products.map(mappers.productToRow);
      const { error } = await client.from('products').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Erreur Produits: ${error.message}`);
      stats.products = rows.length;
    }

    if (localData.clients?.length) {
      const rows = localData.clients.map(mappers.clientToRow);
      const { error } = await client.from('clients').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Erreur Clients: ${error.message}`);
      stats.clients = rows.length;
    }

    if (localData.sales?.length) {
      const rows = localData.sales.map(mappers.saleToRow);
      const { error } = await client.from('sales').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Erreur Ventes: ${error.message}`);
      stats.sales = rows.length;
    }

    if (localData.payments?.length) {
      const rows = localData.payments.map(mappers.paymentToRow);
      const { error } = await client.from('payments').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Erreur Paiements: ${error.message}`);
      stats.payments = rows.length;
    }

    if (localData.expenses?.length) {
      const rows = localData.expenses.map(mappers.expenseToRow);
      const { error } = await client.from('expenses').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Erreur Dépenses: ${error.message}`);
      stats.expenses = rows.length;
    }

    if (localData.cashClosings?.length) {
      const rows = localData.cashClosings.map(mappers.closingToRow);
      const { error } = await client.from('cash_closings').upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`Erreur Clôtures: ${error.message}`);
      stats.closings = rows.length;
    }

    if (localData.waLogs?.length) {
      const rows = localData.waLogs.map(mappers.waLogToRow);
      await client.from('whatsapp_logs').upsert(rows, { onConflict: 'id' });
    }

    if (localData.storeInfo) {
      const row = mappers.storeInfoToRow(localData.storeInfo);
      await client.from('store_info').upsert(row, { onConflict: 'id' });
    }

    return stats;
  }
};
