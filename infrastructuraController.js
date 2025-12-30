import { Infraestructura } from '../models/Infraestructura.js';// Nota: nombre actual
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== CARPETAS ==================

export const crearCarpeta = async (req, res) => {
    try {
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({
                success: false,
                error: 'El nombre de la carpeta es requerido'
            });
        }

        const carpeta = await Infraestructura.crearCarpeta(nombre);
        
        res.json({
            success: true,
            message: 'Carpeta creada correctamente',
            carpeta: carpeta
        });

    } catch (error) {
        console.error('Error al crear carpeta:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear carpeta: ' + error.message
        });
    }
};

export const obtenerCarpetas = async (req, res) => {
    try {
        const carpetas = await Infrastructura.obtenerCarpetas();
        
        res.json({
            success: true,
            carpetas: carpetas
        });

    } catch (error) {
        console.error('Error al obtener carpetas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener carpetas: ' + error.message
        });
    }
};

// ================== ARCHIVOS ==================

export const subirArchivos = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No se recibieron archivos'
            });
        }

        const archivosSubidos = [];
        const carpetaId = req.body.carpetaId || null;

        for (const file of req.files) {
            const nuevoArchivo = await Infrastructura.subirArchivo({
                nombre_archivo: file.originalname,
                nombre_guardado: file.filename,
                tipo_archivo: file.mimetype,
                tamaño: file.size,
                usuario_subio: 'Tomas',
                carpeta_id: carpetaId
            });

            archivosSubidos.push({
                id: nuevoArchivo.id,
                nombre: nuevoArchivo.nombre_archivo,
                tipo: nuevoArchivo.tipo_archivo,
                tamaño: nuevoArchivo.tamaño,
                fecha: nuevoArchivo.fecha_subida,
                carpeta_id: nuevoArchivo.carpeta_id
            });
        }

        res.json({
            success: true,
            message: 'Archivos subidos correctamente',
            files: archivosSubidos
        });

    } catch (error) {
        console.error('Error al subir archivos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor: ' + error.message
        });
    }
};

export const obtenerArchivos = async (req, res) => {
    try {
        const { carpetaId } = req.query;
        
        const archivos = await Infrastructura.obtenerArchivos(carpetaId);

        const archivosFormateados = archivos.map(archivo => ({
            id: archivo.id,
            name: archivo.nombre_archivo,
            type: archivo.tipo_archivo,
            size: archivo.tamaño,
            uploadDate: archivo.fecha_subida,
            carpeta_id: archivo.carpeta_id,
            url: `/api/infraestructura/archivos/${archivo.id}/ver`
        }));

        res.json({
            success: true,
            documents: archivosFormateados
        });

    } catch (error) {
        console.error('Error al obtener archivos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener archivos: ' + error.message
        });
    }
};

export const verArchivo = async (req, res) => {
    try {
        const archivo = await Infrastructura.obtenerArchivoPorId(req.params.id);
        
        if (!archivo) {
            return res.status(404).json({
                success: false,
                error: 'Archivo no encontrado'
            });
        }

        const filePath = path.join(__dirname, '../uploads', archivo.nombre_guardado);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'Archivo físico no encontrado'
            });
        }

        res.setHeader('Content-Type', archivo.tipo_archivo);
        res.setHeader('Content-Length', archivo.tamaño);
        res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre_archivo}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        res.sendFile(filePath);

    } catch (error) {
        console.error('Error al visualizar archivo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al visualizar archivo: ' + error.message
        });
    }
};

export const eliminarArchivo = async (req, res) => {
    try {
        const archivo = await Infrastructura.obtenerArchivoPorId(req.params.id);
        
        if (!archivo) {
            return res.status(404).json({
                success: false,
                error: 'Archivo no encontrado'
            });
        }

        const filePath = path.join(__dirname, '../uploads', archivo.nombre_guardado);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Infrastructura.eliminarArchivo(req.params.id);

        res.json({
            success: true,
            message: 'Archivo eliminado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar archivo: ' + error.message
        });
    }
};

// ================== ESTADÍSTICAS ==================

export const obtenerEstadisticas = async (req, res) => {
    try {
        const stats = await Infrastructura.obtenerEstadisticas();
        const carpetas = await Infrastructura.obtenerCarpetas();
        
        res.json({
            success: true,
            estadisticas: {
                totalDocumentos: stats.totalDocumentos || 0,
                totalTamaño: stats.totalTamaño || 0,
                ultimaSubida: stats.ultimaSubida || '-',
                totalCarpetas: carpetas.length || 0
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas: ' + error.message
        });
    }
};