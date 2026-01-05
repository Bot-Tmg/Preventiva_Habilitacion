// ======================================
// IMPORTS (ES MODULES)
// ======================================
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ======================================
// RUTAS
// ======================================
import talentoHumanoRoutes from './routes/talentoHumanoRoutes.js';
import capacidadTecnicaRoutes from './routes/capacidadTecnicaRoutes.js';
import dotacionEquiposRoutes from './routes/dotacionEquiposRoutes.js';
import infraestructuraRoutes from './routes/infraestructuraRoutes.js';
import historiaClinicaRoutes from './routes/historiaClinicaRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import evaluacionesRoutes from './routes/evaluacionesRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';

// ======================================
// SQLITE
// ======================================
import { initializeDB } from './config/sqlite.js';

// ======================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================================
// MIDDLEWARES
// ======================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================
// FRONTEND (HTML EN RAÍZ)
// ======================================
app.use(express.static(path.join(__dirname, '..')));

// ======================================
// UPLOADS
// ======================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================================
const modulos = [
  'talento_humano',
  'capacidad_tecnica',
  'dotacion_equipos',
  'infraestructura',
  'historia_clinica'
];

const initializeUploads = () => {
  modulos.forEach(m => {
    const dir = path.join(__dirname, 'uploads', m);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};

// ======================================
// ROOT
// ======================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend-login.html'));
});

// ======================================
// API
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
app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

// ======================================
const PORT = process.env.PORT || 3000;

const start = async () => {
  await initializeDB();
  initializeUploads();
  app.listen(PORT, () =>
    console.log(`🚀 Backend corriendo en puerto ${PORT}`)
  );
};

start();

export default app;

