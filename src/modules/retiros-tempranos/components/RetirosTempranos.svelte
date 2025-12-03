<script lang="ts">
  import { onMount } from "svelte";
  import {
    solicitudesFiltradas,
    estadisticas,
    motivos,
    loading,
    error,
    filtroEstado,
    retirosActions,
  } from "../stores/retiros";
  import { registrosService } from "../services/api";
  import {
    getNombreEstudiante,
    getNombreApoderado,
    getEstudiantePorId,
    getApoderadoPorId,
  } from "../data/mockData";
  import {
    Plus,
    Clock,
    Check,
    Calendar,
    X,
    Eye,
    LogOut,
    Users,
  } from "lucide-svelte";

  // Importar componentes UI
  import Card from "$lib/components/ui/Card.svelte";
  import CardHeader from "$lib/components/ui/CardHeader.svelte";
  import CardTitle from "$lib/components/ui/CardTitle.svelte";
  import CardContent from "$lib/components/ui/CardContent.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import Table from "$lib/components/ui/Table.svelte";
  import TableHeader from "$lib/components/ui/TableHeader.svelte";
  import TableBody from "$lib/components/ui/TableBody.svelte";
  import TableRow from "$lib/components/ui/TableRow.svelte";
  import TableHead from "$lib/components/ui/TableHead.svelte";
  import TableCell from "$lib/components/ui/TableCell.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import Label from "$lib/components/ui/Label.svelte";

  // Importar componentes del módulo
  import ModalNuevaSolicitud from "./ModalNuevaSolicitud.svelte";
  import ModalRetiroMasivo from "./ModalRetiroMasivo.svelte";

  let mostrarModal = false;
  let mostrarModalMasivo = false;

  // Rastrear solicitudes que ya tienen registro de salida
  let solicitudesConRegistro = new Set<number>();

  // Cargar datos al montar el componente
  onMount(async () => {
    await retirosActions.cargarSolicitudes();
    await retirosActions.cargarMotivos();
  });

  // Función para obtener nombre de motivo
  function getNombreMotivo(idMotivo: number): string {
    const motivo = $motivos.find((m) => m.id_motivo === idMotivo);
    return motivo?.nombre || `Motivo ${idMotivo}`;
  }

  // Función para obtener el badge según el estado
  function getEstadoBadge(estado: string): {
    variant: "warning" | "success" | "danger" | "default";
    icon: any;
    text: string;
  } {
    switch (estado) {
      case "recibida":
      case "derivada":
        return { variant: "warning" as const, icon: Clock, text: "Pendiente" };
      case "aprobada":
        return { variant: "success" as const, icon: Check, text: "Aprobado" };
      case "rechazada":
        return { variant: "danger" as const, icon: X, text: "Rechazado" };
      case "cancelada":
        return { variant: "default" as const, icon: X, text: "Cancelada" };
      default:
        return { variant: "default" as const, icon: Clock, text: estado };
    }
  }

  // Formatear fecha
  function formatearFecha(fechaISO: string) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Formatear hora
  function formatearHora(fechaISO: string) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Manejar cambio de filtro
  function handleFiltroChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    retirosActions.cambiarFiltro(target.value as any);
  }

  // Aprobar solicitud
  async function aprobarSolicitud(id: number) {
    try {
      await retirosActions.actualizarSolicitud(id, { estado: "aprobada" });
    } catch (err) {
      alert("Error al aprobar solicitud");
    }
  }

  // Rechazar solicitud
  async function rechazarSolicitud(id: number) {
    try {
      await retirosActions.actualizarSolicitud(id, { estado: "rechazada" });
    } catch (err) {
      alert("Error al rechazar solicitud");
    }
  }

  // Derivar solicitud
  async function derivarSolicitud(id: number) {
    try {
      await retirosActions.derivarSolicitud(id);
    } catch (err) {
      alert("Error al derivar solicitud");
    }
  }

  // Registrar salida del estudiante
  async function registrarSalida(idSolicitud: number, idEstudiante: number) {
    const confirmado = confirm(
      "¿Desea registrar la salida del estudiante ahora?"
    );
    if (!confirmado) return;

    try {
      const ahora = new Date().toISOString();

      // Crear el registro con solo los campos que el backend espera
      await registrosService.create({
        id_solicitud: idSolicitud,
        id_estudiante: idEstudiante,
        fecha_hora_salida_real: ahora,
        fecha_hora_retorno_real: null, // Opcional
      });

      // Marcar como registrada para ocultar el botón
      solicitudesConRegistro.add(idSolicitud);
      solicitudesConRegistro = solicitudesConRegistro; // Trigger reactivity

      // Recargar solicitudes para reflejar el cambio
      await retirosActions.cargarSolicitudes();
      alert("✅ Salida registrada exitosamente");
    } catch (err) {
      console.error("Error al registrar salida:", err);
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";

      // Mensaje más específico si ya existe el registro
      if (
        errorMsg.includes("unique") ||
        errorMsg.includes("duplicate") ||
        errorMsg.includes("UNIQUE")
      ) {
        alert("⚠️ Esta solicitud ya tiene un registro de salida.");
        // Marcar como registrada para ocultar el botón
        solicitudesConRegistro.add(idSolicitud);
        solicitudesConRegistro = solicitudesConRegistro;
      } else {
        alert("❌ Error al registrar salida: " + errorMsg);
      }
    }
  }
</script>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-primary mb-2">Retiros Tempranos</h1>
      <p class="text-muted-foreground">
        Gestiona las solicitudes de retiro anticipado
      </p>
    </div>
    <div class="flex gap-2">
      <Button
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
        on:click={() => (mostrarModalMasivo = true)}
      >
        <Users class="w-4 h-4 mr-2" />
        Retiro Masivo
      </Button>
      <Button
        className="bg-accent hover:bg-accent-hover text-white"
        on:click={() => (mostrarModal = true)}
      >
        <Plus class="w-4 h-4 mr-2" />
        Nueva Solicitud
      </Button>
    </div>
  </div>

  <!-- Cards de Resumen -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card className="border-border">
      <CardContent className="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted-foreground mb-1">Pendientes</p>
            <h3 class="text-2xl text-pendiente">
              {$estadisticas.total_pendientes}
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-lg bg-pendiente/20 flex items-center justify-center"
          >
            <Clock class="w-6 h-6 text-pendiente" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-border">
      <CardContent className="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted-foreground mb-1">Aprobados Hoy</p>
            <h3 class="text-2xl text-aprobado">
              {$estadisticas.total_aprobadas_hoy}
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-lg bg-aprobado/20 flex items-center justify-center"
          >
            <Check class="w-6 h-6 text-aprobado" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-border">
      <CardContent className="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted-foreground mb-1">Este Mes</p>
            <h3 class="text-2xl text-info">
              {$estadisticas.total_mes}
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center"
          >
            <Calendar class="w-6 h-6 text-info" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Filtros -->
  <Card className="border-border">
    <CardContent className="p-4">
      <div class="flex items-center space-x-4">
        <Label>Filtrar por estado:</Label>
        <Select
          value={$filtroEstado}
          on:change={handleFiltroChange}
          className="w-48"
        >
          <option value="todos">Todos</option>
          <option value="recibida">Recibidas</option>
          <option value="derivada">Derivadas</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="cancelada">Canceladas</option>
        </Select>
      </div>
    </CardContent>
  </Card>

  <!-- Tabla de Solicitudes -->
  <Card className="border-border">
    <CardHeader>
      <CardTitle className="text-primary">Historial de Solicitudes</CardTitle>
    </CardHeader>
    <CardContent>
      {#if $loading.solicitudes}
        <div class="text-center py-8 text-muted-foreground">
          Cargando solicitudes...
        </div>
      {:else if $error.solicitudes}
        <div class="text-center py-8 text-danger">
          Error: {$error.solicitudes}
        </div>
      {:else if $solicitudesFiltradas.length === 0}
        <div class="text-center py-8 text-muted-foreground">
          No hay solicitudes para mostrar
        </div>
      {:else}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Apoderado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora Salida</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $solicitudesFiltradas as solicitud (solicitud.id_solicitud)}
              {@const badgeInfo = getEstadoBadge(solicitud.estado)}
              <TableRow>
                <TableCell className="text-primary font-medium">
                  {getNombreEstudiante(solicitud.id_estudiante)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getNombreApoderado(solicitud.id_apoderado)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatearFecha(solicitud.fecha_creacion)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatearHora(solicitud.fecha_hora_salida)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getNombreMotivo(solicitud.id_motivo)}
                </TableCell>
                <TableCell>
                  <Badge variant={badgeInfo.variant}>
                    <svelte:component
                      this={badgeInfo.icon}
                      class="w-3 h-3 mr-1"
                    />
                    {badgeInfo.text}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {#if solicitud.estado === "recibida" || solicitud.estado === "derivada"}
                    <div class="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        className="bg-secondary hover:bg-secondary/90 text-white"
                        on:click={() =>
                          aprobarSolicitud(solicitud.id_solicitud)}
                        disabled={$loading.actualizar}
                      >
                        <Check class="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-danger text-danger hover:bg-danger hover:text-white"
                        on:click={() =>
                          rechazarSolicitud(solicitud.id_solicitud)}
                        disabled={$loading.actualizar}
                      >
                        <X class="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  {:else if solicitud.estado === "aprobada"}
                    {#if !solicitudesConRegistro.has(solicitud.id_solicitud)}
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent-hover text-white"
                        on:click={() =>
                          registrarSalida(
                            solicitud.id_solicitud,
                            solicitud.id_estudiante
                          )}
                        disabled={$loading.actualizar}
                      >
                        <LogOut class="w-4 h-4 mr-1" />
                        Registrar Salida
                      </Button>
                    {:else}
                      <div class="text-sm text-success font-medium">
                        ✓ Salida Registrada
                      </div>
                    {/if}
                  {:else}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                    >
                      <Eye class="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      {/if}
    </CardContent>
  </Card>
</div>

<!-- Modal Nueva Solicitud -->
<ModalNuevaSolicitud bind:open={mostrarModal} motivos={$motivos} />

<!-- Modal Retiro Masivo -->
<ModalRetiroMasivo bind:open={mostrarModalMasivo} motivos={$motivos} />
