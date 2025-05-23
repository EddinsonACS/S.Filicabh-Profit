import { endpoints } from '@/utils/const/endpoints';
import { api } from '@/utils/libs/api';
import ListDataResponse from '@/core/response/ListDataResponse';
import { Grupo } from '@/core/models/Grupo';


export const grupoApi = {
  getList: async (pageNumber: number = 1, pageSize: number = 10): Promise<ListDataResponse<Grupo>> => {
    const response = await api.get(endpoints.inventory.grupo.list + `?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  getOne: async (id: number): Promise<Grupo> => {
    const response = await api.get(endpoints.inventory.grupo.getOne(id));
    return response.data;
  },

  create: async (data: Partial<Grupo>): Promise<Grupo> => {
    const response = await api.post(endpoints.inventory.grupo.create, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Grupo>): Promise<Grupo> => {
    data.id = id;
    console.log(data);
    const response = await api.put(endpoints.inventory.grupo.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(endpoints.inventory.grupo.delete(id));
  }
}; 