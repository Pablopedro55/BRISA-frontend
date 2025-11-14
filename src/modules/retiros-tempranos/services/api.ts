/**
 * Servicio API para Retiros Tempranos
 * Conecta con el backend BRISA en localhost:8000
 */

import type {
  SolicitudRetiroCreate,
  SolicitudRetiroUpdate,
  SolicitudRetiroResponse,
  MotivoRetiro,
  EstadoSolicitud,
  Estudiante,
  Apoderado
} from '../types';

// URL base del API (ajustar según configuración)
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Clase para manejar errores de la API
 */
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Función helper para hacer fetch con manejo de errores
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      throw new ApiError(
        response.status,
        errorData.detail || `Error HTTP: ${response.status}`
      );
    }

    // Si es 204 No Content, retornar null
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Error de red: ${error instanceof Error ? error.message : 'Desconocido'}`);
  }
}

/**
 * Servicio de Solicitudes de Retiro
 */
export const solicitudesService = {
  /**
   * Obtener todas las solicitudes
   */
  async getAll(): Promise<SolicitudRetiroResponse[]> {
    return fetchApi<SolicitudRetiroResponse[]>('/solicitudes-retiro/');
  },

  /**
   * Obtener una solicitud por ID
   */
  async getById(id: number): Promise<SolicitudRetiroResponse> {
    return fetchApi<SolicitudRetiroResponse>(`/solicitudes-retiro/${id}`);
  },

  /**
   * Obtener solicitudes por estado
   */
  async getByEstado(estado: EstadoSolicitud): Promise<SolicitudRetiroResponse[]> {
    return fetchApi<SolicitudRetiroResponse[]>(`/solicitudes-retiro/estado/${estado}`);
  },

  /**
   * Obtener solicitudes de un estudiante
   */
  async getByEstudiante(idEstudiante: number): Promise<SolicitudRetiroResponse[]> {
    return fetchApi<SolicitudRetiroResponse[]>(`/solicitudes-retiro/estudiante/${idEstudiante}`);
  },

  /**
   * Crear nueva solicitud
   */
  async create(solicitud: SolicitudRetiroCreate): Promise<SolicitudRetiroResponse> {
    return fetchApi<SolicitudRetiroResponse>('/solicitudes-retiro/', {
      method: 'POST',
      body: JSON.stringify(solicitud),
    });
  },

  /**
   * Actualizar solicitud
   */
  async update(id: number, solicitud: SolicitudRetiroUpdate): Promise<SolicitudRetiroResponse> {
    return fetchApi<SolicitudRetiroResponse>(`/solicitudes-retiro/${id}`, {
      method: 'PUT',
      body: JSON.stringify(solicitud),
    });
  },

  /**
   * Derivar solicitud al regente
   */
  async derivar(id: number): Promise<SolicitudRetiroResponse> {
    return fetchApi<SolicitudRetiroResponse>(`/solicitudes-retiro/${id}/derivar`, {
      method: 'POST',
    });
  },

  /**
   * Eliminar solicitud
   */
  async delete(id: number): Promise<void> {
    return fetchApi<void>(`/solicitudes-retiro/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Servicio de Motivos de Retiro
 */
export const motivosService = {
  /**
   * Obtener todos los motivos activos
   */
  async getAll(): Promise<MotivoRetiro[]> {
    try {
      // Intentar primero el endpoint de activos
      const motivos = await fetchApi<MotivoRetiro[]>('/motivos-retiro/activos');
      console.log('Motivos cargados desde /activos:', motivos);
      return motivos;
    } catch (error) {
      // Si falla, usar el endpoint general
      console.log('Intentando endpoint general /motivos-retiro/');
      const motivos = await fetchApi<MotivoRetiro[]>('/motivos-retiro/');
      console.log('Motivos cargados:', motivos);
      return motivos;
    }
  },

  /**
   * Obtener motivo por ID
   */
  async getById(id: number): Promise<MotivoRetiro> {
    return fetchApi<MotivoRetiro>(`/motivos-retiro/${id}`);
  },
};

/**
 * Servicio de Registros de Salida
 */
export const registrosService = {
  /**
   * Obtener todos los registros
   */
  async getAll(): Promise<any[]> {
    return fetchApi<any[]>('/registros-salida/');
  },

  /**
   * Crear registro de salida
   */
  async create(registro: any): Promise<any> {
    return fetchApi<any>('/registros-salida/', {
      method: 'POST',
      body: JSON.stringify(registro),
    });
  },

  /**
   * Obtener registros de un estudiante
   */
  async getByEstudiante(idEstudiante: number): Promise<any[]> {
    return fetchApi<any[]>(`/registros-salida/estudiante/${idEstudiante}`);
  },
};

/**
 * Servicio auxiliar para obtener datos de estudiantes y apoderados
 */
export const datosService = {
  /**
   * Obtener todos los estudiantes (TODO: implementar endpoint en backend)
   * Por ahora, retorna array vacío
   */
  async getAllEstudiantes(): Promise<Estudiante[]> {
    // TODO: Implementar cuando el backend tenga endpoint /api/estudiantes
    console.warn('Endpoint de estudiantes no implementado aún');
    return [];
  },

  /**
   * Obtener apoderados de un estudiante
   */
  async getApoderadosPorEstudiante(idEstudiante: number): Promise<any[]> {
    return fetchApi<any[]>(`/estudiantes-apoderados/estudiante/${idEstudiante}`);
  },

  /**
   * Obtener todos los apoderados (TODO: implementar endpoint en backend)
   * Por ahora, retorna array vacío
   */
  async getAllApoderados(): Promise<Apoderado[]> {
    // TODO: Implementar cuando el backend tenga endpoint /api/apoderados
    console.warn('Endpoint de apoderados no implementado aún');
    return [];
  },
};

export { ApiError };
