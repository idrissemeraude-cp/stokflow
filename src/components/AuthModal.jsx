import React, { useState } from 'react';
import { 
  ShoppingBag, 
  X, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  Store, 
  ArrowRight, 
  ShieldCheck,
  Check,
  Crown,
  Award,
  Zap,
  MapPin,
  HelpCircle
} from 'lucide-react';

import { emptyAllData } from '../utils/storage';
import { getSupabaseClient } from '../services/supabaseClient';

const AuthModal = ({ initialMode = 'login', initialPlan = 'PRO', onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [selectedPlan, setSelectedPlan] = useState(initialPlan); // 'FREE' | 'PRO' | 'VIP'
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    ownerName: '',
    storeName: '',
    city: 'Ouagadougou, Burkina Faso',
    email: '',
    phone: '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const client = getSupabaseClient();
    const cleanPhone = formData.phone.trim();
    const cleanEmail = formData.email.trim() || `${cleanPhone.replace(/\D/g, '') || 'user'}@stockflow.com`;

    try {
      if (mode === 'register') {
        if (!formData.storeName.trim() || !cleanPhone || !formData.password.trim()) {
          setErrorMsg('Veuillez renseigner le nom de la boutique, le téléphone WhatsApp et un mot de passe.');
          setIsLoading(false);
          return;
        }

        // Tenter l'inscription Supabase Auth si configuré
        if (client) {
          try {
            await client.auth.signUp({
              email: cleanEmail,
              password: formData.password,
              options: {
                data: {
                  owner_name: formData.ownerName.trim() || 'Commerçant',
                  store_name: formData.storeName.trim(),
                  phone: cleanPhone,
                  city: formData.city.trim() || 'Ouagadougou, Burkina Faso',
                  plan: selectedPlan
                }
              }
            });
          } catch (authErr) {
            console.warn('Supabase Auth SignUp (ignoré si facultatif):', authErr.message);
          }
        }

        // Nettoyer toutes les anciennes données de démo pour démarrer 100% à vide
        emptyAllData();

        const newUser = {
          ownerName: formData.ownerName.trim() || 'Commerçant',
          storeName: formData.storeName.trim(),
          city: formData.city.trim() || 'Ouagadougou, Burkina Faso',
          email: cleanEmail,
          phone: cleanPhone,
          plan: selectedPlan,
          registeredAt: new Date().toISOString()
        };

        onLoginSuccess(newUser, { isRegister: true });
      } else {
        if (!cleanPhone || !formData.password.trim()) {
          setErrorMsg('Veuillez entrer votre numéro de téléphone et mot de passe.');
          setIsLoading(false);
          return;
        }

        // Tenter la connexion Supabase Auth si configuré
        if (client) {
          try {
            await client.auth.signInWithPassword({
              email: cleanEmail,
              password: formData.password
            });
          } catch (authErr) {
            console.warn('Supabase Auth SignIn (ignoré si local):', authErr.message);
          }
        }

        const loggedUser = {
          ownerName: formData.ownerName.trim() || 'Commerçant',
          storeName: formData.storeName.trim() || 'Ma Boutique',
          city: formData.city.trim() || 'Ouagadougou, Burkina Faso',
          email: cleanEmail,
          phone: cleanPhone,
          plan: 'PRO',
          registeredAt: new Date().toISOString()
        };

        onLoginSuccess(loggedUser, { isLogin: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-[#064E3B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-[#064E3B] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 text-emerald-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md border border-emerald-400">
              <ShoppingBag className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-sans tracking-tight">
                StockFlow Pro
              </h2>
              <span className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">
                Espace Commerçant & Caisse
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-100/80 mt-1">
            {mode === 'login' 
              ? 'Connectez-vous pour retrouver vos ventes, stocks et clients.' 
              : 'Créez votre compte boutique en 30 secondes.'}
          </p>

          {/* Mode Switcher */}
          <div className="flex bg-emerald-900/60 p-1 rounded-2xl mt-4 border border-emerald-700">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login' 
                  ? 'bg-emerald-500 text-white shadow' 
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Se Connecter
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register' 
                  ? 'bg-emerald-500 text-white shadow' 
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Créer un Compte
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-3 rounded-2xl border border-red-200 text-xs font-semibold flex items-center gap-2">
              <X className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Plan Choice Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Choisissez votre Formule d'Abonnement :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Option Gratuit */}
                  <div 
                    onClick={() => setSelectedPlan('FREE')}
                    className={`cursor-pointer p-3 rounded-2xl border text-center transition-all ${
                      selectedPlan === 'FREE' 
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900">Gratuit</p>
                    <p className="text-[11px] font-extrabold text-emerald-700 mt-1">0 FCFA</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Essai 15 articles</p>
                  </div>

                  {/* Option Pro 5000 */}
                  <div 
                    onClick={() => setSelectedPlan('PRO')}
                    className={`cursor-pointer p-3 rounded-2xl border text-center transition-all relative ${
                      selectedPlan === 'PRO' 
                        ? 'border-emerald-600 bg-emerald-100 shadow-sm ring-2 ring-emerald-600' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Populaire
                    </span>
                    <p className="text-xs font-bold text-gray-900">Pro Illimité</p>
                    <p className="text-[11px] font-extrabold text-emerald-800 mt-1">5 000 F</p>
                    <p className="text-[9px] text-emerald-700 mt-0.5">Tout illimité</p>
                  </div>

                  {/* Option Ultra Pro 15000 */}
                  <div 
                    onClick={() => setSelectedPlan('ULTRA_PRO')}
                    className={`cursor-pointer p-3 rounded-2xl border text-center transition-all relative ${
                      selectedPlan === 'ULTRA_PRO' 
                        ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-500' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Vidéos Démo
                    </span>
                    <p className="text-xs font-bold text-gray-900">Ultra Pro</p>
                    <p className="text-[11px] font-extrabold text-amber-700 mt-1">15 000 F</p>
                    <p className="text-[9px] text-amber-800 mt-0.5">Vidéos Démo & VIP</p>
                  </div>

                </div>
              </div>

              {/* Notice paiement si plan payant */}
              {selectedPlan !== 'FREE' && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11px] text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span>💡 Règlement par Mobile Money (Orange Money / Wave / Moov) :</span>
                  </p>
                  <p className="text-gray-600 leading-tight">
                    Vous pourrez régler votre abonnement ({selectedPlan === 'PRO' ? '5 000 FCFA' : '15 000 FCFA'}) au <strong>+226 60 55 77 77</strong>. L'activation est immédiate.
                  </p>
                </div>
              )}

              {/* Form Inputs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nom & Prénom du Gérant
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ex: Fatoumata Kaboré"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nom de la Boutique / Commerce *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Boutique Élégance Faso"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Ville / Pays
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ex: Ouagadougou, Burkina Faso"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Numéro de Téléphone WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="ex: +226 70 00 11 22"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mot de Passe *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-magnetic bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all mt-6"
          >
            <span>{mode === 'login' ? 'Accéder à mon Compte' : 'Valider mon Inscription'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Direct Demo Link */}
          <div className="pt-3 text-center border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLoginSuccess({
                  ownerName: 'Mme Fatoumata Kaboré',
                  storeName: 'Boutique Élégance Faso',
                  city: 'Ouagadougou, Burkina Faso',
                  phone: '+226 70 00 11 22'
                }, { isDemo: true });
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tester directement avec les données de Démo</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AuthModal;
