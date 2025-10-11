import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import documentRoutes from './routes/documentRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les fichiers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/documents', documentRoutes);

// Middleware pour les routes non trouvées
app.use(notFoundHandler);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur EducMe démarré sur le port ${PORT}`);
});