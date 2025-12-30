import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    evaluateCapacidadTecnico,
    evaluateDotacionEquipos,
    evaluateHistoriaClinica,
    evaluateInfrastructura,
    evaluateTalentoHumano
} from '../controllers/evaluacionController.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de evaluación para cada componente
router.put('/capacidad-tecnico/:id', evaluateCapacidadTecnico);
router.put('/dotacion-equipos/:id', evaluateDotacionEquipos);
router.put('/historia-clinica/:id', evaluateHistoriaClinica);
router.put('/infrastructura-fisica/:id', evaluateInfrastructura);
router.put('/talento-humano/:id', evaluateTalentoHumano);

export default router;