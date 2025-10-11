import express from 'express';
import {
  getDocuments,
  getDocument,
  createNewDocument,
  deleteDocumentById,
  searchDocumentsHandler,
  uploadMiddleware
} from '../controllers/documentController.js';

const router = express.Router();

// GET /api/documents - Récupérer tous les documents (optionnellement filtrés par filière)
router.get('/', getDocuments);

// GET /api/documents/:id - Récupérer un document spécifique
router.get('/:id', getDocument);

// POST /api/documents - Créer un nouveau document
router.post('/', uploadMiddleware, createNewDocument);

// DELETE /api/documents/:id - Supprimer un document
router.delete('/:id', deleteDocumentById);

// GET /api/search - Rechercher des documents
router.get('/api/search', searchDocumentsHandler);

export default router;