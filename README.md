# 🛍️ StockFlow Pro (FasoMode)
> **Solution de Caisse POS, Gestion de Stock & Relances WhatsApp Intelligentes — Conçue pour le Commerce Moderne en Afrique de l'Ouest (FCFA).**

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Points Forts du Projet

- ⚡ **Architecture Hybride Offline-First** : Fonctionne à 100% hors-ligne dans la boutique/marché sans internet avec mise en cache locale instantanée et synchronisation automatique vers Supabase dès le retour du réseau.
- 🧾 **Caisse POS & Vente au Comptant / Crédit** : Encaissement ultra-rapide, gestion des acomptes, calcul automatique des reliquats et génération de tickets de caisse thermiques imprimables.
- 💬 **Relances Clients Intelligentes WhatsApp (wa.me & IA)** : Suivi des créances en retard (J-2, Jour J, J+3) avec génération automatique de messages personnalisés en français et dioula/mooré envoyés en 1 clic.
- 📦 **Gestion de Stock en Temps Réel** : Suivi des variantes (tailles, couleurs), alertes automatiques de stock bas et rupture, valorisation financière du stock (achat vs vente).
- 📊 **Clôture de Caisse & Dépenses** : Contrôle quotidien des encaissements (Espèces, Orange Money, Moov Money, Wave), saisie des dépenses et calcul des écarts de caisse.
- 🗄️ **Base de Données PostgreSQL & Multi-Caisses** : Synchronisation multi-appareils en direct via WebSockets Supabase Realtime.
- 📱 **Scanner Code-barres & Import/Export Excel CSV** : Importation massive de catalogue et exportation des rapports comptables en format CSV universel.
- 🔒 **Gestion Multi-Rôles Sécurisée** : Rôles **Gérant (Admin)** et **Caissier** avec protection par code PIN à 4 chiffres.

---

## 🚀 Structure du Projet

```
├── public/
│   ├── schema.sql              # Schéma complet PostgreSQL (8 tables + RLS + Realtime)
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AnalyticsModule.jsx       # Statistiques, graphiques et métriques
│   │   ├── AuthModal.jsx             # Modal d'authentification
│   │   ├── BarcodeScannerModal.jsx   # Scanner de codes-barres par caméra
│   │   ├── CashClosingModule.jsx     # Clôture et réconciliation de caisse
│   │   ├── ClientModule.jsx          # Répertoire clients & historique créances
│   │   ├── CreditModal.jsx           # Enregistrement des règlements de crédit
│   │   ├── CsvImportExportModal.jsx  # Import/Export Excel CSV
│   │   ├── DashboardModule.jsx       # Tableau de bord principal
│   │   ├── DatabaseSettingsModal.jsx # Gestion Supabase & synchronisation Cloud
│   │   ├── ExpensesModule.jsx        # Suivi des dépenses d'exploitation
│   │   ├── Header.jsx                # En-tête avec indicateur de synchro Cloud
│   │   ├── LandingPage.jsx           # Page d'accueil et présentation vitrine
│   │   ├── Navigation.jsx            # Menu latéral réactif
│   │   ├── PosModule.jsx             # Module de Caisse enregistreuse POS
│   │   ├── ReceiptModal.jsx          # Impression ticket thermique & facture
│   │   ├── RoleSwitcherModal.jsx     # Switch Caissier / Gérant avec PIN
│   │   ├── StockModule.jsx           # Gestion du catalogue et stock
│   │   ├── SupportModal.jsx          # Assistance et support client
│   │   └── WhatsappRelanceModule.jsx # Assistant de relance WhatsApp
│   ├── data/
│   │   └── initialData.js            # Données de démonstration prêtes à l'emploi
│   ├── services/
│   │   ├── dbService.js              # Couche CRUD & Mappers PostgreSQL
│   │   ├── schema.sql                # Schéma SQL pour Supabase
│   │   ├── supabaseClient.js         # Client Supabase dynamique
│   │   └── syncEngine.js             # Moteur de synchronisation hors-ligne
│   ├── utils/
│   │   ├── storage.js                # Stockage LocalStorage & formatteurs FCFA
│   │   └── whatsappAi.js             # Moteur de génération de relances
│   ├── App.jsx                       # Composant racine
│   ├── main.jsx                      # Point d'entrée React
│   └── index.css                     # Styles Tailwind & utilitaires
├── GUIDE_SERVICES_EXTERNES.md        # Guide Supabase, Mobile Money & WhatsApp API
├── package.json
└── vite.config.js
```

---

## 🛠️ Installation & Démarrage Local

### Prérequis
- [Node.js](https://nodejs.org) (v18 ou supérieur recommandé)
- [npm](https://www.npmjs.com)

### 1. Cloner le dépôt
```bash
git clone https://github.com/votre-nom-utilisateur/stockflow-pro.git
cd stockflow-pro
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

### 4. Compiler pour la production
```bash
npm run build
```

---

## ☁️ Connexion à la Base de Données Supabase (Optionnel)

1. Créez un projet gratuit sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, collez et exécutez le script fourni dans [public/schema.sql](public/schema.sql).
3. Cliquez sur le bouton **"Base de Données"** dans l'en-tête de l'application et entrez votre **URL de projet** et votre **clé Anon (public)**.
4. Cliquez sur **"Transférer les Données Locales au Cloud"** pour synchroniser votre stock immédiatement !

---

## 📄 Licence

Distribué sous licence **MIT**. Voir `LICENSE` pour plus d'informations.
