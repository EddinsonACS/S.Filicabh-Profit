import { endpoints } from '@/utils/const/endpoints';
import ListDataResponse from '@/core/response/ListDataResponse';
import { AcuerdoDePago } from '@/core/models/AcuerdoDePago';
import { api } from '@/utils/libs/api';


export const acuerdoDePagoApi = {
  getList: async (pageNumber: number = 1, pageSize: number = 10): Promise<ListDataResponse<AcuerdoDePago>> => {
    const response = await api.get(endpoints.sells.acuerdodepago.list + `?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  getOne: async (id: number): Promise<AcuerdoDePago> => {
    const response = await api.get(endpoints.sells.acuerdodepago.getOne(id));
    return response.data;
  },

  create: async (data: Partial<AcuerdoDePago>): Promise<AcuerdoDePago> => {
    const response = await api.post(endpoints.sells.acuerdodepago.create, data);
    return response.data;
  },

  update: async (id: number, data: Partial<AcuerdoDePago>): Promise<AcuerdoDePago> => {
    data.id = id;
    const response = await api.put(endpoints.sells.acuerdodepago.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(endpoints.sells.acuerdodepago.delete(id));
  }
}; 