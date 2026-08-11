import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  MessageSquareText, 
  Package, 
  BarChart3, 
  ShieldCheck, 
  Check, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  CheckCircle2,
  Building,
  Store,
  HelpCircle,
  FileSpreadsheet,
  Receipt,
  ScanLine,
  Lock,
  Headphones,
  BookOpen,
  Gift,
  Award,
  Crown,
  Smartphone,
  ChevronRight,
  Play,
  Video,
  Flame,
  CheckSquare
} from 'lucide-react';

const LandingPage = ({ onOpenAuth, onEnterDemo }) => {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#064E3B] font-sans selection:bg-[#10B981] selection:text-white">
      
      {/* 1. Header / Navbar */}
      <header className="border-b border-emerald-200/60 bg-white/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-400/40">
              <ShoppingBag className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-xl tracking-tight text-[#064E3B]">
                  StockFlow Pro
                </h1>
                <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Boutiques & Commerces
                </span>
              </div>
              <p className="text-[11px] text-emerald-700/70 hidden sm:block">
                Caisse POS, Stocks & Relances WhatsApp (FCFA)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-[#064E3B]/80">
            <a href="#pourquoi-notre-site" className="hover:text-emerald-600 transition-colors">Pourquoi Notre Site ?</a>
            <a href="#tarifs" className="hover:text-emerald-600 transition-colors font-bold text-emerald-700">Tarifs & Abonnements</a>
            <a href="#avis" className="hover:text-emerald-600 transition-colors">Avis Commerçants (4.9★)</a>
          </nav>

          {/* Action CTA Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 rounded-2xl text-xs font-bold text-[#064E3B] hover:bg-emerald-100/60 transition-all border border-emerald-200"
            >
              Se Connecter
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="btn-magnetic bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 transition-all"
            >
              <span>Créer un Compte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-14 lg:py-20 border-b border-emerald-100 bg-gradient-to-b from-white via-[#ECFDF5] to-[#F0FDF4]">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 bg-emerald-100 border border-emerald-300/80 px-4 py-1.5 rounded-full text-emerald-800 text-xs mb-6 font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>La Solution N°1 pour Encaisser et Gérer sa Boutique en Afrique</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#064E3B] tracking-tight leading-tight max-w-4xl mx-auto font-sans">
            La Plateforme Complète pour Piloter votre Caisse, vos Stocks et vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">Créances WhatsApp</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-800/80 mt-5 max-w-2xl mx-auto leading-relaxed font-medium">
            Fini les pertes d'argent, les cahiers de crédits illisibles et les calculs interminables chaque soir. <strong>StockFlow Pro</strong> automatise tout votre commerce en quelques secondes.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto btn-magnetic bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Créer mon Compte Immédiatement</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-[#064E3B] font-bold px-8 py-3.5 rounded-2xl text-sm border border-emerald-300 shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Tester la Démo en 1 Clic</span>
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 pt-8 border-t border-emerald-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">1 450+</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Boutiques Utilisatrices</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">98.8%</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Taux de Recouvrement</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">4.9 / 5</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Note des Commerçants</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">0 FCFA</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Pour Démarrer</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Pourquoi Notre Site ? Les Avantages Uniques */}
      <section id="pourquoi-notre-site" className="py-16 lg:py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs text-emerald-700 uppercase tracking-widest font-bold">
              La Différence StockFlow Pro
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#064E3B] mt-2 font-sans">
              Pourquoi choisir notre site et pas les autres ?
            </h2>
            <p className="text-sm text-emerald-800/70 mt-3 leading-relaxed">
              Les autres logiciels sont conçus pour les entreprises occidentales avec des paiements en devises étrangères et des interfaces complexes. <strong>Notre site a été créé sur mesure pour les réalités du commerce en Afrique et dans la zone FCFA.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Avantage 1 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#064E3B] font-sans mb-2">
                1. Relances d'Impayés par WhatsApp 1-Clic
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Notre site génère automatiquement un message personnalisé et poli contenant les articles achetés, le montant versé et le solde restant. Un seul clic ouvre directement WhatsApp sur le numéro du client.
              </p>
            </div>

            {/* Avantage 2 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#064E3B] font-sans mb-2">
                2. Reçus Thermiques & Factures Instantanées
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Imprimez en 1 seconde vos tickets sur les imprimantes de caisse POS (58mm/80mm) ou envoyez le reçu propre par message WhatsApp sans gaspiller de papier.
              </p>
            </div>

            {/* Avantage 3 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mb-4 shadow">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#064E3B] font-sans mb-2">
                3. Clôture Journalière & Rapport Z de Caisse
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Finies les erreurs de caisse ! Le site calcule automatiquement le solde théorique de vos espèces, déduit les dépenses du jour et calcule l'écart exact avec le tiroir physique.
              </p>
            </div>

            {/* Avantage 4 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mb-4 shadow">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#064E3B] font-sans mb-2">
                4. Vrai Bénéfice Net Réel
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Le site fait la différence entre votre chiffre d'affaires brut et votre gain net réel : il déduit automatiquement le coût d'achat du stock et toutes vos charges (loyer, SONABEL, salaires).
              </p>
            </div>

            {/* Avantage 5 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-4 shadow">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#064E3B] font-sans mb-2">
                5. Scanner Code-barres Caméra & Douchette
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Utilisez simplement l'appareil photo de votre smartphone ou branchez votre lecteur de code-barres pour biper les articles et les ajouter au panier à la vitesse de l'éclair.
              </p>
            </div>

            {/* Avantage 6 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center mb-4 shadow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#064E3B] font-sans mb-2">
                6. Double Sécurité par Code PIN (Gérant vs Caissier)
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Le mode Caissier permet à vos employés de vendre et d'encaisser sans jamais avoir accès à vos prix d'achat fournisseurs ni à vos bénéfices réels.
              </p>
            </div>

          </div>

          {/* Tableau Comparatif Récapitulatif */}
          <div className="mt-14 bg-[#064E3B] text-white rounded-3xl border border-emerald-800 p-6 sm:p-8 shadow-xl overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-bold font-sans mb-6 text-center text-white">
              Tableau Comparatif : Pourquoi notre site fait l'unanimité ?
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-700 text-emerald-300 font-semibold">
                  <th className="py-3 px-4">Critère de Comparaison</th>
                  <th className="py-3 px-4 text-emerald-200/60">Carnet Papier</th>
                  <th className="py-3 px-4 text-emerald-200/60">Autres Logiciels</th>
                  <th className="py-3 px-4 text-emerald-300 font-bold bg-emerald-800/60">Notre Site (StockFlow Pro)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/60 text-emerald-100">
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Relances WhatsApp automatisées 1-Clic</td>
                  <td className="py-3.5 px-4 text-red-300">❌ Impossible</td>
                  <td className="py-3.5 px-4 text-red-300">❌ Inexistant</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-bold bg-emerald-800/60">✅ 1 Clic Direct</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Monnaie FCFA & Mobile Money (Orange, Moov, Wave)</td>
                  <td className="py-3.5 px-4 text-red-300">❌ Manuel</td>
                  <td className="py-3.5 px-4 text-red-300">❌ Devises étrangères</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-bold bg-emerald-800/60">✅ 100% FCFA & Mobile Money</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Clôture journalière automatique & Rapport Z</td>
                  <td className="py-3.5 px-4 text-red-300">⚠️ 2h de calcul le soir</td>
                  <td className="py-3.5 px-4 text-amber-300">⚠️ Trop complexe</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-bold bg-emerald-800/60">✅ Rapport Z instantané</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Simplicité sur Téléphone & Tablette</td>
                  <td className="py-3.5 px-4 text-red-300">❌ Non</td>
                  <td className="py-3.5 px-4 text-red-300">❌ PC lourd obligatoire</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-bold bg-emerald-800/60">✅ 100% Mobile & Tactile</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 4. Section Tarifs & Abonnements (Gratuit, Pro 5 000 FCFA, Ultra Pro 15 000 FCFA) */}
      <section id="tarifs" className="py-16 lg:py-24 bg-[#F0FDF4] border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs text-emerald-700 uppercase tracking-widest font-bold">
              Tarifs Clairs & Sans Engagement
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#064E3B] mt-2 font-sans">
              Nos Formules & Abonnements
            </h2>
            <p className="text-sm text-emerald-800/70 mt-3">
              Commencez à 0 Franc pour tester, puis passez à la vitesse supérieure pour débloquer toutes les options en illimité.
            </p>
          </div>

          {/* Pricing Grid (3 Plans: Gratuit 0 F, Pro 5 000 F, Ultra Pro 15 000 F) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* PLAN 1 : GRATUIT (0 FCFA) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Formule Découverte
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 font-sans">Gratuit</h3>
                <p className="text-xs text-gray-500 mt-1">Options de base pour tester l'application</p>

                <div className="mt-5 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">0 FCFA</span>
                  <span className="text-xs text-gray-500 ml-1">/ mois</span>
                </div>

                <div className="space-y-3 text-xs text-gray-700 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Jusqu'à <strong>15 articles</strong> en stock</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Caisse POS & Ventes de base</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>5 Relances WhatsApp par jour</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Reçus de caisse simples</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-gray-400">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span className="line-through">Relances WhatsApp illimitées</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-gray-400">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span className="line-through">Clôture journalière (Rapport Z)</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-gray-400">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span className="line-through">Vidéos de Démo & Masterclass</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-2xl text-xs transition-all"
                >
                  Commencer à 0 Franc
                </button>
              </div>
            </div>

            {/* PLAN 2 : PRO (5 000 FCFA) */}
            <div className="bg-[#064E3B] text-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-400 shadow-2xl flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>Le Choix N°1 des Commerçants</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-600">
                    Plan Pro Illimité
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-sans">Pro Illimité</h3>
                <p className="text-xs text-emerald-100/80 mt-1">Toutes les options limitées deviennent 100% ILLIMITÉES</p>

                <div className="mt-5 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">5 000 FCFA</span>
                  <span className="text-xs text-emerald-200 ml-1">/ mois</span>
                </div>

                <div className="space-y-3 text-xs text-emerald-100 pt-4 border-t border-emerald-700/60">
                  <div className="flex items-center space-x-2.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Articles & Stocks 100% ILLIMITÉS</span>
                  </div>
                  <div className="flex items-center space-x-2.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Messages & Relances WhatsApp ILLIMITÉS</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Impression Reçus Thermiques (58/80mm) & A5</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Clôture de Caisse & Rapport Z automatique</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Suivi des Dépenses & Bénéfice Net Réel</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Scanner Code-barres Caméra & Douchette</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Mode Caissier sécurisé par Code PIN</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Import & Export Excel / CSV</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full btn-magnetic py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:from-emerald-300 hover:to-teal-300 text-gray-950 font-extrabold rounded-2xl text-xs shadow-lg transition-all"
                >
                  Choisir l'Offre Pro (5 000 FCFA)
                </button>
              </div>
            </div>

            {/* PLAN 3 : ULTRA PRO (15 000 FCFA) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-400 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center space-x-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Pack Suprême + Vidéos Démo</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    Ultra Pro & Masterclass
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 font-sans">Ultra Pro</h3>
                <p className="text-xs text-gray-500 mt-1">Pour exploiter le site à son plus haut niveau d'efficacité</p>

                <div className="mt-5 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-700">15 000 FCFA</span>
                  <span className="text-xs text-gray-500 ml-1">/ mois</span>
                </div>

                <div className="space-y-3 text-xs text-gray-700 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>TOUTES les fonctionnalités Pro Illimitées</span>
                  </div>
                  <div className="flex items-start space-x-2.5 font-bold text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-300">
                    <Video className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Lien Privé Vidéo de Démo & Masterclass : Guide complet pour utiliser le site à son plus haut niveau (Lien sécurisé transmis après paiement)</span>
                  </div>
                  <div className="flex items-center space-x-2.5 font-semibold text-gray-900">
                    <Headphones className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Support VIP Dédié WhatsApp 7j/7</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Accompagnement & Import de vos fichiers Excel</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Guide des raccourcis secrets pour encaisser en 3s</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Sauvegardes Cloud automatiques prioritaires</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full btn-magnetic py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all"
                >
                  Prendre l'Offre Ultra Pro (15 000 FCFA)
                </button>
              </div>
            </div>

          </div>

          <div className="mt-10 text-center text-xs text-gray-500 font-medium">
            💳 Paiement simple par <strong>Orange Money, Moov Money, Wave ou Espèces</strong> • Activation instantanée
          </div>

        </div>
      </section>

      {/* 6. Customer Reviews */}
      <section id="avis" className="py-16 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="flex items-center justify-center space-x-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#064E3B] font-sans">
              4.9 / 5 — Recommandé par plus de 1 450 Boutiques
            </h2>
            <p className="text-sm text-emerald-800/70 mt-2">
              Découvrez les retours de ceux qui ont révolutionné la gestion de leur boutique avec StockFlow Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm relative">
              <div className="flex items-center space-x-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                "Avant, mes clients prenaient des habits à crédit et j'oubliais de réclamer. Avec le bouton WhatsApp 1-clic de StockFlow Pro, j'ai récupéré plus de 450 000 FCFA d'arriérés en 2 semaines !"
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  FK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#064E3B]">Mme Fatoumata Kaboré</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold">Boutique Élégance Faso • Ouagadougou</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm relative">
              <div className="flex items-center space-x-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                "La clôture de caisse quotidienne est magique. Chaque soir, je vérifie en 2 minutes si l'argent de la caissière correspond au tiroir sans passer des heures à faire des calculs."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  IS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#064E3B]">Ibrahim Sawadogo</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold">Textiles & Boubous Dafra • Bobo-Dioulasso</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-emerald-200 shadow-sm relative">
              <div className="flex items-center space-x-1 text-amber-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic mb-4">
                "Le plan Ultra Pro à 15 000 FCFA avec les vidéos de démo m'a permis de former toute mon équipe en 1 journée. C'est le meilleur investissement pour ma boutique !"
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow">
                  FT
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#064E3B]">Mme Fatou Traoré</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold">Maison WAX Kente • Abidjan</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Final Banner CTA */}
      <section className="py-16 bg-[#064E3B] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-bold font-sans">
            Prêt à transformer la gestion de votre commerce ?
          </h2>
          <p className="text-sm text-emerald-200/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Rejoignez plus de 1 450 commerçants qui gagnent du temps et éliminent leurs impayés avec StockFlow Pro.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto btn-magnetic bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 text-gray-950 font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transition-all"
            >
              <span>Créer mon Compte en 30s</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-2xl text-sm border border-white/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>Tester la Démo Immédiate</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-200 py-8 text-center text-xs font-semibold text-emerald-800/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-[#064E3B]">StockFlow Pro</span>
            <span>• Faso Retail Tech</span>
          </div>
          <p>© 2026 StockFlow Pro. Conçu pour l'Afrique et la zone FCFA.</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <a href="tel:+22660557777" className="hover:underline">📞 +226 60 55 77 77</a>
            <a href="mailto:gansoreemeraude@gmail.com" className="hover:underline">✉️ Assistance</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
