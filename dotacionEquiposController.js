import { DotacionEquipos } from '../models/DotacionEquipos.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== CARPETAS ==================

// CREAR CARPETA
export const crearCarpeta = async (req, res) => {
    try {
        const { nombre } = req.body;
        
        if (!nombre) {
            return res.status(400).json({
                success: false,
                error: 'El nombre de la carpeta es requerido'
            });
        }

        const carpeta = await DotacionEquipos.crearCarpeta(nombre);
        
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

// OBTENER CARPETAS
export const obtenerCarpetas = async (req, res) => {
    try {
        const carpetas = await DotacionEquipos.obtenerCarpetas();
        
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

// SUBIR ARCHIVOS
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
            const nuevoArchivo = await DotacionEquipos.subirArchivo({
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

// OBTENER ARCHIVOS
export const obtenerArchivos = async (req, res) => {
    try {
        const { carpetaId } = req.query;
        
        const archivos = await DotacionEquipos.obtenerArchivos(carpetaId);

        const archivosFormateados = archivos.map(archivo => ({
            id: archivo.id,
            name: archivo.nombre_archivo,
            type: archivo.tipo_archivo,
            size: archivo.tamaño,
            uploadDate: archivo.fecha_subida,
            carpeta_id: archivo.carpeta_id,
            url: `/api/dotacion-equipos/archivos/${archivo.id}/ver`
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

// VER ARCHIVO (SOLO VISUALIZACIÓN)
export const verArchivo = async (req, res) => {
    try {
        const archivo = await DotacionEquipos.obtenerArchivoPorId(req.params.id);
        
        if (!archivo) {
            return res.status(404).json({
                success: false,
                error: 'Archivo no encontrado'
            });
        }

         const modulePath = path.join('uploads', 'dotacion_equipos');
                const filePath = path.resolve(modulePath, archivo.nombre_guardado);
                
                if (!fs.existsSync(filePath)) {
                    return res.status(404).json({
                        success: false,
                        error: 'Archivo físico no encontrado'
                    });
                }
        // SOLO VISUALIZACIÓN - SIN DESCARGA
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

// ELIMINAR ARCHIVO
export const eliminarArchivo = async (req, res) => {
    try {
        const archivo = await DotacionEquipos.obtenerArchivoPorId(req.params.id);
        
        if (!archivo) {
            return res.status(404).json({
                success: false,
                error: 'Archivo no encontrado'
            });
        }

        // Eliminar archivo físico
        const filePath = path.join(__dirname, '../uploads', archivo.nombre_guardado);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Eliminar de la base de datos
        await DotacionEquipos.eliminarArchivo(req.params.id);

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

// OBTENER ESTADÍSTICAS
export const obtenerEstadisticas = async (req, res) => {
    try {
        const stats = await DotacionEquipos.obtenerEstadisticas();
        const carpetas = await DotacionEquipos.obtenerCarpetas();
        
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