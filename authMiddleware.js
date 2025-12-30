// Middleware de autenticación simple
export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '❌ Token de acceso requerido'
            });
        }

        // Verificación simple del token (en un sistema real usarías JWT)
        if (!token.startsWith('token-')) {
            return res.status(403).json({
                success: false,
                message: '❌ Token inválido'
            });
        }

        // Extraer user ID del token (formato: token-{userId}-{timestamp})
        const tokenParts = token.split('-');
        if (tokenParts.length < 2) {
            return res.status(403).json({
                success: false,
                message: '❌ Formato de token inválido'
            });
        }

        const userId = tokenParts[1];
        
        // Agregar user ID al request para uso en controllers
        req.userId = userId;
        req.user = { id: userId }; // Información básica del usuario

        console.log(`🔐 Usuario autenticado: ${userId}`);
        next();

    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        return res.status(500).json({
            success: false,
            message: '❌ Error en autenticación'
        });
    }
};

// Middleware para verificar roles de usuario
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // En un sistema real, aquí buscarías el usuario en la base de datos
            // y verificarías su rol. Por ahora usamos una verificación simple.
            
            const userRole = req.headers['user-role'] || 'usuario'; // Temporal
            
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: '❌ No tienes permisos para acceder a este recurso'
                });
            }

            console.log(`👤 Rol verificado: ${userRole}`);
            next();

        } catch (error) {
            console.error('❌ Error en verificación de rol:', error);
            return res.status(500).json({
                success: false,
                message: '❌ Error en verificación de permisos'
            });
        }
    };
};

// Middleware para verificar módulos permitidos
export const requireModule = (moduleName) => {
    return (req, res, next) => {
        try {
            // En un sistema real, verificarías en la base de datos
            // si el usuario tiene acceso al módulo
            const userModules = req.headers['user-modules'] ? 
                JSON.parse(req.headers['user-modules']) : ['talento_humano']; // Temporal
            
            if (!userModules.includes(moduleName)) {
                return res.status(403).json({
                    success: false,
                    message: `❌ No tienes acceso al módulo ${moduleName}`
                });
            }

            console.log(`📂 Módulo verificado: ${moduleName}`);
            next();

        } catch (error) {
            console.error('❌ Error en verificación de módulo:', error);
            return res.status(500).json({
                success: false,
                message: '❌ Error en verificación de módulo'
            });
        }
    };
};

// Middleware de logging
export const requestLogger = (req, res, next) => {
    console.log(`📥 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
};

// También exporta verificarPermisos para compatibilidad
export const verificarPermisos = (permisosRequeridos = []) => {
    return (req, res, next) => {
        try {
            const usuario = req.user; // Ahora viene de authenticateToken
            
            if (!usuario) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Usuario no autenticado' 
                });
            }

            // Verificar permisos (lógica temporal)
            const tienePermiso = permisosRequeridos.length === 0 || 
                                permisosRequeridos.some(permiso => 
                                    usuario.permisos?.includes(permiso)
                                );

            if (!tienePermiso) {
                return res.status(403).json({ 
                    success: false,
                    message: 'No tienes permisos para esta acción',
                    permisosRequeridos
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ 
                success: false,
                message: 'Error al verificar permisos',
                error: error.message 
            });
        }
    };
};

// ELIMINA ESTA LÍNEA:
// import authenticate from '../middleware/authMiddleware.js';