import { openDB } from '../config/sqlite.js';

export class Infraestructura {
    
    static async crearCarpeta(nombre) {
        const query = `
            INSERT INTO carpetas_infraestructura (nombre) 
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
            FROM carpetas_infraestructura c
            LEFT JOIN documentos_infraestructura d ON c.id = d.carpeta_id
            GROUP BY c.id
            ORDER BY c.nombre
        `;
        const result = await openDB.query(query);
        return result.rows;
    }
    
    static async subirArchivo(data) {
        const query = `
            INSERT INTO documentos_infraestructura (
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
            SELECT * FROM documentos_infraestructura 
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
            SELECT * FROM documentos_infraestructura 
            WHERE id = $1
        `;
        const result = await openDB.query(query, [id]);
        return result.rows[0];
    }

    static async eliminarArchivo(id) {
        const query = `
            DELETE FROM documentos_infraestructura 
            WHERE id = $1
            RETURNING *
        `;
        const result = await openDB.query(query, [id]);
        return result.rows[0];
    }
    
    static async obtenerEstadisticas() {
        const query = `
            SELECT 
                COUNT(*) as total_documentos,
                COALESCE(SUM(tamaño), 0) as total_tamaño,
                MAX(fecha_subida) as ultima_subida
            FROM documentos_infraestructura
        `;
        const result = await openDB.query(query);
        return {
            totalDocumentos: parseInt(result.rows[0].total_documentos),
            totalTamaño: parseInt(result.rows[0].total_tamaño),
            ultimaSubida: result.rows[0].ultima_subida
        };
    }
}