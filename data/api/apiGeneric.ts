import ListDataResponse from '@/core/response/ListDataResponse';
import { api } from '@/utils/libs/api';

interface ApiServiceConfig<T, U = Partial<T>> {
  getList: (url: string, page: number, pageSize: number) => Promise<ListDataResponse<T>>;
  create: (url: string, data: U) => Promise<T>;
  getOne: (url: string) => Promise<T>;
  update: (url: string, data: U) => Promise<T>;
  delete: (url: string) => Promise<void>;
}

export function createApiService<T, U = Partial<T>>(): ApiServiceConfig<T, U> {
  return {
    getList: async (url: string, page: number, pageSize: number): Promise<ListDataResponse<T>> => {
      const response = await api.get(`${url}?page=${page}&pageSize=${pageSize}`);
      return response.data;
    },

    create: async (url: string, data: U): Promise<T> => {
      console.log('data', data);
      const response = await api.post(url, data);
      return response.data;
    },

    getOne: async (url: string): Promise<T> => {
      const response = await api.get(url);
      return response.data;
    },

    update: async (url: string, data: U): Promise<T> => {
      const response = await api.put(url, data);
      return response.data;
    },

    delete: async (url: string): Promise<void> => {
      const response = await api.delete(url);
      return response.data;
    }
  };
}