# Studio — générateur de contenu IA

Outil interne pour générer des photos (et vidéos) via WaveSpeed, avec :
- **Nettoyage automatique des métadonnées** (EXIF/IPTC/XMP sur les photos, métadonnées de conteneur sur les vidéos) avant tout stockage
- **Détection de doublons visuels** (hash perceptuel) pour éviter de garder deux fois une image quasi-identique
- **Historique par persona**, avec recherche par prompt
- **Comptes équipe** (toi en admin, VA en accès génération/historique)

## 1. Ce qu'il te faut avant de commencer

- Un compte [Railway](https://railway.app) (hébergement — gratuit pour démarrer, puis quelques $/mois)
- Une clé API [WaveSpeed](https://wavespeed.ai) avec du crédit
- Un bucket [Cloudflare R2](https://developers.cloudflare.com/r2/) (stockage des fichiers, gratuit jusqu'à 10 Go/mois) — ou un autre stockage compatible S3 si tu préfères

## 2. Pourquoi Railway plutôt que Vercel

Vercel est pensé pour du serverless avec des requêtes courtes (10-60 secondes max). Générer plusieurs images à la suite peut prendre plusieurs minutes, et le stockage temporaire de fichiers ne fonctionne pas bien en serverless. Railway fait tourner l'app comme un vrai serveur qui reste allumé — plus adapté ici, et c'est aussi ce que tu utilises déjà pour ton bot Telegram.

## 3. Déploiement (environ 15-20 minutes)

1. Crée un nouveau projet sur Railway, connecte ce dossier (via GitHub — pousse ce code sur un repo, ou upload direct)
2. Ajoute le plugin **PostgreSQL** dans le même projet Railway (bouton "New" → "Database" → "PostgreSQL"). La variable `DATABASE_URL` sera injectée automatiquement.
3. Dans l'onglet **Variables** du service, ajoute toutes les variables listées dans `.env.example` (sauf `DATABASE_URL` qui vient de Postgres) :
   - `NEXTAUTH_SECRET` : génère une chaîne aléatoire, ex. avec `openssl rand -base64 32`
   - `NEXTAUTH_URL` : l'URL Railway de ton app (tu peux la mettre à jour après le premier déploiement)
   - `WAVESPEED_API_KEY`, `WAVESPEED_API_URL` (laisse la valeur par défaut sauf si WaveSpeed te dit autrement)
   - `WAVESPEED_MODEL` : le modèle WaveSpeed à utiliser (ex. `wavespeed-ai/flux-dev`) — regarde sur wavespeed.ai/models lequel donne le meilleur résultat pour Camille
   - `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_BASE_URL` : depuis ton bucket R2
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` : ton compte admin, créé automatiquement au premier lancement
4. Railway détecte `nixpacks.toml` et installe `ffmpeg` automatiquement (nécessaire pour nettoyer les métadonnées vidéo)
5. Une fois le déploiement lancé, va dans l'onglet **Deployments** → ouvre un shell (ou lance en local, voir plus bas) et exécute :
   ```
   npx prisma db push
   npx prisma db seed
   ```
   Ça crée les tables et ton compte admin.
6. Connecte-toi sur l'URL Railway avec l'email/mot de passe de `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, puis change ton mot de passe (à ajouter si besoin — pour l'instant, recrée un compte admin propre depuis la page Équipe si tu veux changer le mot de passe).

## 4. Ajouter des comptes VA

Une fois connecté en admin, va sur **Équipe** dans la nav, ajoute un nom/email/mot de passe temporaire pour chaque VA. Ils pourront générer et consulter l'historique, mais pas gérer les comptes (réservé au rôle Admin).

## 5. Tester en local avant de déployer

```bash
npm install
cp .env.example .env   # puis remplis les valeurs
npx prisma db push
npx prisma db seed
npm run dev
```

Ouvre http://localhost:3000

## 6. Notes importantes

- **Le modèle WaveSpeed est configurable** (`WAVESPEED_MODEL`). Le code envoie `prompt`, `size` et `seed` — si tu changes de modèle et qu'il attend d'autres paramètres, il faudra ajuster `src/lib/wavespeed.ts`.
- **La suppression des métadonnées est systématique** : toute image passe par un réencodage (`sharp`) qui ne recopie aucune métadonnée EXIF/GPS/logiciel, et toute vidéo passe par `ffmpeg -map_metadata -1`. Rien n'est stocké avant ce nettoyage.
- **La détection de doublons** compare chaque nouvelle image aux images déjà générées pour la même persona (hash perceptuel, tolérance ajustable dans `src/lib/dedup.ts` via `DUPLICATE_THRESHOLD`). Une image trop proche d'une existante est ignorée et non stockée.
- **Limite de sécurité** : 20 générations max par lot pour éviter de vider ton crédit WaveSpeed en un clic malheureux — modifiable dans `src/app/api/generate/route.ts`.
