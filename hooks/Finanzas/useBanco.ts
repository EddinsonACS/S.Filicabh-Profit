import { Banco } from '@/core/models/Finanzas/Banco';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';
const apiBanco = createApiService<Banco>();

export const useBanco = () => {

  const useGetBancoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Banco>, Error>({
      queryKey: ['banco', 'list', page, size],
      queryFn: () => apiBanco.getList(endpoints.finanzas.banco.list, page, size),
      onSettled: (_: ListDataResponse<Banco> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de inventario. Por favor, intente nuevamente.'
          );
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
          Alert.alert(
            'Error',
            'No se pudo cargar el item del banco. Por favor, intente nuevamente.'
          );
          console.error('Error fetching banco item:', error);
        }
      }
    } as UseQueryOptions<Banco, Error>);
  };

  const useCreateBanco = () => {
    return useMutation({
      mutationFn: (formData: Partial<Banco>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Banco, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: null,
          otrosC2: null,
          otrosC3: null,
          otrosC4: null,
          otrosT1: null,
          equipo: "equipo"
        };
        return apiBanco.create(endpoints.finanzas.banco.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banco', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de banco creado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el item de banco. Por favor, intente nuevamente.'
        );
        console.error('Error creating banco item:', error);
      }
    });
  };

  const useUpdateBanco = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Banco> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Banco> = {
          id: id,
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: null,
          otrosC2: null,
          otrosC3: null,
          otrosC4: null,
          otrosT1: null,
          equipo: "equipo"
        };
        return apiBanco.update(endpoints.finanzas.banco.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['banco', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['banco', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Item de banco actualizado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar el item de banco. Por favor, intente nuevamente.'
        );
        console.error('Error updating banco item:', error);
      }
    });
  };

  const useDeleteBanco = () => {
    return useMutation({
      mutationFn: (id: number) => apiBanco.delete(endpoints.finanzas.banco.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['banco', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de banco eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el item de inventario. Por favor, intente nuevamente.'
        );
        console.error('Error deleting banco item:', error);
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