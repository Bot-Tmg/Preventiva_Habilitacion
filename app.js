// ======================================
// CONFIGURACIÓN PRINCIPAL Y DEPENDENCIAS  
// ======================================
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ======================================
// IMPORTAR RUTAS DE TODOS LOS MÓDULOS
// ======================================
import talentoHumanoRoutes from './src/routes/talentoHumanoRoutes.js';
import capacidadTecnicaRoutes from './src/routes/capacidadTecnicaRoutes.js';
import dotacionEquiposRoutes from './src/routes/dotacionEquiposRoutes.js';
import infraestructuraRoutes from './src/routes/infrastructuraRoutes.js'; // Mantener nombre archivo pero variable corregida
import historiaClinicaRoutes from './src/routes/historiaClinicaRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import evaluacionesRoutes from './src/routes/evaluacionesRoutes.js';
import protectedRoutes from './src/routes/protectedRoutes.js';

// ======================================
// CONFIGURACIÓN ES MODULES
// ======================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ======================================
// VERIFICAR CARPETAS UPLOADS AL INICIO
// ======================================
const modulos = ['talento_humano', 'capacidad_tecnica', 'dotacion_equipos', 'infraestructura', 'historia_clinica'];

const initializeUploads = () => {
    modulos.forEach(modulo => {
        const moduloDir = `src/uploads/${modulo}/`;
        if (!fs.existsSync(moduloDir)) {
            fs.mkdirSync(moduloDir, { recursive: true });
            console.log(`📁 Carpeta de ${modulo} creada`);
        }
    });
    
    // Carpeta general si no existe
    const generalDir = 'src/uploads/general/';
    if (!fs.existsSync(generalDir)) {
        fs.mkdirSync(generalDir, { recursive: true });
        console.log('📁 Carpeta general creada');
    }
};

// ======================================
// INICIALIZAR BASE DE DATOS SQLITE
// ======================================
import { initializeDB } from './src/config/sqlite.js';

// ======================================
// RUTAS DE AUTENTICACIÓN Y USUARIOS
// ======================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ======================================
// RUTAS DE MÓDULOS PRINCIPALES
// ======================================
app.use('/api/talento-humano', talentoHumanoRoutes);
app.use('/api/capacidad-tecnica', capacidadTecnicaRoutes);
app.use('/api/dotacion-equipos', dotacionEquiposRoutes);
app.use('/api/infraestructura', infraestructuraRoutes); // ✅ RUTA CORREGIDA
app.use('/api/historia-clinica', historiaClinicaRoutes);

// ======================================
// RUTAS DE EVALUACIONES Y PROTEGIDAS
// ======================================
app.use('/api/evaluaciones', evaluacionesRoutes);
app.use('/api/protected', protectedRoutes);

// ======================================
// RUTAS PARA SERVIR PÁGINAS HTML
// ======================================
const servePage = (pageName) => (req, res) => {
    const filePath = path.join(__dirname, '../../frontend', `${pageName}.html`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: `Página ${pageName} no encontrada` });
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
// RUTAS AUXILIARES Y HEALTH CHECK
// ======================================
app.get('/api/health', (req, res) => {
    const modulosStatus = {};
    
    modulos.forEach(modulo => {
        const moduloDir = `src/uploads/${modulo}/`;
        modulosStatus[modulo] = {
            exists: fs.existsSync(moduloDir),
            path: moduloDir
        };
    });
    
    // Verificar si existe la base de datos SQLite
    const dbExists = fs.existsSync(path.join(__dirname, '../database.sqlite'));
    
    res.status(200).json({
        success: true,
        message: '✅ Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: {
            type: 'SQLite',
            status: dbExists ? 'Conectada' : 'No encontrada',
            file: dbExists ? 'database.sqlite' : null
        },
        modules: modulos.length,
        modulesStatus: modulosStatus,
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            modules: modulos.map(m => `/api/${m.replace('_', '-')}`),
            evaluations: '/api/evaluaciones',
            protected: '/api/protected'
        }
    });
});

app.get('/api/modules', (req, res) => {
    res.json({
        success: true,
        modules: modulos.map(modulo => ({
            name: modulo,
            displayName: modulo.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            route: `/${modulo.replace('_', '-')}`,
            apiRoute: `/api/${modulo.replace('_', '-')}`,
            description: `Gestión de documentos de ${modulo.replace('_', ' ')}`
        }))
    });
});

// ======================================
// MANEJO DE ERRORES GLOBAL
// ======================================
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err);
    res.status(500).json({
        success: false,
        message: '❌ Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Ruta no encontrada',
        path: req.originalUrl,
        availableRoutes: [
            '/login', '/dashboard', '/talento-humano', '/capacidad-tecnica',
            '/dotacion-equipos', '/infraestructura', '/historia-clinica',
            '/api/health', '/api/modules'
        ]
    });
});

// ======================================
// INICIALIZACIÓN DEL SERVIDOR
// ======================================
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Inicializar base de datos SQLite
        console.log('🔄 Inicializando base de datos SQLite...');
        await initializeDB();
        console.log('✅ Base de datos SQLite lista');
        
        // Inicializar carpetas de uploads
        initializeUploads();
        
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(70));
            console.log('🚀 SERVIDOR DE PLATAFORMA DE HABILITACIÓN - CORREGIDO ✅');
            console.log('='.repeat(70));
            console.log(`📍 Puerto: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`⚡ Entorno: ${process.env.NODE_ENV || 'development'}`);
            
            console.log('\n📋 PÁGINAS DISPONIBLES:');
            console.log(`   🔐 Login:        http://localhost:${PORT}/login`);
            console.log(`   📊 Dashboard:    http://localhost:${PORT}/dashboard`);
            console.log(`   👥 Talento Humano: http://localhost:${PORT}/talento-humano`);
            console.log(`   ⚙️  Capacidad Téc: http://localhost:${PORT}/capacidad-tecnica`);
            console.log(`   💻 Dotación Equip: http://localhost:${PORT}/dotacion-equipos`);
            console.log(`   🏢 Infraestructura: http://localhost:${PORT}/infraestructura`);
            console.log(`   🏥 Historia Clín: http://localhost:${PORT}/historia-clinica`);
            
            console.log('\n🔧 ENDPOINTS API:');
            console.log(`   ❤️  Health:       http://localhost:${PORT}/api/health`);
            console.log(`   📦 Módulos:      http://localhost:${PORT}/api/modules`);
            console.log(`   🔐 Auth:         http://localhost:${PORT}/api/auth`);
            console.log(`   👥 Users:        http://localhost:${PORT}/api/users`);
            
            modulos.forEach(modulo => {
                const route = modulo.replace('_', '-');
                console.log(`   📁 ${modulo.padEnd(18)} http://localhost:${PORT}/api/${route}/archivos`);
            });
            
            console.log('\n💡 INFORMACIÓN:');
            console.log(`   📁 Uploads:      ${path.join(__dirname, 'src/uploads')}`);
            console.log(`   🗂️  Módulos:      ${modulos.length} configurados`);
            console.log(`   💾 Base de datos: SQLite (database.sqlite)`);
            console.log('='.repeat(70));
            console.log('✅ Servidor inicializado correctamente\n');
        });
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
};

// Iniciar servidor
startServer();

export default app;