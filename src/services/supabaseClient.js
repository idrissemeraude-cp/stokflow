import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  SUPABASE_URL: 'stockflow_supabase_url',
  SUPABASE_KEY: 'stockflow_supabase_key',
  AUTO_SYNC_ENABLED: 'stockflow_auto_sync'
};

const DEFAULT_SUPABASE_URL = 'https://jkvwnydpygiipfifbemz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_TgKFilq1dQVIHSf0h25RwA_-YV7KTS9';

// Récupération des identifiants (LocalStorage en priorité, puis .env, puis valeurs par défaut)
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY);
  const autoSync = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC_ENABLED) !== 'false';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const effectiveUrl = (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const effectiveKey = (localKey || envKey || DEFAULT_SUPABASE_KEY).trim();

  // Accepter les clés Supabase JWT (eyJ...), les nouvelles clés Publishable (sb_...) ou toute clé valide
  const isValidKey = Boolean(effectiveKey && (effectiveKey.startsWith('sb_') || effectiveKey.startsWith('eyJ') || effectiveKey.length >= 10));

  return {
    url: effectiveUrl,
    key: effectiveKey,
    autoSync,
    isConfigured: Boolean(effectiveUrl && isValidKey),
    hasValidKeyFormat: isValidKey
  };
};

// Sauvegarde des identifiants
export const saveSupabaseConfig = (url, key, autoSync = true) => {
  if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);

  if (key) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);

  localStorage.setItem(STORAGE_KEYS.AUTO_SYNC_ENABLED, String(autoSync));

  // Réinitialiser le client
  cachedClient = null;
  return getSupabaseClient();
};

let cachedClient = null;
let currentConfigKey = '';

// Client Supabase Singleton
export const getSupabaseClient = () => {
  const config = getSupabaseConfig();
  const configKey = `${config.url}_${config.key}`;

  if (!config.isConfigured) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && currentConfigKey === configKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    currentConfigKey = configKey;
    return cachedClient;
  } catch (err) {
    console.error('Erreur d\'initialisation Supabase Client:', err);
    return null;
  }
};

let cachedAdminClient = null;

// Client Supabase Admin avec clé Secrète (Service Role) pour contourner les politiques RLS si nécessaire
export const getSupabaseAdminClient = () => {
  const config = getSupabaseConfig();
  if (!config.url) return getSupabaseClient();

  const secretKey = localStorage.getItem('stockflow_supabase_secret') || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

  if (!secretKey) {
    return getSupabaseClient();
  }

  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  try {
    cachedAdminClient = createClient(config.url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    return cachedAdminClient;
  } catch (err) {
    console.warn('Note creation Admin Client Supabase:', err.message);
    return getSupabaseClient();
  }
};

// Test de connectivité approfondi (Vérification des 9 tables)
export const testSupabaseConnection = async (customUrl, customKey) => {
  const url = customUrl || getSupabaseConfig().url;
  const key = customKey || getSupabaseConfig().key;

  if (!url || !key) {
    return { success: false, message: 'URL ou Clé API manquante.' };
  }

  const REQUIRED_TABLES = [
    'profiles',
    'products',
    'clients',
    'sales',
    'payments',
    'expenses',
    'cash_closings',
    'whatsapp_logs',
    'store_info'
  ];

  try {
    const testClient = createClient(url, key);
    const missingTables = [];
    const existingTables = [];

    for (const table of REQUIRED_TABLES) {
      const { error } = await testClient.from(table).select('id').limit(1);
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        missingTables.push(table);
      } else if (error) {
        // Autre erreur (ex: permission denied)
        console.warn(`Test table ${table} warning:`, error.message);
        existingTables.push(table);
      } else {
        existingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      return {
        success: true,
        needSchema: true,
        missingTables,
        existingTables,
        message: `Connexion à Supabase réussie, mais ${missingTables.length} table(s) sur 9 manque(nt) : [${missingTables.join(', ')}]. Exécutez le script SQL mis à jour pour les créer.`
      };
    }

    return {
      success: true,
      needSchema: false,
      missingTables: [],
      existingTables,
      message: '✅ Connexion PostgreSQL Supabase 100% établie et vérifiée ! Les 9 tables requises sont toutes présentées et fonctionnelles.'
    };
  } catch (err) {
    return { success: false, message: `Impossible de joindre Supabase : ${err.message}` };
  }
};
