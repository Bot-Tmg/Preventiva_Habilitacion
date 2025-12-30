-- =============================================
-- SETUP DATABASE - PLATAFORMA HABILITACIÓN
-- =============================================
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'evaluador',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de instituciones
CREATE TABLE IF NOT EXISTS instituciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    direccion TEXT,
    telefono VARCHAR(20),
    ciudad VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de capacidad técnica administrativa
CREATE TABLE IF NOT EXISTS capacidad_tecnico_admin (
    id SERIAL PRIMARY KEY,
    manual_processos_url TEXT,
    manual_processos_aprobado BOOLEAN DEFAULT FALSE,
    estructura_organizacional_url TEXT,
    estructura_organizacional_aprobado BOOLEAN DEFAULT FALSE,
    documentacion_legal_url TEXT,
    documentacion_legal_aprobado BOOLEAN DEFAULT FALSE,
    contratacion_talento_url TEXT,
    contratacion_talento_aprobado BOOLEAN DEFAULT FALSE,
    puntuacion_total DECIMAL(5, 2),
    observaciones TEXT,
    evaluador_id INTEGER REFERENCES users(id),
    institucion_id INTEGER REFERENCES instituciones(id),
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de dotación de equipos
CREATE TABLE IF NOT EXISTS dotacion_equipos (
    id SERIAL PRIMARY KEY,
    equipos_url TEXT,
    equipos_aprobado BOOLEAN DEFAULT FALSE,
    mantenimiento_url TEXT,
    mantenimiento_aprobado BOOLEAN DEFAULT FALSE,
    calibracion_url TEXT,
    calibracion_aprobado BOOLEAN DEFAULT FALSE,
    puntuacion_total DECIMAL(5, 2),
    observaciones TEXT,
    evaluador_id INTEGER REFERENCES users(id),
    institucion_id INTEGER REFERENCES instituciones(id),
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de historia clínica y registros
CREATE TABLE IF NOT EXISTS historia_clinica_records (
    id SERIAL PRIMARY KEY,
    formatos_url TEXT,
    formatos_aprobado BOOLEAN DEFAULT FALSE,
    digitalizacion_url TEXT,
    digitalizacion_aprobado BOOLEAN DEFAULT FALSE,
    confidencialidad_url TEXT,
    confidencialidad_aprobado BOOLEAN DEFAULT FALSE,
    puntuacion_total DECIMAL(5, 2),
    observaciones TEXT,
    evaluador_id INTEGER REFERENCES users(id),
    institucion_id INTEGER REFERENCES instituciones(id),
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de infraestructura física
CREATE TABLE IF NOT EXISTS infrastructura_fisica (
    id SERIAL PRIMARY KEY,
    instalaciones_url TEXT,
    instalaciones_aprobado BOOLEAN DEFAULT FALSE,
    bioseguridad_url TEXT,
    bioseguridad_aprobado BOOLEAN DEFAULT FALSE,
    equipos_biomedicos_url TEXT,
    equipos_biomedicos_aprobado BOOLEAN DEFAULT FALSE,
    puntuacion_total DECIMAL(5, 2),
    observaciones TEXT,
    evaluador_id INTEGER REFERENCES users(id),
    institucion_id INTEGER REFERENCES instituciones(id),
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de medicamentos e insumos
CREATE TABLE IF NOT EXISTS medicamentos_insumos (
    id SERIAL PRIMARY KEY,
    inventario_url TEXT,
    inventario_aprobado BOOLEAN DEFAULT FALSE,
    caducidad_url TEXT,
    caducidad_aprobado BOOLEAN DEFAULT FALSE,
    almacenamiento_url TEXT,
    almacenamiento_aprobado BOOLEAN DEFAULT FALSE,
    puntuacion_total DECIMAL(5, 2),
    observaciones TEXT,
    evaluador_id INTEGER REFERENCES users(id),
    institucion_id INTEGER REFERENCES instituciones(id),
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de procesos asistenciales
CREATE TABLE IF NOT EXISTS procesos_asistenciales (
    id SERIAL PRIMARY KEY,
    protocolos_url TEXT,
    protocolos_aprobado BOOLEAN DEFAULT FALSE,
    guias_practica_url TEXT,
    guias_practica_aprobado BOOLEAN DEFAULT FALSE,
    calidad_atencion_url TEXT,
    calidad_atencion_aprobado BOOLEAN DEFAULT FALSE,
    puntuacion_total DECIMAL(5, 2),
    observaciones TEXT,
    evaluador_id INTEGER REFERENCES users(id),
    institucion_id INTEGER REFERENCES instituciones(id),
    fecha_evaluacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
-- Tabla de talento humano
-- ELIMINA LA TABLA ANTIGUA SI EXISTE (si quieres empezar fresco)
DROP TABLE IF EXISTS talento_humano_archivos;

-- CREA LA NUEVA TABLA SOLO PARA ARCHIVOS
CREATE TABLE talento_humano_archivos (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_guardado VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamaño INTEGER NOT NULL,
    usuario_subio VARCHAR(100) DEFAULT 'Tomas',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Mensaje de confirmación
DO $$ BEGIN RAISE NOTICE '✅ Base de datos configurada exitosamente!';
END $$;