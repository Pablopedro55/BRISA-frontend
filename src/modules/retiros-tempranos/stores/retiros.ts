/**
 * Store de Svelte para manejar el estado de Retiros Tempranos
 * Usando Svelte stores para estado reactivo
 */

import { writable, derived, get } from 'svelte/store';
import type {
  SolicitudRetiroResponse,
  MotivoRetiro,
  EstadoSolicitud,
  EstadisticasRetiros
} from '../types';
import { solicitudesService, motivosService } from '../services/api';

// Estado de carga
interface LoadingState {
  solicitudes: boolean;
  motivos: boolean;
  crear: boolean;
  actualizar: boolean;
}

// Estado de errores
interface ErrorState {
  solicitudes: string | null;
  motivos: string | null;
  operacion: string | null;
}

// Stores principales
export const solicitudes = writable<SolicitudRetiroResponse[]>([]);
export const motivos = writable<MotivoRetiro[]>([]);
export const loading = writable<LoadingState>({
  solicitudes: false,
  motivos: false,
  crear: false,
  actualizar: false
});
export const error = writable<ErrorState>({
  solicitudes: null,
  motivos: null,
  operacion: null
});

// Filtro activo
export const filtroEstado = writable<EstadoSolicitud | 'todos'>('todos');

// Solicitudes filtradas (derivada del store principal)
export const solicitudesFiltradas = derived(
  [solicitudes, filtroEstado],
  ([$solicitudes, $filtroEstado]) => {
    if ($filtroEstado === 'todos') {
      return $solicitudes;
    }
    return $solicitudes.filter(s => s.estado === $filtroEstado);
  }
);

// Estadísticas derivadas
export const estadisticas = derived(
  solicitudes,
  ($solicitudes): EstadisticasRetiros => {
    const hoy = new Date().toISOString().split('T')[0];
    
    return {
      total_pendientes: $solicitudes.filter(s => 
        s.estado === 'recibida' || s.estado === 'derivada'
      ).length,
      
      total_aprobadas_hoy: $solicitudes.filter(s => 
        s.estado === 'aprobada' && 
        s.fecha_creacion?.startsWith(hoy)
      ).length,
      
      total_mes: $solicitudes.length,
      
      total_rechazadas: $solicitudes.filter(s => 
        s.estado === 'rechazada'
      ).length,
    };
  }
);

/**
 * Acciones del store
 */
export const retirosActions = {
  /**
   * Cargar todas las solicitudes
   */
  async cargarSolicitudes() {
    loading.update(l => ({ ...l, solicitudes: true }));
    error.update(e => ({ ...e, solicitudes: null }));
    
    try {
      const data = await solicitudesService.getAll();
      solicitudes.set(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar solicitudes';
      error.update(e => ({ ...e, solicitudes: mensaje }));
      console.error('Error cargando solicitudes:', err);
    } finally {
      loading.update(l => ({ ...l, solicitudes: false }));
    }
  },

  /**
   * Cargar solicitudes por estado
   */
  async cargarPorEstado(estado: EstadoSolicitud) {
    loading.update(l => ({ ...l, solicitudes: true }));
    error.update(e => ({ ...e, solicitudes: null }));
    
    try {
      const data = await solicitudesService.getByEstado(estado);
      solicitudes.set(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar solicitudes';
      error.update(e => ({ ...e, solicitudes: mensaje }));
      console.error('Error cargando solicitudes por estado:', err);
    } finally {
      loading.update(l => ({ ...l, solicitudes: false }));
    }
  },

  /**
   * Cargar motivos de retiro
   */
  async cargarMotivos() {
    loading.update(l => ({ ...l, motivos: true }));
    error.update(e => ({ ...e, motivos: null }));
    
    try {
      const data = await motivosService.getAll();
      motivos.set(data);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar motivos';
      error.update(e => ({ ...e, motivos: mensaje }));
      console.error('Error cargando motivos:', err);
    } finally {
      loading.update(l => ({ ...l, motivos: false }));
    }
  },

  /**
   * Crear nueva solicitud
   */
  async crearSolicitud(datos: any) {
    loading.update(l => ({ ...l, crear: true }));
    error.update(e => ({ ...e, operacion: null }));
    
    try {
      const nueva = await solicitudesService.create(datos);
      solicitudes.update(s => [nueva, ...s]);
      return nueva;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear solicitud';
      error.update(e => ({ ...e, operacion: mensaje }));
      console.error('Error creando solicitud:', err);
      throw err;
    } finally {
      loading.update(l => ({ ...l, crear: false }));
    }
  },

  /**
   * Derivar solicitud
   */
  async derivarSolicitud(id: number) {
    loading.update(l => ({ ...l, actualizar: true }));
    error.update(e => ({ ...e, operacion: null }));
    
    try {
      const actualizada = await solicitudesService.derivar(id);
      solicitudes.update(s => 
        s.map(sol => sol.id_solicitud === id ? actualizada : sol)
      );
      return actualizada;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al derivar solicitud';
      error.update(e => ({ ...e, operacion: mensaje }));
      console.error('Error derivando solicitud:', err);
      throw err;
    } finally {
      loading.update(l => ({ ...l, actualizar: false }));
    }
  },

  /**
   * Actualizar solicitud
   */
  async actualizarSolicitud(id: number, datos: any) {
    loading.update(l => ({ ...l, actualizar: true }));
    error.update(e => ({ ...e, operacion: null }));
    
    try {
      const actualizada = await solicitudesService.update(id, datos);
      solicitudes.update(s => 
        s.map(sol => sol.id_solicitud === id ? actualizada : sol)
      );
      return actualizada;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar solicitud';
      error.update(e => ({ ...e, operacion: mensaje }));
      console.error('Error actualizando solicitud:', err);
      throw err;
    } finally {
      loading.update(l => ({ ...l, actualizar: false }));
    }
  },

  /**
   * Eliminar solicitud
   */
  async eliminarSolicitud(id: number) {
    loading.update(l => ({ ...l, actualizar: true }));
    error.update(e => ({ ...e, operacion: null }));
    
    try {
      await solicitudesService.delete(id);
      solicitudes.update(s => s.filter(sol => sol.id_solicitud !== id));
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al eliminar solicitud';
      error.update(e => ({ ...e, operacion: mensaje }));
      console.error('Error eliminando solicitud:', err);
      throw err;
    } finally {
      loading.update(l => ({ ...l, actualizar: false }));
    }
  },

  /**
   * Cambiar filtro de estado
   */
  cambiarFiltro(nuevoFiltro: EstadoSolicitud | 'todos') {
    filtroEstado.set(nuevoFiltro);
  },

  /**
   * Limpiar errores
   */
  limpiarErrores() {
    error.set({
      solicitudes: null,
      motivos: null,
      operacion: null
    });
  }
};
