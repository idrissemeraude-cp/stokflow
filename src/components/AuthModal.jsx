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
  HelpCircle,
  Database,
  AlertTriangle,
  Loader2
} from 'lucide-react';

import { emptyAllData } from '../utils/storage';
import { getSupabaseClient, getSupabaseConfig } from '../services/supabaseClient';
import { dbService } from '../services/dbService';

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 secondes
const STORAGE_ATTEMPTS_KEY = 'stockflow_login_failed_attempts';
const STORAGE_LOCKOUT_KEY = 'stockflow_login_lockout_until';

const AuthModal = ({ 
  initialMode = 'login', 
  initialPlan = 'PRO', 
  onClose, 
  onLoginSuccess,
  onOpenDatabaseConfig 
}) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [selectedPlan, setSelectedPlan] = useState(initialPlan); // 'FREE' | 'PRO' | 'ULTRA_PRO'
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [showResendEmail, setShowResendEmail] = useState(false);

  // Rate-limiting State (3 tentatives max)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Timer de déverrouillage
  useEffect(() => {
    const checkLockout = () => {
      const savedLockout = localStorage.getItem(STORAGE_LOCKOUT_KEY);
      if (savedLockout) {
        const remainingMs = parseInt(savedLockout, 10) - Date.now();
        if (remainingMs > 0) {
          setLockoutSeconds(Math.ceil(remainingMs / 1000));
        } else {
          localStorage.removeItem(STORAGE_LOCKOUT_KEY);
          localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
          setFailedAttempts(0);
          setLockoutSeconds(0);
        }
      } else {
        setLockoutSeconds(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const supabaseConfig = getSupabaseConfig();
  const isSupabaseReady = supabaseConfig.isConfigured;

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
  const [infoMsg, setInfoMsg] = useState('');

  // Nettoyage de l'identifiant pour Supabase Auth
  const getEffectiveEmail = () => {
    if (mode === 'login') {
      if (loginMethod === 'email') {
        return formData.email.trim().toLowerCase();
      }
      const cleanDigits = formData.phone.replace(/\D/g, '');
      return cleanDigits ? `user_${cleanDigits}@gmail.com` : '';
    }
    if (formData.email.trim()) {
      return formData.email.trim().toLowerCase();
    }
    const cleanDigits = formData.phone.replace(/\D/g, '');
    return cleanDigits ? `user_${cleanDigits}@gmail.com` : '';
  };

  const handleResendConfirmation = async () => {
    const client = getSupabaseClient();
    const targetEmail = getEffectiveEmail();
    if (!client || !targetEmail) {
      setErrorMsg('Veuillez renseigner une adresse email valide.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const { error } = await client.auth.resend({
        type: 'signup',
        email: targetEmail
      });
      if (error) {
        setErrorMsg(`Erreur lors du renvoi: ${error.message}`);
      } else {
        setInfoMsg(`✅ Un nouvel email de confirmation a été envoyé à ${targetEmail}.`);
        setShowResendEmail(false);
      }
    } catch (err) {
      setErrorMsg(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setShowResendEmail(false);

    // Vérification de verrouillage temporaire (3 tentatives max)
    if (mode === 'login' && lockoutSeconds > 0) {
      setErrorMsg(`⛔ Compte temporairement verrouillé suite à 3 tentatives infructueuses. Veuillez patienter encore ${lockoutSeconds} seconde${lockoutSeconds > 1 ? 's' : ''}.`);
      return;
    }

    setIsLoading(true);

    const client = getSupabaseClient();
    const cleanPhone = formData.phone.trim();
    const effectiveEmail = getEffectiveEmail();

    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      setIsLoading(false);
      return;
    }

    if (!client) {
      setErrorMsg("⚠️ L'application n'est pas encore connectée à Supabase.");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        if (!formData.storeName.trim() || (!cleanPhone && !formData.email.trim())) {
          setErrorMsg('Veuillez renseigner le nom de la boutique et au moins un téléphone ou email.');
          setIsLoading(false);
          return;
        }

        let createdUserId = `user-${Date.now()}`;

        // Inscription Supabase Auth si configuré
        if (client) {
          const { data, error } = await client.auth.signUp({
            email: effectiveEmail,
            password: formData.password,
            options: {
              data: {
                owner_name: formData.ownerName.trim() || 'Commerçant',
                store_name: formData.storeName.trim(),
                phone: cleanPhone,
                email: formData.email.trim() || effectiveEmail,
                city: formData.city.trim() || 'Ouagadougou, Burkina Faso',
                plan: selectedPlan,
                role: 'ADMIN'
              }
            }
          });

          if (error) {
            console.error('Erreur Supabase SignUp:', error);
            if (error.message.includes('already registered') || error.message.includes('User already exists')) {
              setErrorMsg('Ce compte existe déjà. Veuillez cliquer sur "Se Connecter" ci-dessus.');
            } else if (error.message.includes('rate limit')) {
              setErrorMsg('Trop de tentatives. Veuillez patienter une minute avant de réessayer.');
            } else {
              setErrorMsg(`Erreur Supabase: ${error.message}`);
            }
            setIsLoading(false);
            return;
          }

          if (data?.user) {
            createdUserId = data.user.id;
          }

          // Si Supabase requiert la confirmation d'email
          if (data?.user && !data?.session) {
            setInfoMsg(`✅ Inscription réussie ! Un email de confirmation a été envoyé à ${effectiveEmail}. Cliquez sur le lien dans l'email pour activer votre compte (ou désactivez "Confirm email" dans Supabase pour vous connecter directement).`);
            setIsLoading(false);
            setMode('login');
            return;
          }

          // Enregistrement explicite dans la table publique public.profiles
          try {
            await dbService.upsertProfile({
              id: createdUserId,
              email: formData.email.trim() || effectiveEmail,
              phone: cleanPhone,
              ownerName: formData.ownerName.trim() || 'Commerçant',
              storeName: formData.storeName.trim(),
              city: formData.city.trim() || 'Ouagadougou, Burkina Faso',
              role: 'ADMIN',
              plan: selectedPlan,
              createdAt: new Date().toISOString()
            });
          } catch (profileErr) {
            console.warn('Note insertion profile (peut être gérée par trigger):', profileErr.message);
          }
        }

        // Nettoyer les anciennes données locales pour démarrer 100% propre
        emptyAllData();

        const newUser = {
          id: createdUserId,
          ownerName: formData.ownerName.trim() || 'Commerçant',
          storeName: formData.storeName.trim(),
          city: formData.city.trim() || 'Ouagadougou, Burkina Faso',
          email: formData.email.trim() || effectiveEmail,
          phone: cleanPhone,
          plan: selectedPlan,
          role: 'ADMIN',
          registeredAt: new Date().toISOString()
        };

        onLoginSuccess(newUser, { isRegister: true });
      } else {
        // Mode Connexion (Login)
        if (!effectiveEmail) {
          setErrorMsg(loginMethod === 'email' ? 'Veuillez renseigner votre adresse email.' : 'Veuillez renseigner votre numéro de téléphone.');
          setIsLoading(false);
          return;
        }

        let loggedUserId = `user-${Date.now()}`;
        let userMeta = {};

        // Connexion Supabase Auth
        if (client) {
          const { data, error } = await client.auth.signInWithPassword({
            email: effectiveEmail,
            password: formData.password
          });

          if (error) {
            console.error('Erreur Supabase SignIn:', error);
            if (error.message.includes('Invalid login credentials')) {
              const nextFailed = failedAttempts + 1;
              if (nextFailed >= MAX_LOGIN_ATTEMPTS) {
                const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                localStorage.setItem(STORAGE_LOCKOUT_KEY, lockoutUntil.toString());
                localStorage.setItem(STORAGE_ATTEMPTS_KEY, String(MAX_LOGIN_ATTEMPTS));
                setFailedAttempts(MAX_LOGIN_ATTEMPTS);
                setLockoutSeconds(60);
                setErrorMsg('⛔ Sécurité : 3 tentatives de connexion infructueuses consécutives. Accès temporairement verrouillé pendant 60 secondes.');
              } else {
                localStorage.setItem(STORAGE_ATTEMPTS_KEY, String(nextFailed));
                setFailedAttempts(nextFailed);
                const remaining = MAX_LOGIN_ATTEMPTS - nextFailed;
                setErrorMsg(`Identifiant ou mot de passe incorrect. ⚠️ Attention : il vous reste ${remaining} tentative${remaining > 1 ? 's' : ''} sur ${MAX_LOGIN_ATTEMPTS} avant verrouillage temporaire.`);
              }
            } else if (error.message.includes('Email not confirmed')) {
              setErrorMsg('✉️ Votre adresse email n\'a pas encore été validée. Cliquez ci-dessous pour renvoyer le lien de confirmation ou vérifiez votre boîte de réception.');
              setShowResendEmail(true);
            } else if (error.message.includes('rate limit')) {
              setErrorMsg('Trop de tentatives. Veuillez patienter une minute.');
            } else {
              setErrorMsg(`Erreur connexion: ${error.message}`);
            }
            setIsLoading(false);
            return;
          }

          if (data?.user) {
            loggedUserId = data.user.id;
            userMeta = data.user.user_metadata || {};
            // Réinitialiser le compteur de tentatives après succès
            localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
            localStorage.removeItem(STORAGE_LOCKOUT_KEY);
            setFailedAttempts(0);
            setLockoutSeconds(0);
          }
        }

        const loggedUser = {
          id: loggedUserId,
          ownerName: userMeta.owner_name || formData.ownerName.trim() || 'Commerçant',
          storeName: userMeta.store_name || formData.storeName.trim() || 'Ma Boutique',
          city: userMeta.city || formData.city.trim() || 'Ouagadougou, Burkina Faso',
          email: userMeta.email || effectiveEmail,
          phone: userMeta.phone || cleanPhone,
          plan: userMeta.plan || 'PRO',
          role: userMeta.role || 'ADMIN',
          registeredAt: new Date().toISOString()
        };

        onLoginSuccess(loggedUser, { isLogin: true });
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setErrorMsg(`Une erreur est survenue : ${err.message || err}`);
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
                Espace Commerçant & Multi-Caisses
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-100/80 mt-1">
            {mode === 'login' 
              ? 'Connectez-vous pour retrouver vos ventes, stocks, caisses et clients.' 
              : 'Créez votre compte boutique pour synchroniser vos appareils.'}
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

        {/* Security Trust Badge */}
        <div className="px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-100/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Serveur Cloud Sécurisé & Chiffré</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-medium text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>StockFlow Pro</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          
          {/* Notification Messages */}
          {lockoutSeconds > 0 && mode === 'login' && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-2xl text-xs font-semibold flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="font-bold">Compte verrouillé temporairement (3/3 tentatives)</span>
              </div>
              <p className="text-[11px] text-red-700">
                Vous avez atteint la limite de 3 tentatives infructueuses. Pour votre sécurité, veuillez patienter <strong>{lockoutSeconds} seconde{lockoutSeconds > 1 ? 's' : ''}</strong> avant de réessayer.
              </p>
              <div className="w-full bg-red-200 rounded-full h-1.5 overflow-hidden mt-1">
                <div 
                  className="bg-red-600 h-1.5 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(lockoutSeconds / 60) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {errorMsg && lockoutSeconds === 0 && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl border border-red-200 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="leading-tight">{errorMsg}</p>
                {showResendEmail && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Renvoyer l'email de confirmation</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {infoMsg && (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-tight">{infoMsg}</span>
            </div>
          )}

          {/* Mode Connexion : Choix Méthode Email vs Téléphone */}
          {mode === 'login' && (
            <div className="flex items-center p-1 bg-emerald-50/80 rounded-xl border border-emerald-200/70 mb-1">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setErrorMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200'
                    : 'text-gray-600 hover:text-emerald-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Par Adresse Email</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setErrorMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  loginMethod === 'phone'
                    ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200'
                    : 'text-gray-600 hover:text-emerald-800'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Par Téléphone</span>
              </button>
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Plan Choice Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Formule d'Abonnement :
                </label>
                <div className="grid grid-cols-3 gap-2">
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

                  <div 
                    onClick={() => setSelectedPlan('ULTRA_PRO')}
                    className={`cursor-pointer p-3 rounded-2xl border text-center transition-all relative ${
                      selectedPlan === 'ULTRA_PRO' 
                        ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-500' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Multi-Caisses
                    </span>
                    <p className="text-xs font-bold text-gray-900">Ultra Pro</p>
                    <p className="text-[11px] font-extrabold text-amber-700 mt-1">15 000 F</p>
                    <p className="text-[9px] text-amber-800 mt-0.5">Multi-caisses VIP</p>
                  </div>
                </div>
              </div>

              {/* Informations Boutique */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nom du Gérant *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="ex: Fatoumata Kaboré"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nom de la Boutique *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="ex: Boutique Faso Mode"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Ville & Pays
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ex: Ouagadougou, Burkina Faso"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Saisie Email (Connexion Email ou Inscription) */}
          {(mode === 'register' || (mode === 'login' && loginMethod === 'email')) && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Adresse Email {mode === 'register' ? '(pour vérification & connexion)' : '*'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled={lockoutSeconds > 0}
                  required={mode === 'login' && loginMethod === 'email'}
                  placeholder="ex: gerant@maboutique.com ou votre_email@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Saisie Téléphone (Connexion Téléphone ou Inscription) */}
          {(mode === 'register' || (mode === 'login' && loginMethod === 'phone')) && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Numéro Téléphone / WhatsApp {mode === 'register' && !formData.email ? '*' : ''}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  disabled={lockoutSeconds > 0}
                  required={mode === 'login' && loginMethod === 'phone'}
                  placeholder="ex: +226 70 00 11 22 ou 70001122"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 font-semibold disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Mot de Passe */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mot de Passe (min. 6 caractères) *
              </label>
              {mode === 'login' && failedAttempts > 0 && failedAttempts < MAX_LOGIN_ATTEMPTS && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Tentative {failedAttempts}/{MAX_LOGIN_ATTEMPTS}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={lockoutSeconds > 0}
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F0FDF4] border border-emerald-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Bouton de Soumission */}
          <button
            type="submit"
            disabled={isLoading || (mode === 'login' && lockoutSeconds > 0)}
            className="w-full btn-magnetic bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vérification en cours...</span>
              </>
            ) : lockoutSeconds > 0 && mode === 'login' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Bloqué temporairement ({lockoutSeconds}s)</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Accéder à mon Compte Supabase' : 'Créer & Enregistrer mon Compte'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Démo Directe */}
          <div className="pt-3 text-center border-t border-gray-100 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLoginSuccess({
                  id: 'demo-user-1',
                  ownerName: 'Mme Fatoumata Kaboré',
                  storeName: 'Boutique Élégance Faso',
                  city: 'Ouagadougou, Burkina Faso',
                  phone: '+226 70 00 11 22',
                  role: 'ADMIN',
                  plan: 'PRO'
                }, { isDemo: true });
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tester en Mode Démo</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AuthModal;
