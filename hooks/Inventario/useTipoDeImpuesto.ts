import { useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';
import { TipoDeImpuesto } from '@/core/models/TipoDeImpuesto';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';

const apiTipoDeImpuesto = createApiService<TipoDeImpuesto>();

export const useTipoDeImpuesto   = () => {

  const useGetTipoDeImpuestoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<TipoDeImpuesto>, Error>({
      queryKey: ['tipoDeImpuesto', 'list', page, size],
      queryFn: () => apiTipoDeImpuesto.getList(endpoints.inventory.tipoDeImpuesto.list, page, size),
      onSettled: (_: ListDataResponse<TipoDeImpuesto> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
          console.error('Error fetching tipo de impuesto list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<TipoDeImpuesto>, Error>);
  };

  const useGetTipoDeImpuestoItem = (id: number) => {
    return useQuery<TipoDeImpuesto, Error>({
      queryKey: ['tipoDeImpuesto', 'item', id],
      queryFn: () => apiTipoDeImpuesto.getOne(endpoints.inventory.tipoDeImpuesto.getOne(id)),
      enabled: !!id,
      onSettled: (_: TipoDeImpuesto | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el grupo. Por favor, intente nuevamente.'
          );
        console.error('Error fetching tipo de impuesto item:', error);
        }
      }
    } as UseQueryOptions<TipoDeImpuesto, Error>);
  };

  const useCreateTipoDeImpuesto = () => {
    return useMutation({
      mutationFn: (formData: Partial<TipoDeImpuesto>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<TipoDeImpuesto, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
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
        return apiTipoDeImpuesto.create(endpoints.inventory.tipoDeImpuesto.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tipoDeImpuesto', 'list'] });
        Alert.alert(
          'Éxito',
          'Tipo de impuesto creado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el tipo de impuesto. Por favor, intente nuevamente.'
        );
        console.error('Error creating tipo de impuesto:', error);
      }
    });
  };

  const useUpdateTipoDeImpuesto = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<TipoDeImpuesto> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<TipoDeImpuesto> = {
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
        return apiTipoDeImpuesto.update(endpoints.inventory.tipoDeImpuesto.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tipoDeImpuesto', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['tipoDeImpuesto', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Tipo de impuesto actualizado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error updating tipo de impuesto:', error);
      }
    });
  };

  const useDeleteTipoDeImpuesto = () => {
    return useMutation({
      mutationFn: (id: number) => apiTipoDeImpuesto.delete(endpoints.inventory.tipoDeImpuesto.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tipoDeImpuesto', 'list'] });
        Alert.alert(
          'Éxito',
          'Tipo de impuesto eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el grupo. Por favor, intente nuevamente.'
        );
        console.error('Error deleting tipo de impuesto:', error);
      }
    });
  };

  return {
    useGetTipoDeImpuestoList,
    useGetTipoDeImpuestoItem,
    useCreateTipoDeImpuesto,
    useUpdateTipoDeImpuesto,
    useDeleteTipoDeImpuesto
  };
}; 