# 🧪 GUÍA DE PRUEBAS - Módulo Retiros Tempranos

## Pre-requisitos

- ✅ Backend corriendo en `http://localhost:8000`
- ✅ Frontend corriendo en `http://localhost:5174`
- ✅ Base de datos con datos de prueba (ejecutar `seed_data.sql`)

---

## 1️⃣ PRUEBA DE CARGA INICIAL

### Objetivo

Verificar que la aplicación carga correctamente y muestra los datos desde el backend.

### Pasos

1. Abrir navegador en `http://localhost:5174`
2. Abrir DevTools (F12) → pestaña Console
3. Verificar que NO hay errores en rojo
4. Verificar elementos visuales:
   - ✅ Título "Retiros Tempranos" en azul (#0B2E50)
   - ✅ 3 tarjetas de estadísticas con iconos
   - ✅ Filtros (selector de estado + buscador)
   - ✅ Botón "Nueva Solicitud" en cyan (#27C5DA)
   - ✅ Tabla con columnas: Estudiante, Motivo, Fecha Solicitud, Estado, Acciones

### ✅ Resultado Esperado

- UI completamente estilizada con colores BRISA
- Datos cargados desde API (ver en Console: "Solicitudes cargadas")
- Sin errores 404 o CORS

### ❌ Posibles Problemas

- **Tabla vacía**: No hay solicitudes en BD → Crear una nueva
- **Error CORS**: Backend no permite localhost:5174 → Verificar config CORS
- **Error 404**: API_BASE_URL incorrecta → Verificar `services/api.ts`

---

## 2️⃣ PRUEBA DE FILTROS

### Objetivo

Verificar que los filtros funcionan reactivamente.

### Pasos

1. **Filtro por Estado**:
   - Cambiar selector a "Pendiente"
   - ✅ Debe mostrar solo solicitudes pendientes
   - ✅ Badge amarillo con icono de reloj
2. **Filtro por Estado - Aprobado**:

   - Cambiar a "Aprobado"
   - ✅ Debe mostrar solo aprobadas
   - ✅ Badge verde con check

3. **Buscador**:

   - Escribir nombre de estudiante (ej: "María")
   - ✅ Filtra en tiempo real
   - ✅ Busca en nombre completo

4. **Combinar filtros**:
   - Estado: "Pendiente" + Búsqueda: "Juan"
   - ✅ Debe mostrar solo pendientes de Juan

### ✅ Resultado Esperado

- Filtros reactivos sin recargar página
- Tabla se actualiza instantáneamente
- Estadísticas en cards se actualizan

---

## 3️⃣ PRUEBA CREAR NUEVA SOLICITUD

### Objetivo

Crear una solicitud de retiro temprano completa.

### Pasos

1. Clic en botón **"Nueva Solicitud"**
2. ✅ Se abre modal con formulario
3. Llenar campos:
   ```
   Estudiante: Seleccionar de lista (ej: María González)
   Apoderado Autorizado: Seleccionar de lista
   Motivo: Seleccionar (ej: "Cita médica")
   Fecha Solicitada: Mañana
   Hora Salida: 10:00
   Hora Retorno: 14:00
   Observaciones: "Cita con dentista"
   ```
4. Clic en **"Crear Solicitud"**
5. ✅ Modal se cierra
6. ✅ Aparece mensaje de éxito (toast/alert)
7. ✅ Nueva solicitud visible en tabla con estado "Pendiente"

### ✅ Resultado Esperado

- POST a `/api/retiros-tempranos/solicitudes` exitoso
- Solicitud creada en BD con estado `pendiente`
- Tabla se recarga automáticamente
- Estadísticas actualizadas (+1 en Pendientes)

### ❌ Posibles Problemas

- **Dropdowns vacíos**: No hay estudiantes/apoderados → Ejecutar seed_data.sql
- **Error 500**: Validación fallida en backend → Ver logs de FastAPI
- **No se guarda**: Verificar que el endpoint POST funciona

---

## 4️⃣ PRUEBA APROBAR SOLICITUD

### Objetivo

Cambiar estado de solicitud de Pendiente → Aprobado.

### Pasos

1. En tabla, encontrar solicitud con estado **"Pendiente"**
2. Clic en botón **"Aprobar"** (verde con ícono de check)
3. ✅ Botón muestra "Cargando..." brevemente
4. ✅ Solicitud desaparece de vista "Pendiente"
5. Cambiar filtro a **"Aprobado"**
6. ✅ Solicitud ahora aparece con badge verde

### ✅ Resultado Esperado

- PATCH a `/api/retiros-tempranos/solicitudes/{id}` con `estado: "aprobado"`
- Estado actualizado en BD
- Card "Pendientes" decrementa en 1
- Card "Aprobados" incrementa en 1

### 📝 Verificar en Backend

Abrir navegador en `http://localhost:8000/docs` → Probar GET solicitud por ID

---

## 5️⃣ PRUEBA RECHAZAR SOLICITUD

### Objetivo

Rechazar una solicitud pendiente con motivo.

### Pasos

1. Solicitud con estado **"Pendiente"**
2. Clic en **"Rechazar"** (rojo con X)
3. ✅ Se abre diálogo/prompt para motivo
4. Ingresar: "Documentación incompleta"
5. Confirmar
6. ✅ Estado cambia a "Rechazado"
7. ✅ Badge rojo con X

### ✅ Resultado Esperado

- PATCH con `estado: "rechazado"` y `observaciones`
- Solicitud marcada como rechazada en BD
- No se puede aprobar después de rechazar

---

## 6️⃣ PRUEBA DERIVAR A DIRECTOR

### Objetivo

Derivar solicitud que requiere aprobación de director.

### Pasos

1. Solicitud **"Pendiente"**
2. Clic en **"Derivar al Director"**
3. ✅ Estado cambia a **"Derivado"**
4. ✅ Badge naranja con ícono de envío
5. En tabla, debe aparecer columna "Derivado a: Director"

### ✅ Resultado Esperado

- POST a `/api/retiros-tempranos/solicitudes/{id}/derivar`
- Estado = `derivado_director`
- Solo director puede aprobar ahora

---

## 7️⃣ PRUEBA REGISTRAR SALIDA

### Objetivo

Registrar que estudiante salió físicamente del colegio.

### Pasos

1. Filtrar solicitudes **"Aprobado"**
2. Seleccionar una solicitud aprobada
3. Clic en **"Registrar Salida"** (botón azul)
4. ✅ Se abre modal con:
   - Fecha/hora actual pre-llenada
   - Campo para responsable de salida
   - Observaciones opcionales
5. Confirmar
6. ✅ Estado cambia a **"Completado"**
7. ✅ Badge gris con check

### ✅ Resultado Esperado

- POST a `/api/retiros-tempranos/solicitudes/{id}/salida`
- Registro creado en tabla `registros_salida`
- Solicitud marcada como completada
- Ya no aparece en acciones pendientes

---

## 8️⃣ PRUEBA DE VALIDACIONES

### Objetivo

Verificar que las validaciones funcionan correctamente.

### Casos de Prueba

#### A. Fechas inválidas

- Intentar crear solicitud con fecha pasada
- ❌ Debe mostrar error: "La fecha debe ser futura"

#### B. Horas inválidas

- Hora retorno antes de hora salida
- ❌ Error: "Hora de retorno debe ser posterior"

#### C. Campos requeridos

- Dejar campos vacíos en formulario
- ❌ Botón "Crear" deshabilitado o error en submit

#### D. Estudiante sin apoderado

- Si estudiante no tiene apoderados registrados
- ❌ Dropdown de apoderados vacío + mensaje de alerta

---

## 9️⃣ PRUEBA DE RENDIMIENTO

### Objetivo

Verificar que la app funciona con muchos datos.

### Pasos

1. Crear 20+ solicitudes con diferentes estados
2. ✅ Tabla renderiza correctamente (sin lag)
3. ✅ Filtros responden rápido
4. ✅ Búsqueda en tiempo real sin delay

### ✅ Resultado Esperado

- Scroll suave en tabla
- Filtros instantáneos
- Sin memory leaks (verificar en DevTools → Memory)

---

## 🔟 PRUEBA DE ERRORES

### Objetivo

Verificar manejo de errores de red.

### Pasos

#### A. Backend caído

1. Detener el backend (Ctrl+C)
2. Intentar crear solicitud
3. ✅ Debe mostrar mensaje de error amigable
4. ❌ No debe crashear la app

#### B. Token expirado (si hay auth)

1. Limpiar token de sesión
2. Intentar acción
3. ✅ Redirigir a login o mostrar error

#### C. 500 Internal Server Error

1. Enviar datos inválidos a backend
2. ✅ Mostrar error del servidor
3. ✅ Logs en console para debug

---

## ✅ CHECKLIST FINAL

Antes de considerar el módulo completo:

- [ ] Todas las operaciones CRUD funcionan
- [ ] Filtros y búsqueda responden correctamente
- [ ] Estados y badges se muestran con colores correctos
- [ ] Validaciones previenen datos inválidos
- [ ] Errores se manejan gracefully
- [ ] UI es responsive (probar en móvil)
- [ ] No hay errores en consola
- [ ] Backend logs muestran requests exitosos
- [ ] Base de datos se actualiza correctamente
- [ ] Módulo es usable por usuario final

---

## 🐛 TROUBLESHOOTING

### Problema: "No se cargan datos"

**Solución**:

1. Verificar que backend esté corriendo: `http://localhost:8000/docs`
2. Abrir DevTools → Network → Ver si hay requests a `/api/retiros-tempranos`
3. Verificar CORS en backend (`app/config/config.py`)

### Problema: "Error 404 en API"

**Solución**:

- Verificar que `API_BASE_URL` en `services/api.ts` sea `http://localhost:8000/api`
- Verificar que routes estén registradas en backend

### Problema: "Dropdowns vacíos"

**Solución**:

- Ejecutar `docs/seed_data.sql` para crear estudiantes/apoderados/motivos
- Verificar endpoints: `/api/retiros-tempranos/estudiantes` y `/api/retiros-tempranos/motivos`

### Problema: "Estilos no se aplican"

**Solución**:

- Ya solucionado ✅ (Tailwind v3)
- Si persiste: `npm run dev` para reiniciar Vite

---

## 📞 CONTACTO

Si encuentras bugs o comportamientos inesperados:

1. Revisar logs del backend en terminal
2. Revisar DevTools → Console en frontend
3. Documentar pasos para reproducir el error
