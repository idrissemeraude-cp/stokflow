import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  X,
  Server,
  Zap,
  Info,
  Layers,
  Key,
  Globe
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';
import { syncEngine } from '../services/syncEngine';
import { dbService } from '../services/dbService';

export default function DatabaseSettingsModal({
  isOpen,
  onClose,
  localState,
  onCloudDataImported,
  onClearAllData,
  onLoadDemoData
}) {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'schema' | 'sync'
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  
  const [syncState, setSyncState] = useState(syncEngine.getState());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setKey(config.key || '');
      setAutoSync(config.autoSync);
      setTestResult(null);
      setActionMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveSupabaseConfig(url, key, autoSync);
    syncEngine.checkAndInitConnection();
    setActionMessage({ type: 'success', text: '✅ Configuration Supabase enregistrée avec succès.' });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, key);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushToCloud = async () => {
    if (!window.confirm('Voulez-vous envoyer l\'intégralité des données locales vers Supabase ? Les données distantes existantes seront mises à jour.')) return;
    setIsPushing(true);
    setActionMessage(null);
    try {
      const stats = await dbService.pushLocalToCloud(localState);
      setActionMessage({
        type: 'success',
        text: `🚀 Sauvegarde Cloud réussie ! (${stats.products} articles, ${stats.sales} ventes, ${stats.clients} clients, ${stats.expenses} dépenses).`
      });
      syncEngine.flushQueue();
    } catch (err) {
      setActionMessage({ type: 'error', text: `Erreur lors de l'envoi Cloud : ${err.message}` });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!window.confirm('Attention : Importer les données depuis Supabase mettra à jour votre stockage local avec les données du Cloud. Continuer ?')) return;
    setIsPulling(true);
    setActionMessage(null);
    try {
      const cloudData = await dbService.fetchAllFromCloud();
      if (onCloudDataImported) {
        onCloudDataImported(cloudData);
      }
      setActionMessage({
        type: 'success',
        text: `📥 Données importées du Cloud avec succès (${cloudData.products.length} articles, ${cloudData.sales.length} ventes reçues).`
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: `Erreur lors de la récupération Cloud : ${err.message}` });
    } finally {
      setIsPulling(false);
    }
  };

  const handleManualSync = async () => {
    setIsPushing(true);
    try {
      await syncEngine.syncNow();
      setActionMessage({ type: 'success', text: '⚡ Synchronisation des modifications terminée !' });
    } catch (err) {
      setActionMessage({ type: 'error', text: `Erreur synchro : ${err.message}` });
    } finally {
      setIsPushing(false);
    }
  };

  const copySqlScript = async () => {
    try {
      const response = await fetch('/schema.sql');
      const sqlText = await response.text();
      await navigator.clipboard.writeText(sqlText);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (err) {
      console.error('Erreur copie SQL:', err);
    }
  };

  const getStatusBadge = () => {
    if (!syncState.isConfigured) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <Database className="w-3.5 h-3.5 text-gray-500" />
          Mode Local (LocalStorage)
        </span>
      );
    }
    if (syncState.status === 'CONNECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          PostgreSQL Supabase Connecté & Temps Réel
        </span>
      );
    }
    if (syncState.status === 'SYNCING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          Synchronisation en cours ({syncState.pendingCount} en attente)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <CloudOff className="w-3.5 h-3.5 text-red-600" />
        Hors-ligne / Déconnecté
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Base de Données & Cloud</h2>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md border border-indigo-400/30">
                  Supabase PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Architecture Hybride Offline-First avec synchronisation multi-caisses temps réel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">État du système :</span>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>En attente : <strong>{syncState.pendingCount}</strong></span>
            <span>Dernière synchro : <strong>{syncState.lastSyncTime ? new Date(syncState.lastSyncTime).toLocaleTimeString('fr-FR') : 'Jamais'}</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            Connexion & Clés API
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Synchronisation & Migration
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Schéma SQL (9 Tables)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {actionMessage && (
            <div
              className={`p-4 rounded-2xl text-sm flex items-start gap-3 border ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{actionMessage.text}</div>
            </div>
          )}

          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed space-y-1.5">
                  <strong className="font-bold">Configuration Supabase Cloud & Authentification :</strong>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Créez un compte gratuit sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold text-indigo-700">supabase.com</a> et créez un projet.</li>
                    <li>Dans <strong>Project Settings &gt; API</strong>, copiez l'<strong>URL du projet</strong> et la <strong>Clé Anon (public)</strong> ci-dessous.</li>
                    <li>Dans <strong>Authentication &gt; Providers &gt; Email</strong>, décochez <em>"Confirm email"</em> si vous souhaitez des inscriptions/connexions immédiates sans attente d'email de confirmation.</li>
                    <li>Exécutez le script SQL (onglet <em>Schéma SQL</em>) dans le <strong>SQL Editor</strong> de Supabase pour créer les 9 tables dont <strong>profiles</strong> et les déclencheurs automatiques.</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL du Projet Supabase
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Clé API Publique (anon / public key)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Synchronisation Automatique en Arrière-Plan</div>
                    <div className="text-xs text-slate-500">Transmet instantanément chaque vente ou modification de stock dès la connexion rétablie.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Test connection result */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                      testResult.success
                        ? testResult.needSchema
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div>{testResult.message}</div>
                      {testResult.needSchema && (
                        <div className="mt-1 font-bold">👉 Rendez-vous dans l'onglet "Schéma SQL" pour créer les tables.</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !url || !key}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                    Tester la Connexion
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Enregistrer la Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNCHRONISATION & MIGRATION */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Push Card */}
                <div className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Envoyer tout vers le Cloud</h4>
                      <p className="text-xs text-slate-500">Local (LocalStorage) &rarr; Supabase</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Transfère l'ensemble de vos articles, ventes, clients, dépenses et clôtures locales vers la base PostgreSQL distante pour initialiser le Cloud.
                  </p>
                  <button
                    onClick={handlePushToCloud}
                    disabled={isPushing || !syncState.isConfigured}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    {isPushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    Transférer les Données Locales au Cloud
                  </button>
                </div>

                {/* Pull Card */}
                <div className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Importer depuis le Cloud</h4>
                      <p className="text-xs text-slate-500">Supabase &rarr; Local (LocalStorage)</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Télécharge les données à jour depuis Supabase sur cet appareil pour restaurer un poste ou synchroniser un nouvel appareil.
                  </p>
                  <button
                    onClick={handlePullFromCloud}
                    disabled={isPulling || !syncState.isConfigured}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    {isPulling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                    Télécharger et Restaurer du Cloud
                  </button>
                </div>
              </div>

              {/* Queue Actions */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    File d'Attente de Synchronisation
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {syncState.pendingCount === 0
                      ? 'Toutes les opérations locales sont synchronisées avec la base PostgreSQL.'
                      : `${syncState.pendingCount} modification(s) en attente d'envoi vers Supabase.`}
                  </div>
                </div>
                <button
                  onClick={handleManualSync}
                  disabled={isPushing || syncState.pendingCount === 0 || !syncState.isConfigured}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
                  Forcer la Synchronisation Immédiate
                </button>
              </div>

              {/* Maintenance & Reset Actions */}
              <div className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  Maintenance & Réinitialisation de la Base Locale
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Permet de remettre à zéro les tableaux de bord (0 article, 0 vente) pour une utilisation neuve, ou de charger les exemples de test.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onClearAllData) onClearAllData();
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    🗑️ Vider Toutes les Données (Remise à Zéro)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadDemoData) onLoadDemoData();
                    }}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    ⚡ Charger Données Démo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Script SQL PostgreSQL (9 Tables Idempotent)</h3>
                  <p className="text-xs text-slate-500">Contient : profiles, products, clients, sales, payments, expenses, cash_closings, whatsapp_logs, store_info</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/schema.sql"
                    download="schema_stockflow.sql"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger .sql
                  </a>
                  <button
                    onClick={copySqlScript}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Copié dans le presse-papier !' : 'Copier le Script SQL'}
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 h-64 overflow-y-auto leading-relaxed shadow-inner">
                <pre className="text-slate-300">
{`-- TABLE DES PRODUITS
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

-- TABLE DES VENTES & COMMANDES (POS)
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- (Voir le script complet avec RLS et Realtime via le bouton Copier)`}
                </pre>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Collez ce script dans l'éditeur SQL de votre projet Supabase pour créer la base.</span>
                </div>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-1 text-amber-900 shrink-0"
                >
                  Ouvrir Supabase SQL Editor
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
