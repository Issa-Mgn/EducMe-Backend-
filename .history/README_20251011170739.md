# EducMe Backend

Backend API pour l'application EducMe, permettant la gestion de documents éducatifs avec upload de fichiers vers Cloudinary et stockage des métadonnées dans Supabase.

## Fonctionnalités

- Gestion des filières éducatives
- Upload et gestion de documents (images et PDFs)
- Stockage sécurisé des fichiers sur Cloudinary
- Base de données PostgreSQL via Supabase
- Recherche de documents
- API RESTful avec validation des données

## Technologies utilisées

- **Node.js** avec **Express.js** pour le serveur
- **Supabase** pour la base de données
- **Cloudinary** pour le stockage des fichiers
- **Multer** pour l'upload de fichiers
- **Joi** pour la validation des données
- **CORS** pour les requêtes cross-origin

## Installation

1. Clonez le repository :
   ```bash
   git clone <url-du-repo>
   cd educme-backend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine avec les variables suivantes :
   ```
   SUPABASE_URL=votre-url-supabase
   SUPABASE_ANON_KEY=votre-cle-anonyme-supabase
   CLOUDINARY_CLOUD_NAME=votre-nom-cloud-cloudinary
   CLOUDINARY_API_KEY=votre-api-key-cloudinary
   CLOUDINARY_API_SECRET=votre-api-secret-cloudinary
   PORT=3000
   NODE_ENV=development
   ```

4. Configurez la base de données en exécutant le script `create_tables.sql` dans Supabase.

5. Démarrez le serveur :
   ```bash
   npm start
   ```

Le serveur sera accessible sur `http://localhost:3000`.

## API Endpoints

### Filières

- `GET /api/filieres` - Récupérer toutes les filières
- `GET /api/filieres/:id` - Récupérer une filière par ID

### Documents

- `GET /api/documents` - Récupérer tous les documents (optionnellement filtrés par filière avec `?filiere=<id>`)
- `GET /api/documents/:id` - Récupérer un document par ID
- `POST /api/documents` - Créer un nouveau document (avec upload de fichiers)
- `DELETE /api/documents/:id` - Supprimer un document
- `GET /api/search?q=<terme>` - Rechercher des documents

### Création de document

Pour créer un document, utilisez une requête POST multipart/form-data avec :
- `files` : Fichiers à uploader (max 3, max 100MB chacun, images ou PDFs)
- `nomDoc` : Nom du document
- `matiere` : Matière
- `niveau` : Niveau (Licence 1, Licence 2, Licence 3)
- `annee` : Année (format YYYY-YYYY)
- `description` : Description optionnelle
- `filiereId` : ID de la filière (UUID)

## Structure du projet

```
educme-backend/
├── config/
│   ├── cloudinary.js      # Configuration Cloudinary
│   └── supabase.js        # Configuration Supabase
├── controllers/
│   └── documentController.js  # Logique métier pour les documents
├── middleware/
│   ├── errorHandler.js    # Gestion globale des erreurs
│   └── validation.js      # Validation des données
├── models/
│   ├── document.js        # Modèles pour les documents
│   └── filiere.js         # Modèles pour les filières
├── routes/
│   ├── documentRoutes.js  # Routes pour les documents
│   └── filiereRoutes.js   # Routes pour les filières
├── .env                   # Variables d'environnement (ignoré par git)
├── .gitignore             # Fichiers à ignorer
├── create_tables.sql      # Script de création des tables
├── index.js               # Point d'entrée de l'application
├── package.json           # Dépendances et scripts
└── README.md              # Ce fichier
```

## Déploiement

Le backend peut être déployé sur des plateformes comme Render, Heroku, ou Vercel.

### Sur Render

1. Connectez votre repository GitHub.
2. Définissez les variables d'environnement dans les settings.
3. Le build command : `npm install`
4. Le start command : `npm start`

## Scripts disponibles

- `npm start` : Démarre le serveur en production
- `npm run dev` : Démarre le serveur en mode développement (si nodemon est installé)

## Sécurité

- Validation stricte des données d'entrée
- Upload sécurisé vers Cloudinary avec signature
- Gestion des erreurs sans exposition des détails sensibles
- CORS configuré pour les origines autorisées

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT.