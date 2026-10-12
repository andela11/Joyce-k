# Guide de Déploiement : Backend sur Render & Frontend sur Vercel

Ce guide vous accompagne pas à pas pour héberger **Joyce-K** avec une architecture découplée :
- **Backend (API Node.js / Express / IA Gemini)** sur **Render**
- **Frontend (Interface React Vite / Tailwind / Firebase Client)** sur **Vercel**

---

## 1. Déploiement du Backend sur Render

Render héberge le serveur Express (`server.ts`) qui gère les points de terminaison d'authentification, les appels à l'API Gemini, et la vérification d'authenticité anti-IA des photos et vidéos.

### Étapes sur Render :

1. Rendez-vous sur [dashboard.render.com](https://dashboard.render.com/) et connectez-vous (via GitHub ou GitLab).
2. Cliquez sur **New +** > **Web Service**.
3. Sélectionnez le dépôt Git de votre projet Joyce-K.
4. Remplissez les champs de configuration :
   - **Name** : `joyce-k-backend` (ou le nom de votre choix)
   - **Region** : Choisissez la plus proche (ex: `Frankfurt` ou `Oregon`)
   - **Branch** : `main`
   - **Runtime** : `Node`
   - **Build Command** :
     ```bash
     npm install && npm run build:server
     ```
   - **Start Command** :
     ```bash
     npm run start:server
     ```
   - **Plan** : `Free` (ou payant selon vos besoins)
5. Dans la section **Advanced** > **Health Check Path** :
   - Indiquez : `/api/health`
6. Dans la section **Environment Variables** (Variables d'environnement), ajoutez :
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *Votre clé API Google Gemini*
   - `FRONTEND_URL` = `https://votre-projet.vercel.app` *(l'URL de votre application sur Vercel, à mettre à jour une fois Vercel déployé)*
7. Cliquez sur **Deploy Web Service**.
8. Une fois déployé, Render vous attribue une URL publique (ex: `https://joyce-k-backend.onrender.com`).
   - Vous pouvez tester la santé du serveur en ouvrant : `https://joyce-k-backend.onrender.com/api/health` (doit renvoyer `{"status":"ok", ...}`).

---

## 2. Déploiement du Frontend sur Vercel

Vercel héberge l'interface utilisateur statique haute performance React Vite.

### Étapes sur Vercel :

1. Rendez-vous sur [vercel.com](https://vercel.com/) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **Add New...** > **Project**.
3. Importez le dépôt Git de votre projet Joyce-K.
4. Vercel détecte automatiquement le framework **Vite** grâce au fichier `vercel.json` inclus à la racine du projet.
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build:client` (ou `vite build`)
   - **Output Directory** : `dist`
5. Dans la section **Environment Variables**, ajoutez :
   - `VITE_API_URL` = `https://joyce-k-backend.onrender.com` *(l'URL de votre backend Render obtenu à l'étape 1 sans slash final)*
   - Vos clés Firebase Client :
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_FIRESTORE_DATABASE_ID`
6. Cliquez sur **Deploy**.
7. Vercel construit et déploie le frontend (ex: `https://joyce-k.vercel.app`).

---

## 3. Finalisation de la liaison (CORS & Sécurité)

1. Retournez sur le tableau de bord **Render** de votre Web Service `joyce-k-backend`.
2. Allez dans **Environment**.
3. Mettez à jour la variable `FRONTEND_URL` avec l'URL exacte attribuée par Vercel (ex: `https://joyce-k.vercel.app`).
4. Cliquez sur **Save Changes** (Render redémarre automatiquement avec la nouvelle configuration CORS).

---

## 4. Fonctionnalités incluses dans cette configuration

- **Gestion automatique du CORS** : Le backend accepte les domaines `*.vercel.app` et votre nom de domaine personnalisé configuré dans `FRONTEND_URL`.
- **Port dynamique Render** : `PORT` s'adapte automatiquement à l'environnement Render (`process.env.PORT`).
- **Module Client `src/utils/api.ts`** :
  - Si `VITE_API_URL` est défini (en prod sur Vercel) -> les requêtes partent directement vers Render.
  - Si `VITE_API_URL` est vide (en local ou AI Studio) -> les requêtes restent relatives (`/api/...`) et utilisent le serveur local sans aucune modification requise.
- **Support SPA Vercel (`vercel.json`)** : Les rafraîchissements de page et les routes client fonctionnent sans erreur 404.
- **Fichier `render.yaml`** : Permet aussi de déployer le backend sur Render en 1 clic via Render Blueprint.
