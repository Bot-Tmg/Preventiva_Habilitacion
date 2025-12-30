import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta base centralizada (desde la raíz del proyecto)
export const UPLOADS_BASE_DIR = path.join(process.cwd(), 'uploads');

// Configuración de carpetas por módulo - USA LOS NOMBRES EXACTOS DE TUS CARPETAS
export const MODULES_CONFIG = {
    'capacidad-tecnica': 'capacidad_tecnica',
    'talento-humano': 'talento_humano', 
    'infrastructura': 'infraestructura',
    'dotacion-equipos': 'dotacion_equipos',
    'historia-clinica': 'historia_clinica',
    'general': 'general'
};

// Obtener ruta específica del módulo
export const getModuleUploadPath = (moduleName) => {
    const moduleFolder = MODULES_CONFIG[moduleName];
    if (!moduleFolder) {
        throw new Error(`Módulo no configurado: ${moduleName}`);
    }
    
    const modulePath = path.join(UPLOADS_BASE_DIR, moduleFolder);
    
    // Crear carpeta si no existe (por si acaso)
    if (!fs.existsSync(modulePath)) {
        fs.mkdirSync(modulePath, { recursive: true });
    }
    
    return modulePath;
};

// Verificar e imprimir las rutas (para debug)
console.log('📁 Ruta base de uploads:', UPLOADS_BASE_DIR);
console.log('✅ Carpetas configuradas:', MODULES_CONFIG);