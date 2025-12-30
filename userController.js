import { openDB } from '../config/sqlite.js';
import bcrypt from 'bcryptjs';

export class UserController {
  // ✅ Obtener todos los usuarios
  static async getAllUsers(req, res) {
    try {
      const db = await openDB();
      const users = await db.all(`
        SELECT id, email, user_type, full_name, phone, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        users,
        total: users.length
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  }

  // ✅ Obtener un usuario por ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const db = await openDB();
      const user = await db.get(`
        SELECT id, email, user_type, full_name, phone, created_at 
        FROM users 
        WHERE id = ?
      `, [id]);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ✅ Actualizar información de usuario
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { full_name, phone } = req.body;
      const db = await openDB();

      await db.run(`
        UPDATE users SET full_name = ?, phone = ? WHERE id = ?
      `, [full_name, phone, id]);

      res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ✅ Cambiar contraseña
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ success: false, message: 'Nueva contraseña requerida' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const db = await openDB();

      await db.run(`
        UPDATE users SET password_hash = ? WHERE id = ?
      `, [hashedPassword, id]);

      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  // ✅ Desactivar usuario
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      const db = await openDB();

      await db.run(`
        UPDATE users SET active = 0 WHERE id = ?
      `, [id]);

      res.json({ success: true, message: 'Usuario desactivado correctamente' });
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
