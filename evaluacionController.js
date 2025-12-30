import { CapacidadTecnica } from '../models/CapacidadTecnica.js';
import { DotacionEquipos } from '../models/DotacionEquipos.js';
import { HistoriaClinica } from '../models/HistoriaClinica.js';
import { Infraestructura } from '../models/Infraestructura.js';
import { TalentoHumano } from '../models/TalentoHumano.js';

// 📋 CAPACIDAD TÉCNICA ADMINISTRATIVA
export const evaluateCapacidadTecnico  = async (req, res) => {
    try {
        const { id } = req.params;
        const data = {
            ...req.body,
            evaluador_id: req.user.userId
        };

        const resultado = await CapacidadTecnica.update(id, data);
        res.json({
            success: true,
            message: 'Evaluación de capacidad técnica actualizada',
            data: resultado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en evaluación de capacidad técnica',
            error: error.message
        });
    }
};

// 🖥️ DOTACIÓN DE EQUIPOS
export const evaluateDotacionEquipos = async (req, res) => {
    try {
        const { id } = req.params;
        const data = {
            ...req.body,
            evaluador_id: req.user.userId
        };

        const resultado = await DotacionEquipos.update(id, data);
        res.json({
            success: true,
            message: 'Evaluación de dotación de equipos actualizada',
            data: resultado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en evaluación de dotación de equipos',
            error: error.message
        });
    }
};

// 📊 HISTORIA CLÍNICA Y REGISTROS
export const evaluateHistoriaClinica = async (req, res) => {
    try {
        const { id } = req.params;
        const data = {
            ...req.body,
            evaluador_id: req.user.userId
        };

        const resultado = await HistoriaClinica.update(id, data);
        res.json({
            success: true,
            message: 'Evaluación de historia clínica actualizada',
            data: resultado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en evaluación de historia clínica',
            error: error.message
        });
    }
};

// 🏢 INFRAESTRUCTURA FÍSICA
export const evaluateInfrastructura = async (req, res) => {
    try {
        const { id } = req.params;
        const data = {
            ...req.body,
            evaluador_id: req.user.userId
        };

        const resultado = await Infraestructura.update(id, data);
        res.json({
            success: true,
            message: 'Evaluación de infraestructura física actualizada',
            data: resultado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en evaluación de infraestructura física',
            error: error.message
        });
    }
};

// ⚙️ PROCESOS ASISTENCIALES

// 👥 TALENTO HUMANO
export const evaluateTalentoHumano = async (req, res) => {
    try {
        const { id } = req.params;
        const data = {
            ...req.body,
            evaluador_id: req.user.userId
        };

        const resultado = await TalentoHumano.update(id, data);
        res.json({
            success: true,
            message: 'Evaluación de talento humano actualizada',
            data: resultado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en evaluación de talento humano',
            error: error.message
        });
    }
};

// 📈 OBTENER EVALUACIONES POR COMPONENTE
export const getEvaluacionesByComponente = async (req, res) => {
    try {
        const { componente } = req.params;
        const { userId } = req.user;

        let modelo;
        switch (componente) {
            case 'capacidad-tecnico':
                modelo = CapacidadTecnica;
                break;
            case 'dotacion-equipos':
                modelo = DotacionEquipos;
                break;
            case 'historia-clinica':
                modelo = HistoriaClinica;
                break;
            case 'infrastructura-fisica':
                modelo = Infraestructura;
                break;
            case 'procesos-asistenciales':
                modelo = ProcessoSAsistencial;
                break;
            case 'talento-humano':
                modelo = TalentoHumano;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Componente no válido'
                });
        }

        const evaluaciones = await modelo.findAllByEvaluador(userId);
        
        res.json({
            success: true,
            data: evaluaciones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener evaluaciones',
            error: error.message
        });
    }
};

// 🏆 OBTENER PUNTUACIÓN TOTAL
export const getPuntuacionTotal = async (req, res) => {
    try {
        const { institucionId } = req.params;

        // Obtener puntuaciones de todos los componentes
        const componentes = [
            CapacidadTecnica,
            DotacionEquipos,
            HistoriaClinica,
            Infraestructura,
            ProcessoSAsistencial,
            TalentoHumano
        ];

        let puntuacionTotal = 0;
        let componentesEvaluados = 0;

        for (const Modelo of componentes) {
            const evaluacion = await Modelo.findByInstitucion(institucionId);
            if (evaluacion && evaluacion.puntuacion_total) {
                puntuacionTotal += evaluacion.puntuacion_total;
                componentesEvaluados++;
            }
        }

        const promedio = componentesEvaluados > 0 ? puntuacionTotal / componentesEvaluados : 0;

        res.json({
            success: true,
            data: {
                puntuacionTotal: promedio,
                componentesEvaluados,
                maximoPuntos: 100,
                porcentaje: (promedio / 100) * 100
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al calcular puntuación total',
            error: error.message
        });
    }
};