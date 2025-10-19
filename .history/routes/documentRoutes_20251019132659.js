import express from 'express';
import {
  getDocuments,
  getDocument,
  createNewDocument,
  deleteDocumentById,
  searchDocumentsHandler,
  uploadMiddleware,
  downloadDocumentFile // Ajout de l'import
} from '../controllers/documentController.js';
import { validateDocument } from '../middleware/validation.js';

const router = express.Router();

// GET /api/documents - Récupérer tous les documents (optionnellement filtrés par filière)
router.get('/', getDocuments);

// GET /api/documents/:id - Récupérer un document spécifique
router.get('/:id', getDocument);

// Nouvelle route : Télécharger/rediriger vers le PDF Cloudinary d'un document
// GET /api/documents/:id/download/:fileId
router.get('/:id/download/:fileId', downloadDocumentFile);

// POST /api/documents - Créer un nouveau document
router.post('/', uploadMiddleware, validateDocument, createNewDocument);

// DELETE /api/documents/:id - Supprimer un document
router.delete('/:id', deleteDocumentById);

// GET /api/search - Rechercher des documents
router.get('/search', searchDocumentsHandler);

export default router;