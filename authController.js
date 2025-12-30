import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { email, password, user_type, role, full_name, phone } = req.body;

      // Validar campos requeridos
      if (!email || !password || !full_name) {
        return res.status(400).json({ 
          success: false,  // ← AGREGAR
          error: 'Email, contraseña y nombre son requeridos' 
        });
      }

      // Usar role si user_type no viene (compatibilidad frontend)
      const finalUserType = user_type || role || 'usuario';

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,  // ← AGREGAR
          error: 'El usuario ya existe' 
        });
      }

      // Hashear password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const user = await User.create({
        email,
        password_hash,
        user_type: finalUserType,  // ← Usar el tipo correcto
        full_name,
        phone: phone || null
      });

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          userType: user.user_type 
        },
        process.env.JWT_SECRET || 'default-secret-key',
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
        }
      );

      res.json({
    success: true,
    message: 'Login exitoso',
    user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        full_name: user.full_name
        
    },
    token
});
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos de base de datos
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false,  // ← AGREGAR
          error: 'El email ya está registrado' 
        });
      }
      
      res.status(500).json({ 
        success: false,  // ← AGREGAR
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar campos
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,  // ← AGREGAR
          error: 'Email y contraseña son requeridos' 
        });
      }

      // Buscar usuario en BASE DE DATOS
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false,  // ← AGREGAR
          error: 'Credenciales inválidas' 
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,  // ← AGREGAR
          error: 'Credenciales inválidas' 
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          userType: user.user_type 
        },
        process.env.JWT_SECRET || 'default-secret-key',
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
        }
      );

      res.json({
        success: true,  // ← AGREGAR
        message: 'Login exitoso',
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          full_name: user.full_name,
          tipo_perfil: user.tipo_perfil
        },
        token
      });

    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar errores de conexión a BD
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          success: false,  // ← AGREGAR
          error: 'Error de conexión con la base de datos' 
        });
      }
      
      res.status(500).json({ 
        success: false,  // ← AGREGAR
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Método para verificar token
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false,  // ← AGREGAR
          error: 'Token no proporcionado' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          success: false,  // ← AGREGAR
          error: 'Usuario no encontrado' 
        });
      }

      res.json({
        success: true,  // ← AGREGAR
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          full_name: user.full_name,
          tipo_perfil: user.tipo_perfil
        }
      });

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(401).json({ 
        success: false,  // ← AGREGAR
        error: 'Token inválido o expirado' 
      });
    }
  }
}