import express from 'express';
import { getAllFilieres, getFiliereById } from '../models/filiere.js';

const router = express.Router();

// GET /api/filieres - Récupérer toutes les filières
router.get('/', async (req, res, next) => {
  try {
    const filieres = await getAllFilieres();
    res.json(filieres);
  } catch (error) {
    next(error);
  }
});

// GET /api/filieres/:id - Récupérer une filière spécifique
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filiere = await getFiliereById(id);
    res.json(filiere);
  } catch (error) {
    next(error);
  }
});

export default router;