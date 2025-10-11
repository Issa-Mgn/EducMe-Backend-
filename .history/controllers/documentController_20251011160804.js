import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';
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
    const timestamp = Math.round(Date.now() / 1000);
    const stringToSign = `api_key=${process.env.CLOUDINARY_API_KEY}&folder=educme-documents&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(stringToSign + process.env.CLOUDINARY_API_SECRET).digest('hex');

    const stream = cloudinary.uploader.upload_stream(
      {
        api_key: process.env.CLOUDINARY_API_KEY,
        folder: 'educme-documents',
        timestamp,
        signature,
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
    const { filiere } = req.query;
    const documents = await getAllDocuments(filiere);
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
    console.log('Creating document, req.body:', req.body, 'files:', req.files);
    const { nomDoc, matiere, niveau, annee, description, filiereId } = req.body;
    const files = req.files;

    console.log('Files to upload:', files.length);
    // Uploader les fichiers vers Cloudinary
    const uploadedFiles = [];
    for (const file of files) {
      console.log('Uploading file:', file.originalname);
      const result = await uploadToCloudinary(file);
      console.log('Upload result:', result);
      uploadedFiles.push({
        url: result.secure_url,
        publicId: result.public_id,
        type: file.mimetype.startsWith('image/') ? 'image' : 'pdf'
      });
    }
    console.log('Uploaded files:', uploadedFiles);

    // Créer le document dans Supabase
    const documentData = {
      nomDoc,
      matiere,
      niveau,
      annee,
      description,
      fichiers: uploadedFiles,
      filiereid: filiereId,
      datePublication: new Date().toISOString()
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

    // Supprimer les fichiers de Cloudinary
    for (const file of document.fichiers) {
      await cloudinary.uploader.destroy(file.publicId);
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