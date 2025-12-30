import { openDB } from '../config/sqlite.js';

export class CapacidadTecnica {
    
    // ================== CARPETAS ==================
    
    static async crearCarpeta(nombre) {
        const query = `
            INSERT INTO carpetas_capacidad_tecnica (nombre) 
            VALUES ($1) 
            RETURNING *
        `;
        const result = await openDB.query(query, [nombre]); // ✅ CORREGIDO
        return result.rows[0];
    }

    static async obtenerCarpetas() {
        const query = `
            SELECT c.*, 
                   COUNT(d.id) as document_count
            FROM carpetas_capacidad_tecnica c
            LEFT JOIN documentos_capacidad_tecnica d ON c.id = d.carpeta_id
            GROUP BY c.id
            ORDER BY c.nombre
        `;
        const result = await openDB.query(query); // ✅ CORREGIDO
        return result.rows;
    }

  


    // ================== ARCHIVOS ==================
    
    static async subirArchivo(data) {
        const query = `
            INSERT INTO documentos_capacidad_tecnica (
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
        
        const result = await openDB.query(query, values);
        return result.rows[0];
    }

    static async obtenerArchivos(carpetaId = null) {
        let query = `
            SELECT * FROM documentos_capacidad_tecnica 
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
            SELECT * FROM documentos_capacidad_tecnica 
            WHERE id = $1
        `;
        const result = await openDB.query(query, [id]);
        return result.rows[0];
    }

    static async eliminarArchivo(id) {
        const query = `
            DELETE FROM documentos_capacidad_tecnica 
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
            FROM documentos_capacidad_tecnica
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
            UPDATE capacidad_tecnica SET
                documentacion_url = $1,
                documentacion_aprobado = $2,
                sistemas_url = $3,
                sistemas_aprobado = $4,
                procedimientos_url = $5,
                procedimientos_aprobado = $6,
                puntuacion_total = $7,
                observaciones = $8,
                evaluador_id = $9,
                fecha_evaluacion = NOW()
            WHERE id = $10
            RETURNING *
        `;
        
        const values = [
            data.documentacion_url,
            data.documentacion_aprobado,
            data.sistemas_url,
            data.sistemas_aprobado,
            data.procedimientos_url,
            data.procedimientos_aprobado,
            data.puntuacion_total,
            data.observaciones,
            data.evaluador_id,
            id
        ];
        
        const result = await OPNE.query(query, values);
        return result.rows[0];
    }

    static async findAllByEvaluador(evaluadorId) {
        const query = `
            SELECT * FROM capacidad_tecnica 
            WHERE evaluador_id = $1 
            ORDER BY fecha_evaluacion DESC
        `;
        const result = await openDB.query(query, [evaluadorId]);
        return result.rows;
    }

    static async findByInstitucion(institucionId) {
        const query = `
            SELECT * FROM capacidad_tecnica_admin 
            WHERE institucion_id = $1 
            ORDER BY fecha_evaluacion DESC 
            LIMIT 1
        `;
        const result = await openDB.query(query, [institucionId]);
        return result.rows[0];
    }

    static async create(data) {
        const query = `
            INSERT INTO capacidad_tecnica_admin (
                documentacion_url, documentacion_aprobado,
                sistemas_url, sistemas_aprobado,
                procedimientos_url, procedimientos_aprobado,
                puntuacion_total, observaciones, evaluador_id, institucion_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const values = [
            data.documentacion_url,
            data.documentacion_aprobado,
            data.sistemas_url,
            data.sistemas_aprobado,
            data.procedimientos_url,
            data.procedimientos_aprobado,
            data.puntuacion_total,
            data.observaciones,
            data.evaluador_id,
            data.institucion_id
        ];
        
        const result = await openDB.query(query, values);
        return result.rows[0];
    }
}