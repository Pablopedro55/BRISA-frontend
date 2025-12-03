/**
 * Datos de ejemplo para el módulo de Retiros Tempranos
 * Estos datos se usan porque el backend no tiene endpoints para
 * buscar estudiantes por nombre ni obtener detalles de apoderados
 * 
 * Basado en seed_data.sql del backend
 */

import type { Estudiante, Apoderado } from '../types';

// Estudiantes de ejemplo (basados en seed_data.sql)
export const estudiantesData: Estudiante[] = [
  {
    id_estudiante: 1,
    ci: '12345678',
    nombres: 'Pedro Luis',
    apellido_paterno: 'García',
    apellido_materno: 'Mamani',
    fecha_nacimiento: '2015-03-15',
    direccion: 'Calle Los Pinos #100',
    curso: '1ro de Primaria A'
  },
  {
    id_estudiante: 2,
    ci: '23456789',
    nombres: 'Sofía Andrea',
    apellido_paterno: 'López',
    apellido_materno: 'Flores',
    fecha_nacimiento: '2014-07-22',
    direccion: 'Av. del Maestro #200',
    curso: '2do de Primaria A'
  },
  {
    id_estudiante: 3,
    ci: '34567890',
    nombres: 'Diego Alejandro',
    apellido_paterno: 'Morales',
    apellido_materno: 'Castro',
    fecha_nacimiento: '2013-11-08',
    direccion: 'Zona Central #300',
    curso: '3ro de Primaria A'
  },
  {
    id_estudiante: 4,
    ci: '45678901',
    nombres: 'Valentina María',
    apellido_paterno: 'Quispe',
    apellido_materno: 'Gutiérrez',
    fecha_nacimiento: '2016-01-30',
    direccion: 'Calle Libertad #400',
    curso: '1ro de Primaria A'
  },
  {
    id_estudiante: 5,
    ci: '56789012',
    nombres: 'Mateo Sebastián',
    apellido_paterno: 'Fernández',
    apellido_materno: 'Rojas',
    fecha_nacimiento: '2015-05-12',
    direccion: 'Av. Principal #500',
    curso: '2do de Primaria A'
  },
  {
    id_estudiante: 6,
    ci: '67890123',
    nombres: 'Isabella Carolina',
    apellido_paterno: 'Condori',
    apellido_materno: 'Pérez',
    fecha_nacimiento: '2014-09-25',
    direccion: 'Calle Sucre #600',
    curso: '3ro de Primaria A'
  },
  {
    id_estudiante: 7,
    ci: '78901234',
    nombres: 'Santiago Andrés',
    apellido_paterno: 'Vargas',
    apellido_materno: 'Mamani',
    fecha_nacimiento: '2013-12-18',
    direccion: 'Zona Este #700',
    curso: '1ro de Secundaria A'
  },
  {
    id_estudiante: 8,
    ci: '89012345',
    nombres: 'Camila Sofía',
    apellido_paterno: 'Silva',
    apellido_materno: 'González',
    fecha_nacimiento: '2016-04-05',
    direccion: 'Av. Circunvalación #800',
    curso: '1ro de Primaria A'
  },
  {
    id_estudiante: 9,
    ci: '90123456',
    nombres: 'Nicolás Gabriel',
    apellido_paterno: 'Cruz',
    apellido_materno: 'Torrico',
    fecha_nacimiento: '2015-08-20',
    direccion: 'Calle Bolivia #900',
    curso: '2do de Primaria A'
  },
  {
    id_estudiante: 10,
    ci: '01234567',
    nombres: 'Emilia Victoria',
    apellido_paterno: 'Mamani',
    apellido_materno: 'López',
    fecha_nacimiento: '2014-02-14',
    direccion: 'Zona Oeste #1000',
    curso: '3ro de Primaria A'
  }
];

// Apoderados de ejemplo (basados en seed_data.sql)
export const apoderadosData: Apoderado[] = [
  {
    id_apoderado: 1,
    ci: '5123456',
    nombres: 'José Antonio',
    apellidos: 'García Quispe',
    telefono: '70123456',
    correo: 'jose.garcia@email.com',
    direccion: 'Calle Los Pinos #100'
  },
  {
    id_apoderado: 2,
    ci: '5234567',
    nombres: 'Rosa María',
    apellidos: 'Mamani Condori',
    telefono: '71123456',
    correo: 'rosa.mamani@email.com',
    direccion: 'Calle Los Pinos #100'
  },
  {
    id_apoderado: 3,
    ci: '5345678',
    nombres: 'Miguel Ángel',
    apellidos: 'López Vargas',
    telefono: '70234567',
    correo: 'miguel.lopez@email.com',
    direccion: 'Av. del Maestro #200'
  },
  {
    id_apoderado: 4,
    ci: '5456789',
    nombres: 'Carmen Elena',
    apellidos: 'Flores Cruz',
    telefono: '71234567',
    correo: 'carmen.flores@email.com',
    direccion: 'Av. del Maestro #200'
  },
  {
    id_apoderado: 5,
    ci: '5567890',
    nombres: 'Fernando José',
    apellidos: 'Morales Pérez',
    telefono: '70345678',
    correo: 'fernando.morales@email.com',
    direccion: 'Zona Central #300'
  },
  {
    id_apoderado: 6,
    ci: '5678901',
    nombres: 'Ricardo Andrés',
    apellidos: 'Quispe Mamani',
    telefono: '70456789',
    correo: 'ricardo.quispe@email.com',
    direccion: 'Calle Libertad #400'
  },
  {
    id_apoderado: 7,
    ci: '5789012',
    nombres: 'Alberto Daniel',
    apellidos: 'Fernández Torres',
    telefono: '70567890',
    correo: 'alberto.fernandez@email.com',
    direccion: 'Av. Principal #500'
  },
  {
    id_apoderado: 8,
    ci: '5890123',
    nombres: 'Sandra Beatriz',
    apellidos: 'Rojas Morales',
    telefono: '71567890',
    correo: 'sandra.rojas@email.com',
    direccion: 'Av. Principal #500'
  }
];

// Relaciones estudiante-apoderado (basadas en seed_data.sql)
export interface RelacionEstudianteApoderado {
  id_estudiante: number;
  id_apoderado: number;
  parentesco: string;
  es_contacto_principal: boolean;
}

export const relacionesData: RelacionEstudianteApoderado[] = [
  // Estudiante 1: Pedro Luis García Mamani
  { id_estudiante: 1, id_apoderado: 1, parentesco: 'Padre', es_contacto_principal: true },
  { id_estudiante: 1, id_apoderado: 2, parentesco: 'Madre', es_contacto_principal: false },
  
  // Estudiante 2: Sofía Andrea López Flores
  { id_estudiante: 2, id_apoderado: 3, parentesco: 'Padre', es_contacto_principal: true },
  { id_estudiante: 2, id_apoderado: 4, parentesco: 'Madre', es_contacto_principal: false },
  
  // Estudiante 3: Diego Alejandro Morales Castro
  { id_estudiante: 3, id_apoderado: 5, parentesco: 'Padre', es_contacto_principal: true },
  
  // Estudiante 4: Valentina María Quispe Gutiérrez
  { id_estudiante: 4, id_apoderado: 6, parentesco: 'Padre', es_contacto_principal: true },
  
  // Estudiante 5: Mateo Sebastián Fernández Rojas
  { id_estudiante: 5, id_apoderado: 7, parentesco: 'Padre', es_contacto_principal: false },
  { id_estudiante: 5, id_apoderado: 8, parentesco: 'Madre', es_contacto_principal: true },
  
  // Estudiante 6: Isabella Carolina Condori Pérez
  { id_estudiante: 6, id_apoderado: 1, parentesco: 'Tío', es_contacto_principal: true },
  
  // Estudiante 7: Santiago Andrés Vargas Mamani
  { id_estudiante: 7, id_apoderado: 3, parentesco: 'Abuelo', es_contacto_principal: true },
  
  // Estudiante 8: Camila Sofía Silva González
  { id_estudiante: 8, id_apoderado: 5, parentesco: 'Padre', es_contacto_principal: true },
  
  // Estudiante 9: Nicolás Gabriel Cruz Torrico
  { id_estudiante: 9, id_apoderado: 6, parentesco: 'Tutor Legal', es_contacto_principal: true },
  
  // Estudiante 10: Emilia Victoria Mamani López
  { id_estudiante: 10, id_apoderado: 7, parentesco: 'Padre', es_contacto_principal: true },
  { id_estudiante: 10, id_apoderado: 8, parentesco: 'Madre', es_contacto_principal: false }
];

/**
 * Buscar estudiantes por nombre (búsqueda parcial, case insensitive)
 */
export function buscarEstudiantesPorNombre(termino: string): Estudiante[] {
  if (!termino || termino.trim() === '') {
    return [];
  }
  
  const terminoLower = termino.toLowerCase().trim();
  
  return estudiantesData.filter(est => {
    const nombreCompleto = `${est.nombres} ${est.apellido_paterno} ${est.apellido_materno}`.toLowerCase();
    return nombreCompleto.includes(terminoLower) || est.ci.includes(termino);
  });
}

/**
 * Obtener estudiante por ID
 */
export function getEstudiantePorId(id: number): Estudiante | undefined {
  return estudiantesData.find(e => e.id_estudiante === id);
}

/**
 * Obtener apoderado por ID
 */
export function getApoderadoPorId(id: number): Apoderado | undefined {
  return apoderadosData.find(a => a.id_apoderado === id);
}

/**
 * Obtener apoderados de un estudiante con sus datos completos
 */
export function getApoderadosDeEstudiante(idEstudiante: number): (Apoderado & { parentesco: string; es_contacto_principal: boolean })[] {
  const relaciones = relacionesData.filter(r => r.id_estudiante === idEstudiante);
  
  return relaciones.map(rel => {
    const apoderado = getApoderadoPorId(rel.id_apoderado);
    if (!apoderado) return null;
    
    return {
      ...apoderado,
      parentesco: rel.parentesco,
      es_contacto_principal: rel.es_contacto_principal
    };
  }).filter(Boolean) as (Apoderado & { parentesco: string; es_contacto_principal: boolean })[];
}

/**
 * Obtener nombre completo de un estudiante por ID
 */
export function getNombreEstudiante(id: number): string {
  const estudiante = getEstudiantePorId(id);
  if (!estudiante) return `ID: ${id}`;
  return `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`;
}

/**
 * Obtener nombre completo de un apoderado por ID
 */
export function getNombreApoderado(id: number): string {
  const apoderado = getApoderadoPorId(id);
  if (!apoderado) return `ID: ${id}`;
  return `${apoderado.nombres} ${apoderado.apellidos}`;
}
