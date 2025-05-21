import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { inventoryApi } from '@/data/api/Inventario/inventoryApi';
import { Almacen } from '@/core/models/Almacen';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';

export const useInventory = () => {

  const useGetInventoryList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Almacen>, Error>({
      queryKey: ['inventory', 'list', page, size],
      queryFn: () => inventoryApi.getList(page, size),
      onSettled: (_: ListDataResponse<Almacen> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de inventario. Por favor, intente nuevamente.'
          );
          console.error('Error fetching inventory list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Almacen>, Error>);
  };

  const useGetInventoryItem = (id: number) => {
    return useQuery<Almacen, Error>({
      queryKey: ['inventory', 'item', id],
      queryFn: () => inventoryApi.getOne(id),
      enabled: !!id,
      onSettled: (_: Almacen | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el item del inventario. Por favor, intente nuevamente.'
          );
          console.error('Error fetching inventory item:', error);
        }
      }
    } as UseQueryOptions<Almacen, Error>);
  };

  const useCreateInventory = () => {
    return useMutation({
      mutationFn: (data: Omit<Almacen, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'>) => inventoryApi.create(data),
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

  const useUpdateInventory = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Almacen> }) => 
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

  const useDeleteInventory = () => {
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
    useGetInventoryList,
    useGetInventoryItem,
    useCreateInventory,
    useUpdateInventory,
    useDeleteInventory
  };
}; 