import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Crown,
  Key,
  X,
  RefreshCw,
  Mail,
  Phone,
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { getSupabaseClient, getSupabaseConfig } from '../services/supabaseClient';

export default function UsersModal({
  isOpen,
  onClose,
  currentUser,
  profiles = [],
  onSwitchUser,
  onRefreshProfiles
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  // New Cashier / User Form
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CASHIER', // 'ADMIN' | 'CASHIER'
    storeName: currentUser?.storeName || 'Ma Boutique',
    city: currentUser?.city || 'Ouagadougou, Burkina Faso',
    password: ''
  });

  const supabaseConfig = getSupabaseConfig();

  useEffect(() => {
    if (isOpen && onRefreshProfiles) {
      onRefreshProfiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.ownerName && p.ownerName.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.storeName && p.storeName.toLowerCase().includes(q))
    );
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionMsg(null);
    setIsLoading(true);

    if (!newUserData.name.trim() || !newUserData.password || newUserData.password.length < 6) {
      setActionMsg({ type: 'error', text: 'Nom et mot de passe (min. 6 caractères) obligatoires.' });
      setIsLoading(false);
      return;
    }

    const client = getSupabaseClient();
    const cleanPhone = newUserData.phone.trim();
    const cleanDigits = cleanPhone.replace(/\D/g, '');
    const cleanEmail = newUserData.email.trim() || (cleanDigits ? `user_${cleanDigits}@gmail.com` : `user_${Date.now()}@gmail.com`);

    try {
      let newId = `user-${Date.now()}`;

      // Création Supabase Auth si configuré
      if (client) {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: newUserData.password,
          options: {
            data: {
              owner_name: newUserData.name.trim(),
              phone: cleanPhone,
              email: cleanEmail,
              store_name: newUserData.storeName.trim(),
              city: newUserData.city.trim(),
              role: newUserData.role,
              plan: 'PRO'
            }
          }
        });

        if (error) {
          console.warn('Supabase Auth signUp note:', error.message);
        } else if (data?.user) {
          newId = data.user.id;
        }

        // Insertion dans public.profiles
        await dbService.upsertProfile({
          id: newId,
          email: cleanEmail,
          phone: cleanPhone,
          ownerName: newUserData.name.trim(),
          storeName: newUserData.storeName.trim(),
          city: newUserData.city.trim(),
          role: newUserData.role,
          plan: 'PRO',
          createdAt: new Date().toISOString()
        });
      }

      setActionMsg({ 
        type: 'success', 
        text: `✅ Utilisateur "${newUserData.name}" (${newUserData.role === 'ADMIN' ? 'Gérant' : 'Caissier'}) ajouté avec succès à Supabase !` 
      });

      setNewUserData({
        name: '',
        email: '',
        phone: '',
        role: 'CASHIER',
        storeName: currentUser?.storeName || 'Ma Boutique',
        city: currentUser?.city || 'Ouagadougou, Burkina Faso',
        password: ''
      });

      if (onRefreshProfiles) {
        await onRefreshProfiles();
      }
      setActiveTab('list');
    } catch (err) {
      setActionMsg({ type: 'error', text: `Erreur : ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId, profileName) => {
    if (!window.confirm(`Voulez-vous vraiment retirer l'accès de "${profileName}" ?`)) return;
    try {
      await dbService.deleteRow('profiles', profileId);
      setActionMsg({ type: 'success', text: `Utilisateur "${profileName}" retiré.` });
      if (onRefreshProfiles) onRefreshProfiles();
    } catch (err) {
      setActionMsg({ type: 'error', text: `Erreur suppression: ${err.message}` });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-200 space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#064E3B] font-sans flex items-center gap-2">
                <span>Gestion des Utilisateurs & Caissiers</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {profiles.length} {profiles.length > 1 ? 'comptes' : 'compte'}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Visualisez et gérez les différents accès de votre équipe synchronisés sur Supabase.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Notification Message */}
        {actionMsg && (
          <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            actionMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-emerald-50 p-1 rounded-2xl border border-emerald-200">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'list' 
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/60' 
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tous les Utilisateurs ({profiles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add' 
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/60' 
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Ajouter un Utilisateur / Caissier</span>
          </button>
        </div>

        {/* Tab 1: Liste des profils */}
        {activeTab === 'list' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-3">
            
            {/* Search & Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, rôle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {onRefreshProfiles && (
                <button
                  type="button"
                  onClick={onRefreshProfiles}
                  title="Actualiser depuis Supabase"
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Profiles List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                  <Users className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">
                    {profiles.length === 0 
                      ? 'Aucun utilisateur enregistré pour le moment.' 
                      : 'Aucun utilisateur ne correspond à votre recherche.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    + Ajouter le premier compte caissier
                  </button>
                </div>
              ) : (
                filteredProfiles.map((p) => {
                  const isCurrent = currentUser?.id === p.id || currentUser?.email === p.email;
                  const isAdmin = p.role === 'ADMIN';

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-400' 
                          : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-gray-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 ${
                          isAdmin 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {isAdmin ? '👑' : '👤'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-gray-900 truncate">
                              {p.ownerName || p.name || 'Utilisateur'}
                            </h4>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isAdmin 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {isAdmin ? 'Gérant / Admin' : 'Caissier'}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                                Connecté
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-1">
                            {p.storeName && (
                              <span className="flex items-center gap-1">
                                <Store className="w-3 h-3 text-emerald-600" />
                                <span>{p.storeName}</span>
                              </span>
                            )}
                            {p.phone && (
                              <span className="flex items-center gap-1 font-semibold text-gray-700">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{p.phone}</span>
                              </span>
                            )}
                            {p.email && !p.email.includes('@stockflow.app') && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 text-emerald-600" />
                                <span>{p.email}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {onSwitchUser && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSwitchUser(p)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all"
                          >
                            Basculer
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(p.id, p.ownerName || p.name)}
                          title="Supprimer l'utilisateur"
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Ajouter un Utilisateur */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateUser} className="space-y-3.5 overflow-y-auto pr-1">
            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Création multi-caisses avec synchronisation Cloud :</span>
              </p>
              <p className="text-gray-600 text-[11px]">
                Le compte créé pourra se connecter depuis n'importe quel smartphone, tablette ou ordinateur et accéder à la boutique selon les permissions accordées.
              </p>
            </div>

            {/* Rôle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Rôle & Permissions *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setNewUserData({ ...newUserData, role: 'CASHIER' })}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    newUserData.role === 'CASHIER' 
                      ? 'border-blue-500 bg-blue-50/80 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">👤</span>
                    {newUserData.role === 'CASHIER' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 mt-1">Caissier / Vendeur</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Ventes POS et encaissements uniquement.</p>
                </div>

                <div
                  onClick={() => setNewUserData({ ...newUserData, role: 'ADMIN' })}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    newUserData.role === 'ADMIN' 
                      ? 'border-amber-500 bg-amber-50/80 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">👑</span>
                    {newUserData.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 mt-1">Gérant / Admin</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Accès complet (bénéfices, stocks, clôtures).</p>
                </div>
              </div>
            </div>

            {/* Nom & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Moussa Ouedraogo"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Téléphone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="ex: +226 70 12 34 56"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Email & Mot de passe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email (Optionnel)
                </label>
                <input
                  type="email"
                  placeholder="ex: caisse1@maboutique.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mot de Passe (min. 6 car.) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Bouton Créer */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Enregistrement sur Supabase...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer le Compte dans Supabase</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
