import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { almacenApi } from '@/data/api/Inventario/almacenApi';
import { Almacen } from '@/core/models/Almacen';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';
import { authStorage } from '@/data/global/authStorage';

export const useAlmacen = () => {
  const { username } = authStorage();

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
      mutationFn: (formData: Partial<Almacen>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Almacen, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
          nombre: formData.nombre,
          aplicaVentas: formData.aplicaVentas || false,
          aplicaCompras: formData.aplicaCompras || false,
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
        return almacenApi.create(data);
      },
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
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Almacen> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Almacen> = {
          nombre: formData.nombre,
          aplicaVentas: formData.aplicaVentas || false,
          aplicaCompras: formData.aplicaCompras || false,
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
        return almacenApi.update(id, data);
      },
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