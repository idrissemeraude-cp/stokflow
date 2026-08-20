import { createClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  SUPABASE_URL: 'stockflow_supabase_url',
  SUPABASE_KEY: 'stockflow_supabase_key',
  AUTO_SYNC_ENABLED: 'stockflow_auto_sync'
};

const DEFAULT_SUPABASE_URL = 'https://jkvwnydpygiipfifbemz.supabase.co';
const DEFAULT_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Récupération des identifiants (LocalStorage en priorité, puis .env, puis valeurs par défaut)
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY);
  const autoSync = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC_ENABLED) !== 'false';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const effectiveUrl = (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  const effectiveKey = (localKey || envKey || DEFAULT_SUPABASE_KEY).trim();

  // Une vraie clé Anon Supabase est un token JWT qui commence par 'eyJ'
  const isValidAnonKey = Boolean(effectiveKey && (effectiveKey.startsWith('eyJ') || effectiveKey.length > 50));

  return {
    url: effectiveUrl,
    key: effectiveKey,
    autoSync,
    isConfigured: Boolean(effectiveUrl && isValidAnonKey),
    hasValidKeyFormat: isValidAnonKey
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

// Test de connectivité
export const testSupabaseConnection = async (customUrl, customKey) => {
  const url = customUrl || getSupabaseConfig().url;
  const key = customKey || getSupabaseConfig().key;

  if (!url || !key) {
    return { success: false, message: 'URL ou Clé API manquante.' };
  }

  try {
    const testClient = createClient(url, key);
    // On teste une requête simple sur store_info ou products
    const { data, error } = await testClient.from('store_info').select('id, name').limit(1);

    if (error) {
      // Si la table n'existe pas encore
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          needSchema: true,
          message: 'Connexion réussie à Supabase ! (Les tables doivent maintenant être créées avec le script SQL).'
        };
      }
      return { success: false, message: `Erreur Supabase: ${error.message}` };
    }

    return {
      success: true,
      needSchema: false,
      message: 'Connexion PostgreSQL Supabase établie avec succès !',
      data
    };
  } catch (err) {
    return { success: false, message: `Impossible de joindre Supabase : ${err.message}` };
  }
};
