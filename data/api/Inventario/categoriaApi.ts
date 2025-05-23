import { endpoints } from '@/utils/const/endpoints';
import { Categoria } from '@/core/models/Categoria';
import { api } from '@/utils/libs/api';
import ListDataResponse from '@/core/response/ListDataResponse';

export const categoriaApi = {
  getList: async (pageNumber: number = 1, pageSize: number = 10): Promise<ListDataResponse<Categoria>> => {
    const response = await api.get(endpoints.inventory.categoria.list + `?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  getOne: async (id: number): Promise<Categoria> => {
    const response = await api.get(endpoints.inventory.categoria.getOne(id));
    return response.data;
  },

  create: async (data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.post(endpoints.inventory.categoria.create, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Categoria>): Promise<Categoria> => {
    data.id = id;
    const response = await api.put(endpoints.inventory.categoria.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(endpoints.inventory.categoria.delete(id));
  }
}; 