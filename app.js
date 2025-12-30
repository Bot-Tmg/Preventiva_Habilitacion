// ======================================
// IMPORTS Y CONFIGURACIÓN BASE
// ======================================
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ======================================
// RUTAS
// ======================================
import talentoHumanoRoutes from './src/routes/talentoHumanoRoutes.js';
import capacidadTecnicaRoutes from './src/routes/capacidadTecnicaRoutes.js';
import dotacionEquiposRoutes from './src/routes/dotacionEquiposRoutes.js';
import infraestructuraRoutes from './src/routes/infraestructuraRoutes.js';
import historiaClinicaRoutes from './src/routes/historiaClinicaRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import evaluacionesRoutes from './src/routes/evaluacionesRoutes.js';
import protectedRoutes from './src/routes/protectedRoutes.js';

// ======================================
// SQLITE
// ======================================
import { initializeDB } from './src/config/sqlite.js';

// ======================================
// CONFIGURACIÓN ES MODULES
// ======================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================
// APP
// ======================================
const app = express();

// ======================================
// MIDDLEWARES GLOBALES
// ======================================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================
// ARCHIVOS ESTÁTICOS
// ======================================
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ======================================
// UPLOADS – INICIALIZACIÓN
// ======================================
const modulos = [
  'talento_humano',
  'capacidad_tecnica',
  'dotacion_equipos',
  'infraestructura',
  'historia_clinica'
];

const initializeUploads = () => {
  modulos.forEach(modulo => {
    const dir = path.join(__dirname, 'src/uploads', modulo);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Carpeta creada: ${dir}`);
    }
  });

  const generalDir = path.join(__dirname, 'src/uploads/general');
  if (!fs.existsSync(generalDir)) {
    fs.mkdirSync(generalDir, { recursive: true });
    console.log('📁 Carpeta general creada');
  }
};

// ======================================
// RUTAS API
// ======================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/talento-humano', talentoHumanoRoutes);
app.use('/api/capacidad-tecnica', capacidadTecnicaRoutes);
app.use('/api/dotacion-equipos', dotacionEquiposRoutes);
app.use('/api/infraestructura', infraestructuraRoutes);
app.use('/api/historia-clinica', historiaClinicaRoutes);

app.use('/api/evaluaciones', evaluacionesRoutes);
app.use('/api/protected', protectedRoutes);

// ======================================
// PÁGINAS HTML
// ======================================
const servePage = (page) => (req, res) => {
  const filePath = path.join(__dirname, 'frontend', `${page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: `Página ${page} no encontrada` });
  }
};

app.get('/', servePage('frontend-login'));
app.get('/login', servePage('frontend-login'));
app.get('/dashboard', servePage('dashboard'));
app.get('/talento-humano', servePage('talento-humano'));
app.get('/capacidad-tecnica', servePage('capacidad-tecnica'));
app.get('/dotacion-equipos', servePage('dotacion-equipos'));
app.get('/infraestructura', servePage('infraestructura'));
app.get('/historia-clinica', servePage('historia-clinica'));

// ======================================
// HEALTH CHECK
// ======================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ======================================
// MANEJO DE ERRORES
// ======================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// ======================================
// START SERVER (RENDER FRIENDLY)
// ======================================
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    await initializeDB();
    console.log('✅ Base de datos lista');

    initializeUploads();

    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE');
      console.log(`🌐 Puerto: ${PORT}`);
      console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
