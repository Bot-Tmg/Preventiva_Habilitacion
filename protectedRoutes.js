import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Perfil de usuario',
    user: req.user
  });
});

router.get('/admin', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    message: 'Panel de administrador',
    user: req.user
  });
});

export default router;