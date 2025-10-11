import Joi from 'joi';

// Schéma de validation pour la création de document
export const validateDocument = (req, res, next) => {
  const schema = Joi.object({
    nomDoc: Joi.string().min(1).max(255).required(),
    matiere: Joi.string().min(1).max(100).required(),
    niveau: Joi.string().valid('Licence 1', 'Licence 2', 'Licence 3').required(),
    annee: Joi.string().pattern(/^\d{4}-\d{4}$/).required(), // Format: 2023-2024
    description: Joi.string().max(1000).optional(),
    filiereId: Joi.string().uuid().required() // Supposant que filiereId est un UUID
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};