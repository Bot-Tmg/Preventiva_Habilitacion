import { openDB } from '../config/sqlite.js';

export class DotacionEquipos {
    
    // ================== CARPETAS ==================
    
    static async crearCarpeta(nombre) {
        const query = `
            INSERT INTO carpetas_dotacion_equipos (nombre) 
            VALUES ($1) 
            RETURNING *
        `;
        const result = await  openDB .query(query, [nombre]);
        return result.rows[0];
    }

    static async obtenerCarpetas() {
        const query = `
            SELECT c.*, 
                   COUNT(d.id) as document_count
            FROM carpetas_dotacion_equipos c
            LEFT JOIN documentos_dotacion_equipos d ON c.id = d.carpeta_id
            GROUP BY c.id
            ORDER BY c.nombre
        `;
        const result = await  openDB.query(query);
        return result.rows;
    }

    // ================== ARCHIVOS ==================
    
    static async subirArchivo(data) {
        const query = `
            INSERT INTO documentos_dotacion_equipos (
                nombre_archivo, 
                nombre_guardado, 
                tipo_archivo, 
                tamaño,
                usuario_subio,
                carpeta_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            data.nombre_archivo,
            data.nombre_guardado,
            data.tipo_archivo,
            data.tamaño,
            data.usuario_subio || 'Sistema',
            data.carpeta_id || null
        ];
        
        const result = await  openDB.query(query, values);
        return result.rows[0];
    }

    static async obtenerArchivos(carpetaId = null) {
        let query = `
            SELECT * FROM documentos_dotacion_equipos 
            WHERE 1=1
        `;
        const params = [];
        
        if (carpetaId && carpetaId !== 'all') {
            query += ' AND carpeta_id = $1';
            params.push(carpetaId);
        }
        
        query += ' ORDER BY fecha_subida DESC';
        
        const result = await openDB.query(query, params);
        return result.rows;
    }

    static async obtenerArchivoPorId(id) {
        const query = `
            SELECT * FROM documentos_dotacion_equipos 
            WHERE id = $1
        `;
        const result = await openDB.query(query, [id]);
        return result.rows[0];
    }

    static async eliminarArchivo(id) {
        const query = `
            DELETE FROM documentos_dotacion_equipos 
            WHERE id = $1
            RETURNING *
        `;
        const result = await openDB.query(query, [id]);
        return result.rows[0];
    }

    // ================== ESTADÍSTICAS ==================
    
    static async obtenerEstadisticas() {
        const query = `
            SELECT 
                COUNT(*) as total_documentos,
                COALESCE(SUM(tamaño), 0) as total_tamaño,
                MAX(fecha_subida) as ultima_subida
            FROM documentos_dotacion_equipos
        `;
        const result = await openDB.query(query);
        return {
            totalDocumentos: parseInt(result.rows[0].total_documentos),
            totalTamaño: parseInt(result.rows[0].total_tamaño),
            ultimaSubida: result.rows[0].ultima_subida
        };
    }

    // ================== EVALUACIÓN ==================
    
    static async update(id, data) {
        const query = `
            UPDATE dotacion_equipos SET
                equipos_medicos_url = $1,
                equipos_medicos_aprobado = $2,
                equipos_diagnostico_url = $3,
                equipos_diagnostico_aprobado = $4,
                mantenimiento_url = $5,
                mantenimiento_aprobado = $6,
                puntuacion_total = $7,
                observaciones = $8,
                evaluador_id = $9,
                fecha_evaluacion = NOW()
            WHERE id = $10
            RETURNING *
        `;
        
        const values = [
            data.equipos_medicos_url,
            data.equipos_medicos_aprobado,
            data.equipos_diagnostico_url,
            data.equipos_diagnostico_aprobado,
            data.mantenimiento_url,
            data.mantenimiento_aprobado,
            data.puntuacion_total,
            data.observaciones,
            data.evaluador_id,
            id
        ];
        
        const result = await openDB.query(query, values);
        return result.rows[0];
    }

    static async findAllByEvaluador(evaluadorId) {
        const query = `
            SELECT * FROM dotacion_equipos 
            WHERE evaluador_id = $1 
            ORDER BY fecha_evaluacion DESC
        `;
        const result = await openDB.query(query, [evaluadorId]);
        return result.rows;
    }

    static async findByInstitucion(institucionId) {
        const query = `
            SELECT * FROM dotacion_equipos 
            WHERE institucion_id = $1 
            ORDER BY fecha_evaluacion DESC 
            LIMIT 1
        `;
        const result = await openDB.query(query, [institucionId]);
        return result.rows[0];
    }

    static async create(data) {
        const query = `
            INSERT INTO dotacion_equipos (
                equipos_medicos_url, equipos_medicos_aprobado,
                equipos_diagnostico_url, equipos_diagnostico_aprobado,
                mantenimiento_url, mantenimiento_aprobado,
                puntuacion_total, observaciones, evaluador_id, institucion_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const values = [
            data.equipos_medicos_url,
            data.equipos_medicos_aprobado,
            data.equipos_diagnostico_url,
            data.equipos_diagnostico_aprobado,
            data.mantenimiento_url,
            data.mantenimiento_aprobado,
            data.puntuacion_total,
            data.observaciones,
            data.evaluador_id,
            data.institucion_id
        ];
        
        const result = await openDB.query(query, values);
        return result.rows[0];
    }
}