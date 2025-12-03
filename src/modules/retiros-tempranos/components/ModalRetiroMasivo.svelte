<script lang="ts">
  import { retirosActions } from "../stores/retiros";
  import type { MotivoRetiro, Estudiante, Apoderado } from "../types";
  import {
    buscarEstudiantesPorNombre,
    getApoderadosDeEstudiante,
    getEstudiantePorId,
  } from "../data/mockData";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Label from "$lib/components/ui/Label.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import Textarea from "$lib/components/ui/Textarea.svelte";
  import {
    Search,
    Clock,
    AlertCircle,
    User,
    Users,
    X,
    Plus,
    Trash2,
  } from "lucide-svelte";

  export let open = false;
  export let motivos: MotivoRetiro[] = [];

  // Estado de la lista de estudiantes a retirar
  interface EstudianteRetiro {
    estudiante: Estudiante;
    apoderadosDisponibles: (Apoderado & {
      parentesco: string;
      es_contacto_principal: boolean;
    })[];
    id_apoderado: string;
  }

  let estudiantesRetiro: EstudianteRetiro[] = [];

  // Estado para buscar estudiantes
  let terminoBusqueda = "";
  let estudiantesEncontrados: Estudiante[] = [];
  let mostrandoResultados = false;

  // Datos comunes del formulario
  let formData = {
    id_motivo: "",
    motivo_otro: "",
    hora_salida: "",
    observacion: "",
  };

  let cargando = false;
  let errorMsg = "";
  let resultados: {
    exitosos: number;
    fallidos: number;
    errores: string[];
  } | null = null;

  // Constantes para validación de horario escolar
  const HORA_MINIMA = "07:00";
  const HORA_MAXIMA = "16:00";

  function getHoraActual(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  }

  function getFechaActual(): string {
    return new Date().toISOString().split("T")[0];
  }

  function validarHora(hora: string): { valido: boolean; mensaje: string } {
    if (!hora) {
      return { valido: false, mensaje: "Debe seleccionar una hora" };
    }

    const horaActual = getHoraActual();

    if (hora > horaActual) {
      return {
        valido: false,
        mensaje: `La hora no puede ser futura. Hora actual: ${horaActual}`,
      };
    }

    if (hora < HORA_MINIMA) {
      return {
        valido: false,
        mensaje: `La hora no puede ser antes de las ${HORA_MINIMA}`,
      };
    }

    if (hora > HORA_MAXIMA) {
      return {
        valido: false,
        mensaje: `La hora no puede ser después de las ${HORA_MAXIMA}`,
      };
    }

    return { valido: true, mensaje: "" };
  }

  function buscarEstudiantes() {
    if (terminoBusqueda.trim().length < 2) {
      estudiantesEncontrados = [];
      mostrandoResultados = false;
      return;
    }

    // Filtrar estudiantes que ya están en la lista
    const idsExistentes = estudiantesRetiro.map(
      (e) => e.estudiante.id_estudiante
    );
    estudiantesEncontrados = buscarEstudiantesPorNombre(terminoBusqueda).filter(
      (e) => !idsExistentes.includes(e.id_estudiante)
    );
    mostrandoResultados = true;
  }

  function agregarEstudiante(estudiante: Estudiante) {
    // Verificar que no esté ya en la lista
    if (
      estudiantesRetiro.some(
        (e) => e.estudiante.id_estudiante === estudiante.id_estudiante
      )
    ) {
      return;
    }

    const apoderadosDisponibles = getApoderadosDeEstudiante(
      estudiante.id_estudiante
    );

    estudiantesRetiro = [
      ...estudiantesRetiro,
      {
        estudiante,
        apoderadosDisponibles,
        id_apoderado:
          apoderadosDisponibles.length === 1
            ? apoderadosDisponibles[0].id_apoderado.toString()
            : "",
      },
    ];

    // Limpiar búsqueda
    terminoBusqueda = "";
    estudiantesEncontrados = [];
    mostrandoResultados = false;
  }

  function quitarEstudiante(index: number) {
    estudiantesRetiro = estudiantesRetiro.filter((_, i) => i !== index);
  }

  function esMotivoOtro(): boolean {
    if (!formData.id_motivo) return false;
    const motivo = motivos.find(
      (m) => m.id_motivo === parseInt(formData.id_motivo)
    );
    return motivo?.nombre.toLowerCase().includes("otro") || false;
  }

  function resetearFormulario() {
    terminoBusqueda = "";
    estudiantesEncontrados = [];
    estudiantesRetiro = [];
    mostrandoResultados = false;
    formData = {
      id_motivo: "",
      motivo_otro: "",
      hora_salida: "",
      observacion: "",
    };
    errorMsg = "";
    resultados = null;
  }

  function handleClose() {
    open = false;
    resetearFormulario();
  }

  function validarFormulario(): boolean {
    errorMsg = "";

    if (estudiantesRetiro.length === 0) {
      errorMsg = "Debe agregar al menos un estudiante";
      return false;
    }

    // Verificar que todos los estudiantes tengan apoderado seleccionado
    const sinApoderado = estudiantesRetiro.filter((e) => !e.id_apoderado);
    if (sinApoderado.length > 0) {
      errorMsg = `Debe seleccionar apoderado para todos los estudiantes (${sinApoderado.length} pendiente(s))`;
      return false;
    }

    if (!formData.id_motivo) {
      errorMsg = "Debe seleccionar un motivo";
      return false;
    }
    if (esMotivoOtro() && !formData.motivo_otro.trim()) {
      errorMsg = "Debe especificar el motivo";
      return false;
    }
    if (!formData.hora_salida) {
      errorMsg = "Debe ingresar la hora de salida";
      return false;
    }

    const validacionHora = validarHora(formData.hora_salida);
    if (!validacionHora.valido) {
      errorMsg = validacionHora.mensaje;
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validarFormulario()) {
      return;
    }

    cargando = true;
    resultados = { exitosos: 0, fallidos: 0, errores: [] };

    try {
      const fechaHoy = getFechaActual();
      const fechaHoraSalida = new Date(
        `${fechaHoy}T${formData.hora_salida}:00`
      );

      let observacion = formData.observacion || "";
      if (esMotivoOtro() && formData.motivo_otro) {
        observacion = `Motivo especificado: ${formData.motivo_otro}${observacion ? `. ${observacion}` : ""}`;
      }

      // Procesar cada estudiante
      for (const item of estudiantesRetiro) {
        try {
          const solicitud = {
            id_estudiante: item.estudiante.id_estudiante,
            id_apoderado: parseInt(item.id_apoderado),
            id_motivo: parseInt(formData.id_motivo),
            fecha_hora_salida: fechaHoraSalida.toISOString(),
            observacion: observacion || undefined,
          };

          await retirosActions.crearSolicitud(solicitud);
          resultados.exitosos++;
        } catch (error) {
          resultados.fallidos++;
          const nombreEstudiante = `${item.estudiante.nombres} ${item.estudiante.apellido_paterno}`;
          const errorMsg =
            error instanceof Error ? error.message : "Error desconocido";
          resultados.errores.push(`${nombreEstudiante}: ${errorMsg}`);
        }
      }

      // Mostrar resumen
      if (resultados.fallidos === 0) {
        alert(
          `✅ Se crearon ${resultados.exitosos} solicitud(es) exitosamente`
        );
        handleClose();
      } else {
        // Mantener modal abierto si hubo errores
        errorMsg = `Se procesaron ${resultados.exitosos} solicitud(es) con éxito y ${resultados.fallidos} fallaron.`;
      }
    } catch (error) {
      errorMsg =
        error instanceof Error
          ? error.message
          : "Error al procesar solicitudes";
    } finally {
      cargando = false;
    }
  }

  $: validacionHora = formData.hora_salida
    ? validarHora(formData.hora_salida)
    : { valido: true, mensaje: "" };
</script>

<Modal
  bind:open
  title="Retiro Masivo de Estudiantes"
  className="max-w-3xl"
  on:close={handleClose}
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Buscar y agregar estudiantes -->
    <div class="space-y-2">
      <Label class="flex items-center gap-2">
        <Plus class="w-4 h-4" />
        Agregar Estudiantes
      </Label>
      <div class="relative">
        <div class="relative">
          <Input
            type="text"
            placeholder="Buscar estudiante por nombre..."
            bind:value={terminoBusqueda}
            on:input={buscarEstudiantes}
            on:focus={() => {
              if (terminoBusqueda.length >= 2) mostrandoResultados = true;
            }}
            disabled={cargando}
            className="pr-10"
          />
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        </div>

        <!-- Lista de resultados de búsqueda -->
        {#if mostrandoResultados && estudiantesEncontrados.length > 0}
          <div
            class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto"
          >
            {#each estudiantesEncontrados as estudiante (estudiante.id_estudiante)}
              <button
                type="button"
                class="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
                on:click={() => agregarEstudiante(estudiante)}
              >
                <div>
                  <div class="font-medium text-gray-900">
                    {estudiante.nombres}
                    {estudiante.apellido_paterno}
                    {estudiante.apellido_materno}
                  </div>
                  <div class="text-xs text-gray-500">
                    CI: {estudiante.ci}
                    {#if estudiante.curso}
                      • {estudiante.curso}
                    {/if}
                  </div>
                </div>
                <Plus class="w-4 h-4 text-blue-600" />
              </button>
            {/each}
          </div>
        {/if}

        {#if mostrandoResultados && terminoBusqueda.length >= 2 && estudiantesEncontrados.length === 0}
          <div
            class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-gray-500 text-sm"
          >
            No se encontraron estudiantes
          </div>
        {/if}
      </div>
    </div>

    <!-- Lista de estudiantes a retirar -->
    <div class="space-y-2">
      <Label class="flex items-center justify-between">
        <span class="flex items-center gap-2">
          <Users class="w-4 h-4" />
          Estudiantes a Retirar ({estudiantesRetiro.length})
        </span>
      </Label>

      {#if estudiantesRetiro.length === 0}
        <div
          class="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500"
        >
          <Users class="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No hay estudiantes agregados</p>
          <p class="text-xs mt-1">
            Busque y agregue estudiantes para el retiro masivo
          </p>
        </div>
      {:else}
        <div class="space-y-2 max-h-48 overflow-auto">
          {#each estudiantesRetiro as item, index (item.estudiante.id_estudiante)}
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <User class="w-4 h-4 text-gray-500" />
                    <span class="font-medium text-gray-900">
                      {item.estudiante.nombres}
                      {item.estudiante.apellido_paterno}
                      {item.estudiante.apellido_materno}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 ml-6">
                    {#if item.estudiante.curso}
                      {item.estudiante.curso}
                    {/if}
                  </div>
                </div>
                <button
                  type="button"
                  class="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  on:click={() => quitarEstudiante(index)}
                  disabled={cargando}
                  title="Quitar estudiante"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Selección de apoderado -->
              <div class="mt-2 ml-6">
                <select
                  class="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  bind:value={item.id_apoderado}
                  disabled={cargando}
                >
                  <option value="">Seleccione apoderado...</option>
                  {#each item.apoderadosDisponibles as apoderado (apoderado.id_apoderado)}
                    <option value={apoderado.id_apoderado}>
                      {apoderado.nombres}
                      {apoderado.apellidos} ({apoderado.parentesco})
                      {apoderado.es_contacto_principal ? "⭐" : ""}
                    </option>
                  {/each}
                </select>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Datos comunes del retiro -->
    <div class="border-t pt-4 space-y-4">
      <h3 class="font-medium text-gray-700">Datos comunes del retiro</h3>

      <!-- Motivo del Retiro -->
      <div class="space-y-2">
        <Label>Motivo del Retiro *</Label>
        <Select bind:value={formData.id_motivo} disabled={cargando} required>
          <option value="">Seleccione el motivo</option>
          {#each motivos as motivo (motivo.id_motivo)}
            {#if motivo.activo}
              <option value={motivo.id_motivo}>
                {motivo.nombre}
              </option>
            {/if}
          {/each}
        </Select>

        {#if esMotivoOtro()}
          <div class="mt-2">
            <Label class="text-sm">Especifique el motivo *</Label>
            <Input
              type="text"
              placeholder="Describa el motivo del retiro..."
              bind:value={formData.motivo_otro}
              disabled={cargando}
              required
              className="mt-1"
            />
          </div>
        {/if}
      </div>

      <!-- Hora de Salida -->
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          <Clock class="w-4 h-4" />
          Hora de Salida *
        </Label>
        <Input
          type="time"
          bind:value={formData.hora_salida}
          disabled={cargando}
          required
          min={HORA_MINIMA}
          max={getHoraActual()}
          className={!validacionHora.valido && formData.hora_salida
            ? "border-red-500"
            : ""}
        />
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">
            Horario escolar: {HORA_MINIMA} - {HORA_MAXIMA}
          </span>
          <span class="text-gray-500">
            Hora actual: {getHoraActual()}
          </span>
        </div>
        {#if !validacionHora.valido && formData.hora_salida}
          <div class="flex items-center gap-1 text-red-500 text-sm">
            <AlertCircle class="w-4 h-4" />
            {validacionHora.mensaje}
          </div>
        {/if}
      </div>

      <!-- Observaciones -->
      <div class="space-y-2">
        <Label>Observaciones</Label>
        <Textarea
          placeholder="Observaciones comunes para todos los retiros..."
          bind:value={formData.observacion}
          disabled={cargando}
          rows={2}
        />
      </div>
    </div>

    <!-- Resultados de procesamiento -->
    {#if resultados && resultados.errores.length > 0}
      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="font-medium text-yellow-800 mb-2">
          Algunos registros fallaron:
        </div>
        <ul class="text-sm text-yellow-700 list-disc list-inside">
          {#each resultados.errores as error}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Mensaje de error -->
    {#if errorMsg}
      <div
        class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        {errorMsg}
      </div>
    {/if}

    <!-- Botones -->
    <div class="flex gap-2 pt-4 border-t">
      <Button
        type="submit"
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        disabled={cargando || estudiantesRetiro.length === 0}
      >
        {#if cargando}
          Procesando...
        {:else}
          Registrar {estudiantesRetiro.length} Retiro{estudiantesRetiro.length !==
          1
            ? "s"
            : ""}
        {/if}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        on:click={handleClose}
        disabled={cargando}
      >
        Cancelar
      </Button>
    </div>
  </form>
</Modal>
