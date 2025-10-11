import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import '../config/cloudinary.js';
import { getAllDocuments, getDocumentById, createDocument, deleteDocument, searchDocuments } from '../models/document.js';

// Configuration multer pour la mémoire (pas de stockage local)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les images et PDFs sont autorisés'), false);
    }
  }
}).array('files', 3); // Max 3 fichiers

// Fonction utilitaire pour uploader vers Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'educme-documents',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

// Obtenir tous les documents, optionnellement filtrés par filière
export const getDocuments = async (req, res, next) => {
  try {
    // Accept either filiere or filiereId as query parameter
    const filiereId = req.query.filiere || req.query.filiereId || null;
    const documents = await getAllDocuments(filiereId);
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// Obtenir un document par ID
export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await getDocumentById(id);
    res.json(document);
  } catch (error) {
    next(error);
  }
};

// Créer un nouveau document
export const createNewDocument = async (req, res, next) => {
  try {
    console.log('Creating document, req.body:', req.body);
    const { nomDoc, matiere, niveau, annee, description, filiereId } = req.body;
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files || files.length === 0) {
      // Si aucun fichier envoyé, renvoyer une erreur 400 lisible
      return res.status(400).json({ error: 'Au moins un fichier (image ou PDF) est requis' });
    }

    console.log('Files to upload:', files.length);
    // Uploader les fichiers vers Cloudinary
    const uploadedFiles = [];
    for (const file of files) {
      console.log('Uploading file:', file.originalname || file.fieldname);
      try {
        const result = await uploadToCloudinary(file);
        console.log('Upload result:', result);
        uploadedFiles.push({
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype && file.mimetype.startsWith('image/') ? 'image' : 'pdf'
        });
      } catch (uploadErr) {
        console.error('Error uploading a file to Cloudinary:', uploadErr);
        // Tentative de cleanup des fichiers déjà uploadés
        for (const uf of uploadedFiles) {
          try {
            await cloudinary.uploader.destroy(uf.publicId);
          } catch (cleanupErr) {
            console.error('Cleanup error for publicId', uf.publicId, cleanupErr);
          }
        }
        // Fournir un code lisible pour le middleware d'erreur
        uploadErr.http_code = uploadErr.http_code || 502;
        return next(uploadErr);
      }
    }

    console.log('Uploaded files:', uploadedFiles);

    // Créer le document dans Supabase
    const documentData = {
      nomdoc: nomDoc,
      matiere,
      niveau,
      annee,
      description,
      fichiers: uploadedFiles,
      filiereid: filiereId,
      datepublication: new Date().toISOString()
    };

    console.log('Inserting documentData:', documentData);
    const newDocument = await createDocument(documentData);
    console.log('Inserted document:', newDocument);
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
};

// Supprimer un document
export const deleteDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Récupérer le document pour obtenir les publicIds
    const document = await getDocumentById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Supprimer les fichiers de Cloudinary si présents
    if (Array.isArray(document.fichiers) && document.fichiers.length > 0) {
      for (const file of document.fichiers) {
        const publicId = file.publicId || file.public_id || file.publicid;
        if (!publicId) {
          console.warn('No publicId found for file, skipping:', file);
          continue;
        }
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          // Log l'erreur mais ne bloque pas la suppression du document
          console.error('Erreur lors de la suppression sur Cloudinary pour', publicId, cloudErr);
        }
      }
    }

    // Supprimer de Supabase
    await deleteDocument(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Rechercher des documents
export const searchDocumentsHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }
    const documents = await searchDocuments(q);
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// Middleware pour l'upload
export const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Fichier trop volumineux (max 100MB)' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Maximum 3 fichiers autorisés' });
      }
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};