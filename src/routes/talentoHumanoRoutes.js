import express from 'express';
const router = express.Router();

// Ruta de ejemplo para verificar que el router carga correctamente
router.get('/', (req, res) => {
  res.json({ message: 'Rutas talento humano funcionando' });
});

// Exporta el router como default (ESM)
export default router;
