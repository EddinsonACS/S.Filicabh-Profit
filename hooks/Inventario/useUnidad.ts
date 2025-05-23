
import { useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import ListDataResponse from '@/core/response/ListDataResponse';
import { Alert } from 'react-native';
import { Unidad } from '@/core/models/Unidad';
import { queryClient } from '@/utils/libs/queryClient';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';

const apiUnidad = createApiService<Unidad>();

export const useUnidad   = () => {

  const useGetUnidadList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Unidad>, Error>({
      queryKey: ['unidad', 'list', page, size],
      queryFn: () => apiUnidad.getList(endpoints.inventory.unidad.list, page, size),
      onSettled: (_: ListDataResponse<Unidad> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
          console.error('Error fetching unidad list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Unidad>, Error>);
  };

  const useGetUnidadItem = (id: number) => {
    return useQuery<Unidad, Error>({
      queryKey: ['unidad', 'item', id],
      queryFn: () => apiUnidad.getOne(endpoints.inventory.unidad.getOne(id)),
      enabled: !!id,
      onSettled: (_: Unidad | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el grupo. Por favor, intente nuevamente.'
          );
          console.error('Error fetching unidad item:', error);
        }
      }
    } as UseQueryOptions<Unidad, Error>);
  };

  const useCreateUnidad = () => {
    return useMutation({
      mutationFn: (formData: Partial<Unidad>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Unidad, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
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
        return apiUnidad.create(endpoints.inventory.unidad.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['unidad', 'list'] });
        Alert.alert(
          'Éxito',
          'Unidad creada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear la sección. Por favor, intente nuevamente.'
        );
        console.error('Error creating unidad:', error);
      }
    });
  };

  const useUpdateUnidad = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Unidad> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Unidad> = {
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
        return apiUnidad.update(endpoints.inventory.unidad.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['unidad', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['unidad', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Unidad actualizada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error updating unidad:', error);
      }
    });
  };

  const useDeleteUnidad = () => {
    return useMutation({
      mutationFn: (id: number) => apiUnidad.delete(endpoints.inventory.unidad.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['unidad', 'list'] });
        Alert.alert(
          'Éxito',
          'Unidad eliminada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el grupo. Por favor, intente nuevamente.'
        );
        console.error('Error deleting unidad:', error);
      }
    });
  };

  return {
    useGetUnidadList,
    useGetUnidadItem,
    useCreateUnidad,
    useUpdateUnidad,
    useDeleteUnidad
  };
}; 