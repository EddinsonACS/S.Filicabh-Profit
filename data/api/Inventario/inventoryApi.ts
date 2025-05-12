import { endpoints } from '@/utils/const/endpoints';
import { Inventario } from '@/core/models/Inventario';
import ListInventarioResponse from '@/core/response/ListInventarioResponse';
import { api } from '@/utils/libs/api';

export const inventoryApi = {
  getList: async (pageNumber: number = 1, pageSize: number = 10): Promise<ListInventarioResponse> => {
    const response = await api.get(endpoints.inventory.list + `?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  getOne: async (id: number): Promise<Inventario> => {
    const response = await api.get(endpoints.inventory.getOne(id));
    return response.data;
  },

  create: async (data: Omit<Inventario, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'>): Promise<Inventario> => {
    const response = await api.post(endpoints.inventory.create, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Inventario>): Promise<Inventario> => {
    data.id = id;
    const response = await api.put(endpoints.inventory.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(endpoints.inventory.delete(id));
  }
}; 