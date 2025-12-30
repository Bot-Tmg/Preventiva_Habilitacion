import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', upload.single('documento'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  console.log('Archivo subido:', req.file);
  res.json({ 
    message: 'Archivo subido exitosamente',
    file: req.file 
  });
});

export default router;