<script lang="ts">
  import { retirosActions } from "../stores/retiros";
  import type { MotivoRetiro, Estudiante, Apoderado } from "../types";
  import {
    buscarEstudiantesPorNombre,
    getApoderadosDeEstudiante,
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
    Camera,
  } from "lucide-svelte";
  import { onDestroy } from "svelte";

  export let open = false;
  export let motivos: MotivoRetiro[] = [];

  // Estado del formulario
  let terminoBusqueda = "";
  let estudiantesEncontrados: Estudiante[] = [];
  let estudianteSeleccionado: Estudiante | null = null;
  let apoderadosDisponibles: (Apoderado & {
    parentesco: string;
    es_contacto_principal: boolean;
  })[] = [];

  let formData = {
    id_apoderado: "",
    id_motivo: "",
    motivo_otro: "",
    hora_salida: "",
    fecha_hora_retorno_previsto: "",
    observacion: "",
  };

  let cargando = false;
  let errorMsg = "";
  let mostrandoResultados = false;

  // Estado de cámara / foto (opcional)
  let cameraOpen = false;
  let cameraStream: MediaStream | null = null;
  let cameraError = "";
  let videoElement: HTMLVideoElement | null = null;
  let photoPreview: string | null = null; // preview dentro de la UI de cámara
  let fotoSolicitud: string | null = null; // foto aceptada que se muestra en el formulario

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

    estudiantesEncontrados = buscarEstudiantesPorNombre(terminoBusqueda);
    mostrandoResultados = true;
  }

  function seleccionarEstudiante(estudiante: Estudiante) {
    estudianteSeleccionado = estudiante;
    terminoBusqueda = `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`;
    mostrandoResultados = false;
    estudiantesEncontrados = [];

    apoderadosDisponibles = getApoderadosDeEstudiante(estudiante.id_estudiante);

    if (apoderadosDisponibles.length === 1) {
      formData.id_apoderado = apoderadosDisponibles[0].id_apoderado.toString();
    } else {
      formData.id_apoderado = "";
    }
  }

  function limpiarSeleccion() {
    estudianteSeleccionado = null;
    terminoBusqueda = "";
    apoderadosDisponibles = [];
    formData.id_apoderado = "";
  }

  function esMotivoOtro(): boolean {
    if (!formData.id_motivo) return false;
    const motivo = motivos.find(
      (m) => m.id_motivo === parseInt(formData.id_motivo)
    );
    return motivo?.nombre.toLowerCase().includes("otro") || false;
  }

  function detenerStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
  }

  onDestroy(detenerStream);

  function resetearFormulario() {
    terminoBusqueda = "";
    estudiantesEncontrados = [];
    estudianteSeleccionado = null;
    apoderadosDisponibles = [];
    mostrandoResultados = false;
    formData = {
      id_apoderado: "",
      id_motivo: "",
      motivo_otro: "",
      hora_salida: "",
      fecha_hora_retorno_previsto: "",
      observacion: "",
    };
    errorMsg = "";

    // limpiar estado de cámara / foto
    fotoSolicitud = null;
    photoPreview = null;
    cameraOpen = false;
    cameraError = "";
    detenerStream();
  }

  function handleClose() {
    open = false;
    resetearFormulario();
  }

  function validarFormulario(): boolean {
    errorMsg = "";

    if (!estudianteSeleccionado) {
      errorMsg = "Debe seleccionar un estudiante";
      return false;
    }
    if (!formData.id_apoderado) {
      errorMsg = "Debe seleccionar un apoderado autorizado";
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

    try {
      const fechaHoy = getFechaActual();
      const fechaHoraSalida = new Date(
        `${fechaHoy}T${formData.hora_salida}:00`
      );

      let observacion = formData.observacion || "";
      if (esMotivoOtro() && formData.motivo_otro) {
        observacion = `Motivo especificado: ${formData.motivo_otro}${
          observacion ? `. ${observacion}` : ""
        }`;
      }

      const solicitud = {
        id_estudiante: estudianteSeleccionado!.id_estudiante,
        id_apoderado: parseInt(formData.id_apoderado),
        id_motivo: parseInt(formData.id_motivo),
        fecha_hora_salida: fechaHoraSalida.toISOString(),
        fecha_hora_retorno_previsto: formData.fecha_hora_retorno_previsto
          ? new Date(formData.fecha_hora_retorno_previsto).toISOString()
          : undefined,
        observacion: observacion || undefined,
        // foto: fotoSolicitud, // ← cuando tengas campo en el backend, se puede enviar aquí
      };

      await retirosActions.crearSolicitud(solicitud);
      handleClose();
      alert("✅ Solicitud creada exitosamente");
    } catch (error) {
      errorMsg =
        error instanceof Error ? error.message : "Error al crear solicitud";
    } finally {
      cargando = false;
    }
  }

  // --- Lógica de cámara ---

  async function abrirCamara() {
    cameraError = "";
    photoPreview = null;
    cameraOpen = true;

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraError = "Este navegador no soporta captura de cámara.";
      return;
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch (error) {
      cameraError =
        error instanceof Error
          ? `No se pudo acceder a la cámara: ${error.message}`
          : "No se pudo acceder a la cámara. Revise los permisos.";
    }
  }

  function capturarFoto() {
    if (!videoElement) return;

    const canvas = document.createElement("canvas");
    const width = videoElement.videoWidth || 640;
    const height = videoElement.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0, width, height);
    photoPreview = canvas.toDataURL("image/jpeg");
    detenerStream();
  }

  function cerrarCamara() {
    cameraOpen = false;
    cameraError = "";
    photoPreview = null;
    detenerStream();
  }

  function reintentarFoto() {
    photoPreview = null;
    cameraError = "";
    detenerStream();
    abrirCamara();
  }

function aceptarFoto() {
  if (!photoPreview) return;
  fotoSolicitud = photoPreview;
  cameraOpen = false;
  cameraError = "";
  alert(
    "Foto registrada correctamente."
  );
}


  // Asignar stream al <video> cuando exista
  $: if (cameraOpen && cameraStream && videoElement) {
    videoElement.srcObject = cameraStream;
  }

  $: validacionHora = formData.hora_salida
    ? validarHora(formData.hora_salida)
    : { valido: true, mensaje: "" };
</script>

<Modal
  bind:open
  title="Registrar Solicitud de Retiro Temprano"
  className="max-w-2xl"
  on:close={handleClose}
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Buscar Estudiante por Nombre -->
    <div class="space-y-2">
      <Label class="flex items-center gap-2">
        <User class="w-4 h-4" />
        Buscar Estudiante *
      </Label>
      <div class="relative">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Input
              type="text"
              placeholder="Escriba el nombre del estudiante..."
              bind:value={terminoBusqueda}
              on:input={buscarEstudiantes}
              on:focus={() => {
                if (terminoBusqueda.length >= 2) mostrandoResultados = true;
              }}
              disabled={cargando || estudianteSeleccionado !== null}
              className="pr-10"
            />
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
          </div>
          {#if estudianteSeleccionado}
            <Button
              type="button"
              variant="outline"
              on:click={limpiarSeleccion}
              disabled={cargando}
            >
              Cambiar
            </Button>
          {/if}
        </div>

        <!-- Lista de resultados de búsqueda -->
        {#if mostrandoResultados && estudiantesEncontrados.length > 0}
          <div
            class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {#each estudiantesEncontrados as estudiante (estudiante.id_estudiante)}
              <button
                type="button"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                on:click={() => seleccionarEstudiante(estudiante)}
              >
                <div class="font-medium text-gray-900">
                  {estudiante.nombres} {estudiante.apellido_paterno}
                  {estudiante.apellido_materno}
                </div>
                <div class="text-sm text-gray-500 flex gap-3">
                  <span>CI: {estudiante.ci}</span>
                  {#if estudiante.curso}
                    <span>• {estudiante.curso}</span>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}

        {#if mostrandoResultados && terminoBusqueda.length >= 2 && estudiantesEncontrados.length === 0}
          <div
            class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500"
          >
            No se encontraron estudiantes con ese nombre
          </div>
        {/if}
      </div>

      <!-- Estudiante seleccionado -->
      {#if estudianteSeleccionado}
        <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2 text-green-800">
            <User class="w-4 h-4" />
            <span class="font-medium">
              {estudianteSeleccionado.nombres}
              {estudianteSeleccionado.apellido_paterno}
              {estudianteSeleccionado.apellido_materno}
            </span>
          </div>
          <div class="text-sm text-green-600 mt-1">
            CI: {estudianteSeleccionado.ci}
            {#if estudianteSeleccionado.curso}
              • {estudianteSeleccionado.curso}
            {/if}
          </div>
        </div>
      {/if}

      <p class="text-xs text-gray-500">
        💡 Escriba al menos 2 caracteres para buscar por nombre o CI
      </p>
    </div>

    <!-- Seleccionar Apoderado -->
    <div class="space-y-2">
      <Label class="flex items-center gap-2">
        <Users class="w-4 h-4" />
        Apoderado Autorizado *
      </Label>
      <Select
        bind:value={formData.id_apoderado}
        disabled={cargando || apoderadosDisponibles.length === 0}
        required
      >
        <option value="">
          {apoderadosDisponibles.length === 0
            ? "Primero seleccione un estudiante"
            : "Seleccione el apoderado"}
        </option>
        {#each apoderadosDisponibles as apoderado (apoderado.id_apoderado)}
          <option value={apoderado.id_apoderado}>
            {apoderado.nombres} {apoderado.apellidos} ({apoderado.parentesco})
            {apoderado.es_contacto_principal ? " ⭐" : ""}
          </option>
        {/each}
      </Select>
      {#if apoderadosDisponibles.length > 0}
        <p class="text-xs text-green-600">
          ✓ {apoderadosDisponibles.length} apoderado(s) autorizado(s) encontrado(s)
          {#if apoderadosDisponibles.some((a) => a.es_contacto_principal)}
            • ⭐ = Contacto principal
          {/if}
        </p>
      {/if}
    </div>

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

      <!-- Campo adicional si se selecciona "Otro" -->
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

    <!-- Hora de Salida con validaciones -->
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

    <!-- Fecha y Hora de Retorno (Opcional) -->
    <div class="space-y-2">
      <Label>Fecha y Hora de Retorno (Opcional)</Label>
      <Input
        type="datetime-local"
        bind:value={formData.fecha_hora_retorno_previsto}
        disabled={cargando}
      />
      <p class="text-xs text-gray-500">
        Dejar vacío si no se conoce la hora de retorno
      </p>
    </div>

    <!-- Observaciones -->
    <div class="space-y-2">
      <Label>Observaciones</Label>
      <Textarea
        placeholder="Detalles adicionales sobre la solicitud..."
        bind:value={formData.observacion}
        disabled={cargando}
        rows={3}
      />
    </div>

        <!-- Foto opcional de referencia -->
    <div class="space-y-2">
      <Label class="flex items-center gap-2">
        <Camera class="w-4 h-4" />
        Foto opcional de referencia
      </Label>

      <div class="flex flex-col items-center gap-3 w-full">
        <!-- Área grande para tomar foto -->
        <button
          type="button"
          class="w-full max-w-sm aspect-video rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors bg-gray-50"
          on:click={abrirCamara}
          disabled={cargando}
        >
          <Camera class="w-8 h-8 mb-2" />
          <span>Tomar foto</span>
          <span class="text-[11px] mt-1 text-gray-400">Opcional</span>
        </button>

        {#if fotoSolicitud}
          <!-- Preview de la foto aceptada -->
          <div class="flex flex-col items-center gap-2 w-full max-w-sm">
            <img
              src={fotoSolicitud}
              alt="Foto tomada para la solicitud"
              class="w-full aspect-video object-cover rounded border"
            />
            <div class="flex items-center justify-between w-full gap-2">
              <span class="text-[11px] text-gray-500">
                Foto registrada para esta solicitud (solo en esta sesión).
              </span>
              <Button
                type="button"
                variant="ghost"
                className="text-xs px-2 py-1"
                on:click={() => (fotoSolicitud = null)}
                disabled={cargando}
              >
                Quitar foto
              </Button>
            </div>
          </div>
        {:else}
          <!-- Descripción pequeña debajo, centrada -->
          <p class="text-xs text-gray-500 text-center max-w-sm">
            Puede tomar una foto como respaldo visual del retiro.
          </p>
        {/if}
      </div>
    </div>


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
        disabled={cargando}
      >
        {cargando ? "Guardando..." : "Registrar Solicitud"}
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

{#if cameraOpen}
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
  >
    <div
      class="bg-white rounded-xl shadow-xl w-full max-w-md p-4 space-y-4 mx-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Camera class="w-5 h-5" />
          <h2 class="text-sm font-semibold">
            Tomar foto de referencia
          </h2>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 text-sm"
          on:click={cerrarCamara}
        >
          Cerrar
        </button>
      </div>

      {#if cameraError}
        <p class="text-sm text-red-600">
          {cameraError}
        </p>
      {/if}

      {#if photoPreview}
        <!-- Vista previa de la foto tomada -->
        <div class="space-y-3">
          <div
            class="aspect-video rounded-lg overflow-hidden border bg-black/5 flex items-center justify-center"
          >
            <img
              src={photoPreview}
              alt="Foto tomada"
              class="w-full h-full object-contain"
            />
          </div>
          <p class="text-xs text-gray-500">
            Verifique que la imagen sea legible antes de aceptar.
          </p>
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              on:click={reintentarFoto}
            >
              Reintentar
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              on:click={aceptarFoto}
            >
              Aceptar
            </Button>
          </div>
        </div>
      {:else}
        <!-- Cámara activa para tomar la foto -->
        <div
          class="aspect-video bg-black/5 rounded-lg overflow-hidden flex items-center justify-center"
        >
          {#if cameraStream}
            <video
              bind:this={videoElement}
              autoplay
              playsinline
              class="w-full h-full object-cover"
            />
          {:else}
            <p class="text-xs text-gray-500">
              Activando cámara...
            </p>
          {/if}
        </div>

        <div class="flex justify-between items-center mt-3">
          <Button
            type="button"
            variant="outline"
            on:click={cerrarCamara}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            on:click={capturarFoto}
            disabled={!cameraStream || !!cameraError}
          >
            Sacar foto
          </Button>
        </div>
      {/if}
    </div>
  </div>
{/if}
