import { Talla } from '@/core/models/Inventario/Talla';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiTalla = createApiService<Talla>();

export const useTalla   = () => {

  const useGetTallaList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Talla>, Error>({
      queryKey: ['talla', 'list', page, size],
      queryFn: () => apiTalla.getList(endpoints.inventory.talla.list, page, size),
      onSettled: (_: ListDataResponse<Talla> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching talla list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Talla>, Error>);
  };

  const useGetTallaItem = (id: number) => {
    return useQuery<Talla, Error>({
      queryKey: ['talla', 'item', id],
      queryFn: () => apiTalla.getOne(endpoints.inventory.talla.getOne(id)),
      enabled: !!id,
      onSettled: (_: Talla | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching talla item:', error);
        }
      }
    } as UseQueryOptions<Talla, Error>);
  };

  const useCreateTalla = () => {
    return useMutation({
      mutationFn: (formData: Partial<Talla>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Talla, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
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
        return apiTalla.create(endpoints.inventory.talla.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['talla', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating talla:', error);
      }
    });
  };

  const useUpdateTalla = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Talla> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Talla> = {
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
        return apiTalla.update(endpoints.inventory.talla.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['talla', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['talla', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating talla:', error);
      }
    });
  };

  const useDeleteTalla = () => {
    return useMutation({
      mutationFn: (id: number) => apiTalla.delete(endpoints.inventory.talla.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['talla', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting talla:', error);
      }
    });
  };

  return {
    useGetTallaList,
    useGetTallaItem,
    useCreateTalla,
    useUpdateTalla,
    useDeleteTalla
  };
}; 