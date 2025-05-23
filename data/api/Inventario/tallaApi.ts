import { Talla } from '@/core/models/Talla';
import ListDataResponse from '@/core/response/ListDataResponse';
import { endpoints } from '@/utils/const/endpoints';
import { api } from '@/utils/libs/api';

export const tallaApi = {
  getList: async (page: number, pageSize: number): Promise<ListDataResponse<Talla>> => {
    const response = await api.get(`${endpoints.inventory.talla.list}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  create: async (data: Partial<Talla>): Promise<Talla> => {
    const response = await api.post(endpoints.inventory.talla.create, data);
    return response.data;
  },

  getOne: async (id: number): Promise<Talla> => {
    const response = await api.get(endpoints.inventory.talla.getOne(id));
    return response.data;
  },

  update: async (id: number, data: Partial<Talla>): Promise<Talla> => {
    data.id = id;
    const response = await api.put(endpoints.inventory.talla.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete(endpoints.inventory.talla.delete(id));
    return response.data;
  }
}; 