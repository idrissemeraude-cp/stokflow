# 🌐 Guide d'Intégration des Services Externes & Cloud

Ce document vous guide pas à pas pour connecter votre application **StockFlow Pro** aux services tiers (Cloud, Mobile Money, WhatsApp API officielle) pour le passage en production multi-appareils à grande échelle.

---

## 1. ☁️ Base de Données Cloud & Multi-Appareils (Supabase / Firebase)

Actuellement, l'application fonctionne avec le stockage rapide local (`LocalStorage`), ce qui garantit une vitesse instantanée et un fonctionnement 100% hors-ligne. Pour synchroniser plusieurs smartphones ou tablettes en temps réel :

### Option Recommandée : Supabase (PostgreSQL Temps Réel)
1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte gratuit.
2. Créez un nouveau projet (ex: `stockflow-db`).
3. Dans **SQL Editor**, exécutez la création des tables :
   ```sql
   -- Table Produits
   create table products (
     id text primary key,
     name text not null,
     category text,
     sale_price numeric,
     purchase_price numeric,
     stock int,
     low_stock_threshold int,
     barcode text,
     variants jsonb,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Table Ventes
   create table sales (
     id text primary key,
     client_id text,
     client_name text,
     client_phone text,
     items jsonb,
     total_amount numeric,
     payment_type text,
     advance_paid numeric,
     remaining_due numeric,
     due_date date,
     status text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Table Dépenses
   create table expenses (
     id text primary key,
     title text not null,
     category text,
     amount numeric,
     payment_method text,
     date date,
     note text
   );
   ```
4. Récupérez vos clés dans **Project Settings > API** :
   - `Project URL`
   - `anon public key`
5. Installez le SDK Supabase (`npm install @supabase/supabase-js`) et créez le client `src/utils/supabaseClient.js`.

---

## 2. 📲 Passerelles de Paiement Mobile Money Directes (Orange Money, Moov, Wave)

Actuellement, l'application enregistre les encaissements Mobile Money et génère les reçus. Pour automatiser l'encaissement avec validation automatique par push USSD (demande de validation sur le téléphone du client) :

### A. Orange Money (Orange Developer / OM Web Payment)
* **Conditions requises** : Compte Marchand Orange Money (fournir RCCM, IFU, pièce d'identité au siège Orange).
* **Portail développeur** : Rendez-vous sur [developer.orange.com](https://developer.orange.com) et activez l'API **Orange Money Web Payment**.
* **Fonctionnement** : Votre application envoie le montant et le numéro du client, Orange envoie un push USSD pour que le client saisisse son code secret, puis notifie votre application via webhook.

### B. Wave Business (Wave API)
* **Conditions requises** : Compte Wave Business activé.
* **Portail développeur** : Accédez à [developer.wave.com](https://developer.wave.com) pour obtenir les clés API Checkout.
* **Fonctionnement** : Génération d'un QR code Wave dynamique affiché sur la caisse ou ouverture de l'application Wave.

---

## 3. 💬 WhatsApp : Gratuit direct (`wa.me`) vs API Cloud Officielle (Meta)

| Fonctionnalité | Protocole Actuel (`wa.me`) | API WhatsApp Cloud (Meta) |
| :--- | :--- | :--- |
| **Coût** | **100% Gratuit et Illimité** | Facturation par conversation (Meta) |
| **Configuration** | **Immédiate (Zéro compte requis)** | Compte Meta Business Manager + Vérification d'entreprise |
| **Expéditeur** | Votre numéro WhatsApp habituel | Numéro certifié avec badge vert possible |
| **Mode d'envoi** | Ouvre WhatsApp avec le message prêt en 1 clic | Envoi automatique robotisé en arrière-plan |

> 💡 **Recommandation** : Le protocole direct `wa.me` actuellement en place est la méthode préférée de 95% des commerçants car elle est **immédiate, gratuite, sans abonnement** et conserve la relation humaine de confiance avec le client.

---

## 4. 📴 Mode PWA Hors-Ligne (Progressive Web App)

Pour installer l'application comme une application native Android / iOS depuis le navigateur :
1. Un fichier `public/manifest.json` et des icônes d'application permettent l'option "Ajouter à l'écran d'accueil".
2. Le Service Worker met en cache les fichiers JS/CSS pour permettre l'ouverture même au fond du marché sans connexion 4G.
