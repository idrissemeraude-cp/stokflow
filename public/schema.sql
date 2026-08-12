-- ==============================================================================
-- 🚀 SCHÉMA DE BASE DE DONNÉES POSTGRESQL / SUPABASE - STOCKFLOW PRO (FASOMODE)
-- ==============================================================================
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase (SQL Editor).
-- Il crée les 8 tables métier, les index de performance, les politiques de sécurité (RLS)
-- et active la synchronisation temps réel pour le multi-caisses.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PRODUITS / STOCK
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Divers',
    sale_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 2,
    barcode TEXT,
    variants JSONB DEFAULT '["Standard"]'::jsonb,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 3. TABLE DES CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);

-- 4. TABLE DES VENTES & COMMANDES (POS)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_type TEXT NOT NULL DEFAULT 'CASH',
    advance_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    remaining_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_client_id ON public.sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_due_date ON public.sales(due_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);

-- 5. TABLE DES PAIEMENTS / RÈGLEMENTS DE CRÉANCE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    sale_id TEXT,
    client_id TEXT,
    client_name TEXT,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'CASH',
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    remaining_balance_after NUMERIC(15, 2) NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON public.payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(date DESC);

-- 6. TABLE DES DÉPENSES D'EXPLOITATION
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Divers',
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'CASH',
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- 7. TABLE DES CLÔTURES DE CAISSE
CREATE TABLE IF NOT EXISTS public.cash_closings (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    closed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    cash_sales_total NUMERIC(15, 2) DEFAULT 0,
    cash_advances_total NUMERIC(15, 2) DEFAULT 0,
    cash_payments_total NUMERIC(15, 2) DEFAULT 0,
    cash_expenses_total NUMERIC(15, 2) DEFAULT 0,
    theoretical_cash_total NUMERIC(15, 2) DEFAULT 0,
    physical_cash_counted NUMERIC(15, 2) DEFAULT 0,
    difference NUMERIC(15, 2) DEFAULT 0,
    mobile_money_total NUMERIC(15, 2) DEFAULT 0,
    total_daily_revenue NUMERIC(15, 2) DEFAULT 0,
    closed_by TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cash_closings_date ON public.cash_closings(date DESC);

-- 8. TABLE DU JOURNAL WHATSAPP & RELANCES
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    sent_at TEXT,
    type TEXT DEFAULT 'AUTOMATED_SIMULATION',
    status TEXT DEFAULT 'DELIVERED',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLE DES PARAMÈTRES DE LA BOUTIQUE
CREATE TABLE IF NOT EXISTS public.store_info (
    id TEXT PRIMARY KEY DEFAULT 'default_store',
    name TEXT NOT NULL DEFAULT 'StockFlow Pro',
    owner_name TEXT DEFAULT 'Gérant',
    phone TEXT DEFAULT '+22600000000',
    city TEXT DEFAULT 'Ouagadougou, Burkina Faso',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.store_info (id, name, owner_name, phone, city)
VALUES ('default_store', 'StockFlow Pro', 'Gérant', '+22600000000', 'Ouagadougou, Burkina Faso')
ON CONFLICT (id) DO NOTHING;

-- SÉCURITÉ (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acces total produits" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total ventes" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total paiements" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total depenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total clotures" ON public.cash_closings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total logs_whatsapp" ON public.whatsapp_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acces total store_info" ON public.store_info FOR ALL USING (true) WITH CHECK (true);

-- TEMPS RÉEL
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_closings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.store_info;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
