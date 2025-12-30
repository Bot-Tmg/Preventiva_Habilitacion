import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();

// ======================================
// RUTAS PÚBLICAS DE USUARIOS
// ======================================

// Obtener todos los usuarios
router.get('/', UserController.getAllUsers);

// Obtener usuario específico por ID
router.get('/:id', UserController.getUserById);

// Actualizar información de usuario
router.put('/:id', UserController.updateUser);

// Cambiar contraseña
router.put('/:id/password', UserController.changePassword);

// Desactivar usuario
router.put('/:id/deactivate', UserController.deactivateUser);

export default router;
