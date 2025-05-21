import { endpoints } from '@/utils/const/endpoints';
import { Inventario } from '@/core/models/Almacen';
import { api } from '@/utils/libs/api';
import ListDataResponse from '@/core/response/ListDataResponse';

export const inventoryApi = {
  getList: async (pageNumber: number = 1, pageSize: number = 10): Promise<ListDataResponse<Inventario>> => {
    const response = await api.get(endpoints.inventory.almacen.list + `?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  getOne: async (id: number): Promise<Inventario> => {
    const response = await api.get(endpoints.inventory.almacen.getOne(id));
    return response.data;
  },

  create: async (data: Omit<Inventario, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'>): Promise<Inventario> => {
    const response = await api.post(endpoints.inventory.almacen.create, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Inventario>): Promise<Inventario> => {
    data.id = id;
    const response = await api.put(endpoints.inventory.almacen.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(endpoints.inventory.almacen.delete(id));
  }
}; 