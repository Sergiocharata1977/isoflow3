// Servicio para gestionar usuarios
import { mockServices } from '@/lib/mockData';

// Exportar el servicio de usuarios con datos simulados
export const usuariosService = {
  async getAll() {
    try {
      return await mockServices.usuarios.getAll();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { data: [], error };
    }
  },

  async create(usuario) {
    try {
      return await mockServices.usuarios.create(usuario);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return { data: null, error };
    }
  },

  async update(id, updates) {
    try {
      return await mockServices.usuarios.update(id, updates);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return { data: null, error };
    }
  },

  async delete(id) {
    try {
      return await mockServices.usuarios.delete(id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return { error };
    }
  }
};
