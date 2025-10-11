// Middleware de gestion d'erreurs global
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Erreurs de Supabase
  if (err.code && err.details) {
    return res.status(400).json({
      error: 'Erreur de base de données',
      details: err.message
    });
  }

  // Erreurs de Cloudinary
  if (err.http_code) {
    return res.status(err.http_code).json({
      error: 'Erreur de stockage de fichiers',
      details: err.message
    });
  }

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données invalides',
      details: err.details[0].message
    });
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
};