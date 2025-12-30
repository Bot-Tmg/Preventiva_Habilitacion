import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Detectar el módulo desde la URL de la request - CORREGIDO
const getModuleFromRequest = (req) => {
    const url = req.originalUrl || req.url;
    
    if (url.includes('/api/capacidad-tecnica/')) return 'capacidad_tecnica';
    if (url.includes('/api/talento-humano/')) return 'talento_humano';
    if (url.includes('/api/infraestructura/')) return 'infraestructura'; // ✅ CORREGIDO
    if (url.includes('/api/dotacion-equipos/')) return 'dotacion_equipos';
    if (url.includes('/api/historia-clinica/')) return 'historia_clinica';
    
    return 'general';
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determinar el módulo basado en la URL
        const moduleName = getModuleFromRequest(req);
        const modulePath = path.join('uploads', moduleName);
        
        // Crear carpeta del módulo si no existe
        if (!fs.existsSync(modulePath)) {
            fs.mkdirSync(modulePath, { recursive: true });
        }
        
        cb(null, modulePath);
    },
    filename: function (req, file, cb) {
        // Nombre único para el archivo
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

export default upload;