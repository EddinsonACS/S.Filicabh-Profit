import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { inventoryApi } from '@/data/api/Inventario/inventoryApi';
import { AcuerdoDePago } from '@/core/models/AcuerdoDePago';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';

export const useAcuerdoDePago = () => {

  const useGetAcuerdoDePagoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<AcuerdoDePago>, Error>({
      queryKey: ['inventory', 'list', page, size],
      queryFn: () => inventoryApi.getList(page, size),
      onSettled: (_: ListDataResponse<AcuerdoDePago> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de inventario. Por favor, intente nuevamente.'
          );
          console.error('Error fetching inventory list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<AcuerdoDePago>, Error>);
  };

  const useGetAcuerdoDePagoItem = (id: number) => {
    return useQuery<AcuerdoDePago, Error>({
      queryKey: ['inventory', 'item', id],
      queryFn: () => inventoryApi.getOne(id),
      enabled: !!id,
      onSettled: (_: AcuerdoDePago | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el item del inventario. Por favor, intente nuevamente.'
          );
          console.error('Error fetching inventory item:', error);
        }
      }
    } as UseQueryOptions<AcuerdoDePago, Error>);
  };

  const useCreateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (data: Omit<AcuerdoDePago, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'>) => inventoryApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de inventario creado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el item de inventario. Por favor, intente nuevamente.'
        );
        console.error('Error creating inventory item:', error);
      }
    });
  };

  const useUpdateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<AcuerdoDePago> }) => 
        inventoryApi.update(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['inventory', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Item de inventario actualizado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar el item de inventario. Por favor, intente nuevamente.'
        );
        console.error('Error updating inventory item:', error);
      }
    });
  };

const useDeleteAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (id: number) => inventoryApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de inventario eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el item de inventario. Por favor, intente nuevamente.'
        );
        console.error('Error deleting inventory item:', error);
      }
    });
  };

  return {
    useGetAcuerdoDePagoList,
    useGetAcuerdoDePagoItem,
    useCreateAcuerdoDePago,
    useUpdateAcuerdoDePago,
    useDeleteAcuerdoDePago
  };
}; 