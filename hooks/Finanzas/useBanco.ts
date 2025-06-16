import { Banco } from '@/core/models/Finanzas/Banco';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiBanco = createApiService<Banco>();

export const useBanco = () => {

  const useGetBancoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Banco>, Error>({
      queryKey: ['banco', 'list', page, size],
      queryFn: () => apiBanco.getList(endpoints.finanzas.banco.list, page, size),
      onSettled: (_: ListDataResponse<Banco> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching banco list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Banco>, Error>);
  };

  const useGetBancoItem = (id: number) => {
    return useQuery<Banco, Error>({
      queryKey: ['banco', 'item', id],
      queryFn: () => apiBanco.getOne(endpoints.finanzas.banco.getOne(id)),
      enabled: !!id,
      onSettled: (_: Banco | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching banco item:', error);
        }
      }
    } as UseQueryOptions<Banco, Error>);
  };

  const useCreateBanco = () => {
    return useMutation({
      mutationFn: (formData: Partial<Banco>) => {
        // Solo validar campos requeridos
        if (!formData.nombre || formData.nombre.trim().length === 0) {
          throw new Error('El nombre es requerido');
        }

        const data: Omit<Banco, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
          nombre: formData.nombre.trim(),
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || null,
          otrosC2: formData.otrosC2 || null,
          otrosC3: formData.otrosC3 || null,
          otrosC4: formData.otrosC4 || null,
          otrosT1: formData.otrosT1 || null,
          usuario: 1,
          equipo: 'equipo'
        };
        return apiBanco.create(endpoints.finanzas.banco.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banco', 'list'] });
        // Notificación manejada desde el componente
      },
      onError: (error) => {
        console.error('Error creating banco:', error);
        // Notificación de error manejada desde el componente
      }
    });
  };

  const useUpdateBanco = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Banco> }) => {
        // Solo validar campos requeridos
        if (!formData.nombre || formData.nombre.trim().length === 0) {
          throw new Error('El nombre es requerido');
        }

        const data: Partial<Banco> = {
          id: id,
          nombre: formData.nombre.trim(),
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || null,
          otrosC2: formData.otrosC2 || null,
          otrosC3: formData.otrosC3 || null,
          otrosC4: formData.otrosC4 || null,
          otrosT1: formData.otrosT1 || null,
          usuario: 1,
          equipo: 'equipo'
        };
        return apiBanco.update(endpoints.finanzas.banco.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['banco', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['banco', 'item', variables.id] });
        // Notificación manejada desde el componente
      },
      onError: (error) => {
        console.error('Error updating banco:', error);
        // Notificación de error manejada desde el componente
      }
    });
  };

  const useDeleteBanco = () => {
    return useMutation({
      mutationFn: (id: number) => apiBanco.delete(endpoints.finanzas.banco.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banco', 'list'] });
        // Notificación manejada desde el componente
      },
      onError: (error) => {
        console.error('Error deleting banco:', error);
        // Notificación de error manejada desde el componente
      }
    });
  };

  return {
    useGetBancoList,
    useGetBancoItem,
    useCreateBanco,
    useUpdateBanco,
    useDeleteBanco
  };
}; 