// Servicio para el módulo de Personal
import tursoService from './tursoService.js';
import { executeQuery } from '../lib/tursoClient.js';

const TABLE_NAME = 'personal';
const PUESTOS_TABLE = 'puestos';

// Obtener todos los registros de personal
export async function getAllPersonal() {
  return tursoService.getAll(TABLE_NAME);
}

// Obtener un registro de personal por ID
export async function getPersonalById(id) {
  return tursoService.getById(TABLE_NAME, id);
}

// Obtener personal con información de puesto
export async function getPersonalConPuesto() {
  try {
    const query = `
      SELECT p.*, pt.nombre as puesto_nombre, pt.departamento
      FROM ${TABLE_NAME} p
      LEFT JOIN ${PUESTOS_TABLE} pt ON p.puesto_id = pt.id
    `;
    const result = await executeQuery(query);
    return result.data ? result.data.rows : [];
  } catch (error) {
    console.error('Error al obtener personal con información de puesto:', error);
    throw error;
  }
}

// Crear un nuevo registro de personal
export async function createPersonal(data) {
  // Asegurarse de que se incluya la fecha de creación
  const personalData = {
    ...data,
    created_at: data.created_at || new Date().toISOString()
  };
  return tursoService.create(TABLE_NAME, personalData);
}

// Actualizar un registro de personal
export async function updatePersonal(id, data) {
  // Incluir fecha de actualización
  const personalData = {
    ...data,
    updated_at: new Date().toISOString()
  };
  return tursoService.update(TABLE_NAME, id, personalData);
}

// Eliminar un registro de personal
export async function deletePersonal(id) {
  return tursoService.remove(TABLE_NAME, id);
}

// Buscar personal por filtros
export async function searchPersonal(filters) {
  return tursoService.search(TABLE_NAME, filters);
}

// Obtener todos los puestos
export async function getAllPuestos() {
  return tursoService.getAll(PUESTOS_TABLE);
}

// Obtener un puesto por ID
export async function getPuestoById(id) {
  return tursoService.getById(PUESTOS_TABLE, id);
}

// Crear un nuevo puesto
export async function createPuesto(data) {
  // Asegurarse de que se incluya la fecha de creación
  const puestoData = {
    ...data,
    created_at: data.created_at || new Date().toISOString()
  };
  return tursoService.create(PUESTOS_TABLE, puestoData);
}

// Actualizar un puesto
export async function updatePuesto(id, data) {
  return tursoService.update(PUESTOS_TABLE, id, data);
}

// Eliminar un puesto
export async function deletePuesto(id) {
  return tursoService.remove(PUESTOS_TABLE, id);
}

// Exportar todas las funciones
export default {
  getAllPersonal,
  getPersonalById,
  getPersonalConPuesto,
  createPersonal,
  updatePersonal,
  deletePersonal,
  searchPersonal,
  getAllPuestos,
  getPuestoById,
  createPuesto,
  updatePuesto,
  deletePuesto
};
