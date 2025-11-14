# 📋 Módulo de Retiros Tempranos - Frontend

Módulo frontend completo para la gestión de solicitudes de retiro temprano de estudiantes, desarrollado en **Svelte 5 + TypeScript + Tailwind CSS**.

---

## 📁 Estructura del Módulo

```
src/modules/retiros-tempranos/
├── components/
│   ├── RetirosTempranos.svelte      # Componente principal
│   └── ModalNuevaSolicitud.svelte   # Modal para crear solicitud
├── services/
│   └── api.ts                       # Servicios para conectar con backend
├── stores/
│   └── retiros.ts                   # Store de Svelte (estado reactivo)
└── types/
    └── index.ts                     # Tipos TypeScript
```

---

## 🎨 Características Implementadas

### ✅ **Componente Principal**

- **Tabla de solicitudes** con datos en tiempo real
- **Cards de resumen** con estadísticas
- **Filtros por estado** (todos, pendiente, aprobado, rechazado)
- **Acciones por estado**:
  - Pendientes: Botones Aprobar/Rechazar
  - Derivadas: Botón Derivar
  - Finalizadas: Ver detalles
- **Diseño responsive** con Tailwind CSS

### ✅ **Modal de Nueva Solicitud**

- Formulario completo con validación
- Campos:
  - ID Estudiante \*
  - ID Apoderado \*
  - Fecha y hora de salida \*
  - Fecha y hora de retorno (opcional)
  - Motivo (dropdown con datos del backend) \*
  - Observaciones (opcional)
- Validación antes de enviar
- Manejo de errores

### ✅ **Gestión de Estado (Store)**

- **Svelte Stores** para estado reactivo
- Stores principales:
  - `solicitudes`: Lista de todas las solicitudes
  - `motivos`: Lista de motivos de retiro
  - `loading`: Estados de carga
  - `error`: Manejo de errores
  - `filtroEstado`: Filtro activo
- Stores derivados:
  - `solicitudesFiltradas`: Solicitudes según filtro
  - `estadisticas`: Contadores automáticos

### ✅ **Servicio API**

- Conexión completa con backend
- Endpoints implementados:
  - `GET /solicitudes-retiro/` - Listar todas
  - `GET /solicitudes-retiro/{id}` - Obtener una
  - `GET /solicitudes-retiro/estado/{estado}` - Por estado
  - `GET /solicitudes-retiro/estudiante/{id}` - Por estudiante
  - `POST /solicitudes-retiro/` - Crear nueva
  - `PUT /solicitudes-retiro/{id}` - Actualizar
  - `POST /solicitudes-retiro/{id}/derivar` - Derivar
  - `DELETE /solicitudes-retiro/{id}` - Eliminar
  - `GET /motivos-retiro/` - Listar motivos

---

## 🚀 Cómo Usar el Módulo

### **1. Iniciar el Backend**

```bash
cd BRISA-backend
python run.py
```

El backend estará en: `http://localhost:8000`

### **2. Iniciar el Frontend**

```bash
cd BRISA-frontend
npm run dev
```

El frontend estará en: `http://localhost:5173`

### **3. Probar el Módulo**

1. Abre el navegador en `http://localhost:5173`
2. Verás el módulo de Retiros Tempranos
3. Click en "Nueva Solicitud" para crear una
4. Usa los filtros para ver solicitudes por estado
5. Aprueba, rechaza o deriva solicitudes pendientes

---

## 🎨 Paleta de Colores

```css
/* Definidos en tailwind.config.js */
--primary: #0B2E50       /* Azul oscuro - Títulos */
--accent: #27C5DA        /* Celeste - Botones, pendientes */
--secondary: #3AC0B8     /* Verde - Aprobados */
--danger: #EF5C52        /* Rojo - Rechazados */
--info: #7A95D9          /* Azul claro - Info */
```

---

## 📊 Estados de Solicitud

| Estado      | Color   | Descripción             |
| ----------- | ------- | ----------------------- |
| `recibida`  | Celeste | Solicitud recién creada |
| `derivada`  | Celeste | Derivada al regente     |
| `aprobada`  | Verde   | Aprobada por regente    |
| `rechazada` | Rojo    | Rechazada               |
| `cancelada` | Gris    | Cancelada               |

---

## 🔄 Flujo de Trabajo

```
1. CREAR SOLICITUD
   ↓
2. Estado: RECIBIDA (automático)
   ↓
3. Recepcionista → DERIVAR (opcional)
   ↓
4. Estado: DERIVADA
   ↓
5. Regente → APROBAR / RECHAZAR
   ↓
6. Estado: APROBADA / RECHAZADA (final)
```

---

## 🛠️ Tecnologías Usadas

- **Svelte 5** - Framework reactivo
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Lucide Svelte** - Iconos
- **Fetch API** - Llamadas HTTP

---

## 📝 Tipos TypeScript Disponibles

```typescript
// Tipos principales
EstadoSolicitud;
SolicitudRetiroCreate;
SolicitudRetiroUpdate;
SolicitudRetiroResponse;
MotivoRetiro;
Estudiante;
Apoderado;
FiltrosSolicitud;
EstadisticasRetiros;
```

---

## 🔌 Conexión con el Backend

El módulo se conecta automáticamente con:

```
http://localhost:8000/api
```

Si necesitas cambiar la URL, edita:

```typescript
// src/modules/retiros-tempranos/services/api.ts
const API_BASE_URL = "http://localhost:8000/api";
```

---

## ✨ Características Reactivas

Gracias a Svelte Stores:

- ✅ **Actualización automática** de la tabla al crear/editar
- ✅ **Estadísticas en tiempo real**
- ✅ **Filtros reactivos** sin recarga
- ✅ **Estados de carga** visuales
- ✅ **Manejo de errores** centralizado

---

## 🎯 Próximas Mejoras (Opcionales)

- [ ] Búsqueda de estudiantes por nombre
- [ ] Exportar tabla a PDF/Excel
- [ ] Notificaciones en tiempo real
- [ ] Historial de cambios por solicitud
- [ ] Paginación para tablas grandes
- [ ] Filtros avanzados (fecha, curso, etc.)

---

## 📞 Soporte

Para dudas o problemas:

- Backend: `BRISA-backend/README.md`
- Componentes UI: `BRISA-frontend/src/lib/components/ui/`

---

**¡Módulo 100% funcional y listo para usar!** 🚀
