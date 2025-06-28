import ListDataResponse from '@/core/response/ListDataResponse';
import { api } from '@/utils/libs/api';

interface ApiServiceConfig<T, U = Partial<T>> {
  getList: (url: string, page: number, pageSize: number) => Promise<ListDataResponse<T>>;
  create: (url: string, data: U, isFile?: boolean) => Promise<T>;
  getOne: (url: string) => Promise<T>;
  update: (url: string, data: U, isFile?: boolean) => Promise<T>;
  delete: (url: string) => Promise<void>;
}

export function createApiService<T, U = Partial<T>>(): ApiServiceConfig<T, U> {
  return {
    getList: async (url: string, page: number, pageSize: number): Promise<ListDataResponse<T>> => {
      const response = await api.get(`${url}?pageNumber=${page}&pageSize=${pageSize}`);
      return response.data;
    },

    create: async (url: string, data: U, isFile: boolean = false): Promise<T> => {
      const config: any = {};
      
      if (isFile) {
        config.headers = {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'multipart/form-data'
        };
      } else {
        config.headers = {
          'Content-Type': 'application/json'
        };
      }
      
      const response = await api.post(url, data, config);
      return response.data;
    },

    getOne: async (url: string): Promise<T> => {
      const response = await api.get(url);
      return response.data;
    },

    update: async (url: string, data: U, isFile: boolean = false): Promise<T> => {
      console.log(data)
      const config: any = {};
      
      if (isFile) {
        // Para FormData, forzar que axios reconozca el tipo correcto
        config.headers = {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'multipart/form-data'
        };
        // Forzar que axios no transforme el FormData
        config.transformRequest = [(data: any) => data];
      } else {
        // Para JSON, establecer Content-Type manualmente
        config.headers = {
          'Content-Type': 'application/json'
        };
      }
      
      const response = await api.put(url, data, config);
      return response.data;
    },

    delete: async (url: string): Promise<void> => {
      const response = await api.delete(url);
      return response.data;
    }
  };
}