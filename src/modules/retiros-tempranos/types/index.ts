/**
 * Tipos TypeScript para el módulo de Retiros Tempranos
 * Basado en los DTOs del backend BRISA
 */

// Estados de las solicitudes (según el backend)
export enum EstadoSolicitud {
  RECIBIDA = 'recibida',
  DERIVADA = 'derivada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CANCELADA = 'cancelada'
}

// Tipo para crear una nueva solicitud
export interface SolicitudRetiroCreate {
  id_estudiante: number;
  id_apoderado: number;
  id_motivo: number;
  fecha_hora_salida: string; // ISO 8601
  fecha_hora_retorno_previsto?: string; // ISO 8601
  observacion?: string;
}

// Tipo para actualizar una solicitud
export interface SolicitudRetiroUpdate {
  id_apoderado?: number;
  id_motivo?: number;
  id_autorizacion?: number;
  fecha_hora_salida?: string;
  fecha_hora_retorno_previsto?: string;
  observacion?: string;
  estado?: EstadoSolicitud;
}

// Tipo para la respuesta completa de una solicitud
export interface SolicitudRetiroResponse {
  id_solicitud: number;
  id_estudiante: number;
  id_apoderado: number;
  id_motivo: number;
  id_autorizacion?: number;
  fecha_hora_salida: string;
  fecha_hora_retorno_previsto?: string;
  observacion?: string;
  fecha_creacion: string;
  estado: EstadoSolicitud;
  recibido_por?: number;
  fecha_recepcion?: string;
  derivado_a?: number;
  fecha_derivacion?: string;
}

// Motivos de retiro
export interface MotivoRetiro {
  id_motivo: number;
  nombre: string;
  descripcion?: string;
  severidad?: string;
  requiere_justificacion?: boolean;
  activo: boolean; // El backend devuelve 'activo', no 'is_active'
}

// Estudiante (información básica para el módulo)
export interface Estudiante {
  id_estudiante: number;
  ci: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  curso?: string; // Campo adicional para mostrar en UI
}

// Apoderado (basado en ApoderadoResponseDTO del backend)
// El backend usa "apellidos" como campo único, no apellido_paterno/apellido_materno
export interface Apoderado {
  id_apoderado: number;
  ci: string;
  nombres: string;
  apellidos: string; // El backend usa "apellidos" como campo único
  telefono?: string;
  correo?: string;
  direccion?: string;
  // Campos que se agregan al obtener desde relaciones
  parentesco?: string;
  es_contacto_principal?: boolean;
}

// Tipo para los filtros de búsqueda
export interface FiltrosSolicitud {
  estado?: EstadoSolicitud;
  id_estudiante?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Tipo para estadísticas del dashboard
export interface EstadisticasRetiros {
  total_pendientes: number;
  total_aprobadas_hoy: number;
  total_mes: number;
  total_rechazadas: number;
}
