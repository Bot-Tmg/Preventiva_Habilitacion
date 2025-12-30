import { openDB } from '../config/sqlite.js';

export class TalentoHumano {
    
    // ================== CARPETAS ==================
    
    static async crearCarpeta(nombre) {
        const query = `
            INSERT INTO carpetas_talento_humano (nombre) 
            VALUES ($1) 
            RETURNING *
        `;
        const result = await openDB.query(query, [nombre]);
        return result.rows[0];
    }

    static async obtenerCarpetas() {
        const query = `
            SELECT c.*, 
                   COUNT(d.id) as document_count
            FROM carpetas_talento_humano c
            LEFT JOIN documentos_talento_humano d ON c.id = d.carpeta_id
            GROUP BY c.id
            ORDER BY c.nombre
        `;
        const result = await openDB.query(query);
        return result.rows;
    }

    // ================== ARCHIVOS ==================
    
    static async subirArchivo(data) {
        const query = `
            INSERT INTO documentos_talento_humano (
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
            data.usuario_subio || 'Tomas',
            data.carpeta_id || null
        ];
        
        const result = await openDB.query(query, values);
        return result.rows[0];
    }

    static async obtenerArchivos(carpetaId = null) {
        let query = `
            SELECT * FROM documentos_talento_humano 
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
            SELECT * FROM documentos_talento_humano 
            WHERE id = $1
        `;
        const result = await openDB.query(query, [id]);
        return result.rows[0];
    }

    static async eliminarArchivo(id) {
        const query = `
            DELETE FROM documentos_talento_humano 
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
            FROM documentos_talento_humano
        `;
        const result = await openDB.query(query);
        return {
            totalDocumentos: parseInt(result.rows[0].total_documentos),
            totalTamaño: parseInt(result.rows[0].total_tamaño),
            ultimaSubida: result.rows[0].ultima_subida
        };
    }

    // ================== FUNCIONES ANTIGUAS (SI LAS TENÍAS) ==================
    
    // Si tenías estas funciones antiguas de evaluación, las mantenemos por compatibilidad
    static async update(id, data) {
        const query = `
            UPDATE talento_humano SET
                personal_calificado_url = $1,
                personal_calificado_aprobado = $2,
                formacion_continua_url = $3,
                formacion_continua_aprobado = $4,
                evaluacion_desempeno_url = $5,
                evaluacion_desempeno_aprobado = $6,
                puntuacion_total = $7,
                observaciones = $8,
                evaluador_id = $9,
                fecha_evaluacion = NOW()
            WHERE id = $10
            RETURNING *
        `;
        
        const values = [
            data.personal_calificado_url,
            data.personal_calificado_aprobado,
            data.formacion_continua_url,
            data.formacion_continua_aprobado,
            data.evaluacion_desempeno_url,
            data.evaluacion_desempeno_aprobado,
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
            SELECT * FROM talento_humano 
            WHERE evaluador_id = $1 
            ORDER BY fecha_evaluacion DESC
        `;
        const result = await openDB.query(query, [evaluadorId]);
        return result.rows;
    }

    static async findByInstitucion(institucionId) {
        const query = `
            SELECT * FROM talento_humano 
            WHERE institucion_id = $1 
            ORDER BY fecha_evaluacion DESC 
            LIMIT 1
        `;
        const result = await openDB.query(query, [institucionId]);
        return result.rows[0];
    }

    static async create(data) {
        const query = `
            INSERT INTO talento_humano (
                personal_calificado_url, personal_calificado_aprobado,
                formacion_continua_url, formacion_continua_aprobado,
                evaluacion_desempeno_url, evaluacion_desempeno_aprobado,
                puntuacion_total, observaciones, evaluador_id, institucion_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const values = [
            data.personal_calificado_url,
            data.personal_calificado_aprobado,
            data.formacion_continua_url,
            data.formacion_continua_aprobado,
            data.evaluacion_desempeno_url,
            data.evaluacion_desempeno_aprobado,
            data.puntuacion_total,
            data.observaciones,
            data.evaluador_id,
            data.institucion_id
        ];
        
        const result = await openDB.query(query, values);
        return result.rows[0];
    }
}