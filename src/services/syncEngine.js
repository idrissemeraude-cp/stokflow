import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';
import { dbService, mappers } from './dbService';

const QUEUE_KEY = 'stockflow_sync_queue_v1';
const LAST_SYNC_KEY = 'stockflow_last_sync_time';

class SyncEngine {
  constructor() {
    this.queue = this.loadQueue();
    this.isSyncing = false;
    this.listeners = new Set();
    this.realtimeChannel = null;
    this.status = 'UNCONFIGURED'; // 'CONNECTED' | 'SYNCING' | 'OFFLINE' | 'UNCONFIGURED' | 'ERROR'
    this.lastSyncTime = localStorage.getItem(LAST_SYNC_KEY) || null;
    this.onRemoteChangeCallbacks = new Set();

    // Surveillance réseau natif du navigateur
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  loadQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('Erreur sauvegarde queue:', err);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Notification immédiate de l'état actuel
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  onRemoteChange(callback) {
    this.onRemoteChangeCallbacks.add(callback);
    return () => this.onRemoteChangeCallbacks.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    return {
      status: this.status,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount: this.queue.length,
      lastSyncTime: this.lastSyncTime,
      isConfigured: getSupabaseConfig().isConfigured
    };
  }

  handleNetworkChange(isOnline) {
    if (!isOnline) {
      this.status = 'OFFLINE';
      this.notify();
    } else {
      this.checkAndInitConnection();
    }
  }

  // Initialisation du moteur et connexion aux canaux temps réel Supabase
  async init() {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      this.status = 'UNCONFIGURED';
      this.notify();
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.status = 'OFFLINE';
      this.notify();
      return;
    }

    await this.checkAndInitConnection();
  }

  async checkAndInitConnection() {
    const client = getSupabaseClient();
    if (!client) {
      this.status = 'UNCONFIGURED';
      this.notify();
      return;
    }

    try {
      // Test de ping
      const { error } = await client.from('store_info').select('id').limit(1);
      if (error && error.code !== '42P01') {
        this.status = 'ERROR';
        this.notify();
        return;
      }

      this.status = 'CONNECTED';
      this.notify();

      // Vider la file d'attente s'il y a des mutations en attente
      if (this.queue.length > 0) {
        await this.flushQueue();
      }

      // Initialiser les écouteurs Realtime
      this.setupRealtimeListeners(client);
    } catch {
      this.status = 'ERROR';
      this.notify();
    }
  }

  // Configuration des canaux WebSockets Supabase Realtime
  setupRealtimeListeners(client) {
    if (this.realtimeChannel) {
      client.removeChannel(this.realtimeChannel);
    }

    try {
      this.realtimeChannel = client
        .channel('stockflow-db-live')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          this.handleRealtimeEvent(payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase Realtime: Connecté et à l\'écoute des changements multi-caisses');
          }
        });
    } catch (err) {
      console.warn('Realtime subscription non disponible:', err);
    }
  }

  handleRealtimeEvent(payload) {
    const { table, eventType, new: newRow, old: oldRow } = payload;
    let entity = null;
    let mappedData = null;

    switch (table) {
      case 'products':
        entity = 'products';
        mappedData = newRow ? mappers.rowToProduct(newRow) : null;
        break;
      case 'clients':
        entity = 'clients';
        mappedData = newRow ? mappers.rowToClient(newRow) : null;
        break;
      case 'sales':
        entity = 'sales';
        mappedData = newRow ? mappers.rowToSale(newRow) : null;
        break;
      case 'payments':
        entity = 'payments';
        mappedData = newRow ? mappers.rowToPayment(newRow) : null;
        break;
      case 'expenses':
        entity = 'expenses';
        mappedData = newRow ? mappers.rowToExpense(newRow) : null;
        break;
      case 'cash_closings':
        entity = 'cashClosings';
        mappedData = newRow ? mappers.rowToClosing(newRow) : null;
        break;
      default:
        break;
    }

    if (entity) {
      this.onRemoteChangeCallbacks.forEach(cb => cb({
        table,
        entity,
        eventType,
        data: mappedData,
        id: newRow?.id || oldRow?.id
      }));
    }
  }

  // Enqueue une mutation (Action CRUD)
  async enqueue(action, table, payload) {
    const mutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      action, // 'UPSERT' | 'DELETE'
      table,
      payload,
      timestamp: Date.now()
    };

    this.queue.push(mutation);
    this.saveQueue();
    this.notify();

    // Tenter de synchroniser immédiatement si connecté
    if (this.status === 'CONNECTED' && !this.isSyncing) {
      this.flushQueue();
    }
  }

  // Vider la file d'attente vers Supabase
  async flushQueue() {
    if (this.isSyncing || this.queue.length === 0) return;
    const client = getSupabaseClient();
    if (!client) return;

    this.isSyncing = true;
    this.status = 'SYNCING';
    this.notify();

    try {
      while (this.queue.length > 0) {
        const mutation = this.queue[0];
        try {
          if (mutation.action === 'UPSERT') {
            await dbService.upsertRow(mutation.table, mutation.payload);
          } else if (mutation.action === 'DELETE') {
            await dbService.deleteRow(mutation.table, mutation.payload.id);
          }
          // Retirer l'élément réussi
          this.queue.shift();
          this.saveQueue();
          this.notify();
        } catch (err) {
          console.error(`Échec synchro mutation ${mutation.id}:`, err);
          // Si c'est une erreur réseau, on arrête la boucle et on réessaiera plus tard
          if (!navigator.onLine || err.message?.includes('FetchError') || err.message?.includes('network')) {
            this.status = 'OFFLINE';
            break;
          } else {
            // Erreur de validation/schema : on retire pour ne pas bloquer indéfiniment
            this.queue.shift();
            this.saveQueue();
          }
        }
      }

      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, this.lastSyncTime);
      this.status = 'CONNECTED';
    } catch (err) {
      console.error('Erreur globale flushQueue:', err);
      this.status = 'ERROR';
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  // Déclencher une synchronisation manuelle complète
  async syncNow() {
    await this.flushQueue();
    return this.getState();
  }
}

export const syncEngine = new SyncEngine();
