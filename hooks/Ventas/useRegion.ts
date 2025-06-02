import { Region } from '@/core/models/Ventas/Region';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiRegion = createApiService<Region>();

export const useRegion = () => {

  const useGetRegionList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Region>, Error>({
      queryKey: ['region', 'list', page, size],
      queryFn: () => apiRegion.getList(endpoints.sales.region.list, page, size),
      onSettled: (_: ListDataResponse<Region> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching region list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Region>, Error>);
  };

  const useGetRegionItem = (id: number) => {
    return useQuery<Region, Error>({
      queryKey: ['region', 'item', id],
      queryFn: () => apiRegion.getOne(endpoints.sales.region.getOne(id)),
      enabled: !!id,
      onSettled: (_: Region | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching region item:', error);
        }
      }
    } as UseQueryOptions<Region, Error>);
  };

  const useCreateRegion = () => {
    return useMutation({
      mutationFn: (formData: Partial<Region>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Region, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          usuario: 1,
          equipo: 'equipo'
        };
        return apiRegion.create(endpoints.sales.region.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['region', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating region:', error);
      }
    });
  };

  const useUpdateRegion = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Region> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Region> = {
          id: id,
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          usuario: 1,
          equipo: 'equipo'
        };
        return apiRegion.update(endpoints.sales.region.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['region', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['region', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating region:', error);
      }
    });
  };

  const useDeleteRegion = () => {
    return useMutation({
      mutationFn: (id: number) => apiRegion.delete(endpoints.sales.region.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['region', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting region:', error);
      }
    });
  };

  return {
    useGetRegionList,
    useGetRegionItem,
    useCreateRegion,
    useUpdateRegion,
    useDeleteRegion
  };
};