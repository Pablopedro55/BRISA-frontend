<script lang="ts">
  import { retirosActions } from "../stores/retiros";
  import { datosService } from "../services/api";
  import type { MotivoRetiro, Apoderado } from "../types";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Label from "$lib/components/ui/Label.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import Textarea from "$lib/components/ui/Textarea.svelte";
  import { Search } from "lucide-svelte";

  export let open = false;
  export let motivos: MotivoRetiro[] = [];

  // Debug para ver los motivos
  $: console.log(
    "Motivos recibidos en modal:",
    motivos,
    "Cantidad:",
    motivos.length
  );

  // Datos del formulario
  let formData = {
    id_estudiante: "",
    id_apoderado: "",
    id_motivo: "",
    fecha_hora_salida: "",
    fecha_hora_retorno_previsto: "",
    observacion: "",
  };

  let cargando = false;
  let errorMsg = "";
  let apoderadosDisponibles: Apoderado[] = [];
  let buscandoApoderados = false;

  // Buscar apoderados cuando cambia el estudiante
  async function buscarApoderados() {
    if (!formData.id_estudiante || formData.id_estudiante === "") {
      apoderadosDisponibles = [];
      return;
    }

    buscandoApoderados = true;
    errorMsg = "";

    try {
      const idEstudiante = parseInt(formData.id_estudiante);
      const relaciones =
        await datosService.getApoderadosPorEstudiante(idEstudiante);

      // Las relaciones vienen con estructura: { id_estudiante, id_apoderado, apoderado: {...} }
      apoderadosDisponibles = relaciones.map((rel: any) => ({
        id_apoderado: rel.id_apoderado,
        ci: rel.apoderado?.ci || "",
        nombres: rel.apoderado?.nombres || "Sin nombre",
        apellido_paterno: rel.apoderado?.apellido_paterno || "",
        apellido_materno: rel.apoderado?.apellido_materno || "",
        parentesco: rel.parentesco || "",
        telefono: rel.apoderado?.telefono,
        correo: rel.apoderado?.correo,
        direccion: rel.apoderado?.direccion,
      }));

      // Auto-seleccionar si solo hay uno
      if (apoderadosDisponibles.length === 1) {
        formData.id_apoderado =
          apoderadosDisponibles[0].id_apoderado.toString();
      } else {
        formData.id_apoderado = "";
      }
    } catch (error) {
      errorMsg = `No se pudieron cargar los apoderados del estudiante. Verifica que el ID sea correcto.`;
      apoderadosDisponibles = [];
    } finally {
      buscandoApoderados = false;
    }
  }

  // Resetear formulario
  function resetearFormulario() {
    formData = {
      id_estudiante: "",
      id_apoderado: "",
      id_motivo: "",
      fecha_hora_salida: "",
      fecha_hora_retorno_previsto: "",
      observacion: "",
    };
    errorMsg = "";
    apoderadosDisponibles = [];
  }

  // Manejar cierre del modal
  function handleClose() {
    open = false;
    resetearFormulario();
  }

  // Validar formulario
  function validarFormulario() {
    if (!formData.id_estudiante) {
      errorMsg = "Debe ingresar el ID del estudiante";
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
    if (!formData.fecha_hora_salida) {
      errorMsg = "Debe ingresar fecha y hora de salida";
      return false;
    }
    return true;
  }

  // Manejar envío del formulario
  async function handleSubmit() {
    errorMsg = "";

    if (!validarFormulario()) {
      return;
    }

    cargando = true;

    try {
      // Preparar datos para enviar al backend
      const solicitud = {
        id_estudiante: parseInt(formData.id_estudiante),
        id_apoderado: parseInt(formData.id_apoderado),
        id_motivo: parseInt(formData.id_motivo),
        fecha_hora_salida: new Date(formData.fecha_hora_salida).toISOString(),
        fecha_hora_retorno_previsto: formData.fecha_hora_retorno_previsto
          ? new Date(formData.fecha_hora_retorno_previsto).toISOString()
          : undefined,
        observacion: formData.observacion || undefined,
      };

      await retirosActions.crearSolicitud(solicitud);

      // Cerrar modal y resetear
      handleClose();

      // Mostrar mensaje de éxito
      alert("✅ Solicitud creada exitosamente");
    } catch (error) {
      errorMsg =
        error instanceof Error ? error.message : "Error al crear solicitud";
    } finally {
      cargando = false;
    }
  }
</script>

<Modal
  bind:open
  title="Registrar Solicitud de Retiro Temprano"
  className="max-w-2xl"
  on:close={handleClose}
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Fila 1: Estudiante con búsqueda de apoderados -->
    <div class="space-y-2">
      <Label>ID del Estudiante *</Label>
      <div class="flex gap-2">
        <Input
          type="number"
          placeholder="Ej: 1, 2, 3..."
          bind:value={formData.id_estudiante}
          on:blur={buscarApoderados}
          disabled={cargando || buscandoApoderados}
          required
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          on:click={buscarApoderados}
          disabled={cargando || buscandoApoderados || !formData.id_estudiante}
        >
          <Search class="w-4 h-4 mr-2" />
          {buscandoApoderados ? "Buscando..." : "Buscar Apoderados"}
        </Button>
      </div>
      <p class="text-xs text-muted-foreground">
        💡 Ingrese el ID y presione "Buscar" para cargar los apoderados
        autorizados
      </p>
    </div>

    <!-- Fila 2: Apoderado -->
    <div class="space-y-2">
      <Label>Apoderado Autorizado *</Label>
      <Select
        bind:value={formData.id_apoderado}
        disabled={cargando || apoderadosDisponibles.length === 0}
        required
      >
        <option value="">
          {apoderadosDisponibles.length === 0
            ? "Primero busque los apoderados del estudiante"
            : "Seleccione el apoderado"}
        </option>
        {#each apoderadosDisponibles as apoderado (apoderado.id_apoderado)}
          <option value={apoderado.id_apoderado}>
            {apoderado.nombres}
            {apoderado.apellido_paterno}
            {apoderado.apellido_materno}
            {#if apoderado.parentesco}
              ({apoderado.parentesco})
            {/if}
          </option>
        {/each}
      </Select>
      {#if apoderadosDisponibles.length > 0}
        <p class="text-xs text-success">
          ✓ {apoderadosDisponibles.length} apoderado(s) autorizado(s) encontrado(s)
        </p>
      {/if}
    </div>

    <!-- Fila 3: Motivo -->
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
    </div>

    <!-- Fila 4: Fechas -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>Fecha y Hora de Salida *</Label>
        <Input
          type="datetime-local"
          bind:value={formData.fecha_hora_salida}
          disabled={cargando}
          required
        />
      </div>

      <div class="space-y-2">
        <Label>Fecha y Hora de Retorno (Opcional)</Label>
        <Input
          type="datetime-local"
          bind:value={formData.fecha_hora_retorno_previsto}
          disabled={cargando}
        />
      </div>
    </div>

    <!-- Fila 5: Observaciones -->
    <div class="space-y-2">
      <Label>Observaciones</Label>
      <Textarea
        placeholder="Detalles adicionales sobre la solicitud..."
        bind:value={formData.observacion}
        disabled={cargando}
        rows={4}
      />
    </div>

    <!-- Mensaje de error -->
    {#if errorMsg}
      <div
        class="p-3 bg-danger/10 border border-danger text-danger rounded-lg text-sm"
      >
        ❌ {errorMsg}
      </div>
    {/if}

    <!-- Botones -->
    <div class="flex space-x-2 pt-4">
      <Button
        type="submit"
        className="flex-1 bg-accent hover:bg-accent-hover text-white"
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
