import { Unidad } from '@/core/models/Unidad';
import ListDataResponse from '@/core/response/ListDataResponse';
import { endpoints } from '@/utils/const/endpoints';
import { api } from '@/utils/libs/api';

export const unidadApi = {
  getList: async (page: number, pageSize: number): Promise<ListDataResponse<Unidad>> => {
    const response = await api.get(`${endpoints.inventory.unidad.list}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  create: async (data: Partial<Unidad>): Promise<Unidad> => {
    const response = await api.post(endpoints.inventory.unidad.create, data);
    return response.data;
  },

  getOne: async (id: number): Promise<Unidad> => {
    const response = await api.get(endpoints.inventory.unidad.getOne(id));
    return response.data;
  },

  update: async (id: number, data: Partial<Unidad>): Promise<Unidad> => {
    data.id = id;
    const response = await api.put(endpoints.inventory.unidad.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete(endpoints.inventory.unidad.delete(id));
    return response.data;
  }
}; 