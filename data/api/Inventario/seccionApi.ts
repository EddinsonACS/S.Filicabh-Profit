import { Seccion } from '@/core/models/Seccion';
import ListDataResponse from '@/core/response/ListDataResponse';
import { endpoints } from '@/utils/const/endpoints';
import { api } from '@/utils/libs/api';

export const seccionApi = {
  getList: async (page: number, pageSize: number): Promise<ListDataResponse<Seccion>> => {
    const response = await api.get(`${endpoints.inventory.seccion.list}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  create: async (data: Partial<Seccion>): Promise<Seccion> => {
    const response = await api.post(endpoints.inventory.seccion.create, data);
    return response.data;
  },

  getOne: async (id: number): Promise<Seccion> => {
    const response = await api.get(endpoints.inventory.seccion.getOne(id));
    return response.data;
  },

  update: async (id: number, data: Partial<Seccion>): Promise<Seccion> => {
    data.id = id;
    const response = await api.put(endpoints.inventory.seccion.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete(endpoints.inventory.seccion.delete(id));
    return response.data;
  }
}; 