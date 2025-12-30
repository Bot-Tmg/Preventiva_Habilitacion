import express from 'express';
import {
    crearCarpeta,
    obtenerCarpetas,
    subirArchivos,
    obtenerArchivos,
    verArchivo,
    eliminarArchivo,
    obtenerEstadisticas
} from '../controllers/capacidadTecnicaController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rutas de carpetas
router.post('/carpetas', crearCarpeta);
router.get('/carpetas', obtenerCarpetas);

// Rutas de archivos
router.post('/archivos/subir', upload.array('archivos', 10), subirArchivos);
router.get('/archivos', obtenerArchivos);
router.get('/archivos/:id/ver', verArchivo);
router.delete('/archivos/:id', eliminarArchivo);

// Rutas de estadísticas
router.get('/estadisticas', obtenerEstadisticas);

export default router;