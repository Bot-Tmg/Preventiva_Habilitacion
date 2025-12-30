import express from 'express';
import { AuthController } from '../controllers/authController.js';

const router = express.Router();

// Ruta de registro
router.post('/register', AuthController.register);

// Ruta de login
router.post('/login', AuthController.login);

// Ruta para verificar token (opcional)
router.get('/verify', (req, res) => {
  res.json({ message: 'Sistema de autenticación funcionando' });
});

export default router;