import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { almacenApi } from '@/data/api/Inventario/almacenApi';
import { Almacen } from '@/core/models/Almacen';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';

export const useAlmacen = () => {

  const useGetAlmacenList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Almacen>, Error>({
      queryKey: ['almacen', 'list', page, size],
      queryFn: () => almacenApi.getList(page, size),
      onSettled: (_: ListDataResponse<Almacen> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de inventario. Por favor, intente nuevamente.'
          );
          console.error('Error fetching almacen list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Almacen>, Error>);
  };

  const useGetAlmacenItem = (id: number) => {
    return useQuery<Almacen, Error>({
      queryKey: ['almacen', 'item', id],
      queryFn: () => almacenApi.getOne(id),
      enabled: !!id,
      onSettled: (_: Almacen | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el item del inventario. Por favor, intente nuevamente.'
          );
          console.error('Error fetching almacen item:', error);
        }
      }
    } as UseQueryOptions<Almacen, Error>);
  };

  const useCreateAlmacen = () => {
    return useMutation({
      mutationFn: (data: Omit<Almacen, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'>) => almacenApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['almacen', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de almacen creado correctamente.'
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

  const useUpdateAlmacen = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Almacen> }) => 
        almacenApi.update(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['almacen', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['almacen', 'item', variables.id] });
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
        console.error('Error updating almacen item:', error);
      }
    });
  };

  const useDeleteAlmacen = () => {
    return useMutation({
      mutationFn: (id: number) => almacenApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['almacen', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de almacen eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el item de inventario. Por favor, intente nuevamente.'
        );
          console.error('Error deleting almacen item:', error);
      }
    });
  };

  return {
    useGetAlmacenList,
    useGetAlmacenItem,
    useCreateAlmacen,
    useUpdateAlmacen,
    useDeleteAlmacen
  };
}; 