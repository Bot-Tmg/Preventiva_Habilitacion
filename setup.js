import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
    try {
        console.log('🔄 Configurando base de datos...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Ejecutar el SQL
        await pool.query(sql);
        console.log('✅ Base de datos configurada exitosamente!');
        console.log('📊 Tablas creadas:');
        console.log('   👥 users');
        console.log('   🏥 instituciones');
        console.log('   📋 capacidad_tecnico_admin');
        console.log('   🖥️ dotacion_equipos');
        console.log('   📊 historia_clinica_records');
        console.log('   🏢 infrastructura_fisica');
        console.log('   💊 medicamentos_insumos');
        console.log('   ⚙️ procesos_asistenciales');
        console.log('   👥 talento_humano');
        
    } catch (error) {
        console.error('❌ Error configurando base de datos:', error.message);
    } finally {
        await pool.end();
    }
};

// Ejecutar si se llama directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    setupDatabase();
}

export { setupDatabase };