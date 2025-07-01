import { Presentacion } from '@/core/models/Inventario/Presentacion';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiPresentacion = createApiService<Presentacion>();

export const usePresentacion   = () => {

  const useGetPresentacionList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Presentacion>, Error>({
      queryKey: ['presentacion', 'list', page, size],
      queryFn: () => apiPresentacion.getList(endpoints.inventory.presentacion.list, page, size),
      onSettled: (_: ListDataResponse<Presentacion> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching presentacion list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Presentacion>, Error>);
  };

  const useGetPresentacionItem = (id: number) => {
    return useQuery<Presentacion, Error>({
      queryKey: ['presentacion', 'item', id],
      queryFn: () => apiPresentacion.getOne(endpoints.inventory.presentacion.getOne(id)),
      enabled: !!id,
      onSettled: (_: Presentacion | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching presentacion item:', error);
        }
      }
    } as UseQueryOptions<Presentacion, Error>);
  };

  const useCreatePresentacion = () => {
    return useMutation({
      mutationFn: (formData: Partial<Presentacion>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Presentacion, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || null,
          otrosC2: formData.otrosC2 || null,
          otrosC3: formData.otrosC3 || null,
          otrosC4: formData.otrosC4 || null,
          otrosT1: formData.otrosT1 || null,
          equipo: 'equipo',
        };
        return apiPresentacion.create(endpoints.inventory.presentacion.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['presentacion', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating presentacion:', error);
      }
    });
  };

  const useUpdatePresentacion = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Presentacion> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Presentacion> = {
          id: id,
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || null,
          otrosC2: formData.otrosC2 || null,
          otrosC3: formData.otrosC3 || null,
          otrosC4: formData.otrosC4 || null,
          otrosT1: formData.otrosT1 || null,
          equipo: 'equipo',
        };
        return apiPresentacion.update(endpoints.inventory.presentacion.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['presentacion', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['presentacion', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating presentacion:', error);
      }
    });
  };

  const useDeletePresentacion = () => {
    return useMutation({
      mutationFn: (id: number) => apiPresentacion.delete(endpoints.inventory.presentacion.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['presentacion', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting presentacion:', error);
      }
    });
  };

  return {
    useGetPresentacionList,
    useGetPresentacionItem,
    useCreatePresentacion,
    useUpdatePresentacion,
    useDeletePresentacion
  };
}; 