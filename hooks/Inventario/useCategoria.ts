import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Categoria } from '@/core/models/Categoria';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';
import { endpoints } from '@/utils/const/endpoints';
import { createApiService } from '@/data/api/apiGeneric';

const apiCategoria = createApiService<Categoria>();

export const useCategoria = () => {

  const useGetCategoriaList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Categoria>, Error>({
      queryKey: ['categoria', 'list', page, size],
      queryFn: () => apiCategoria.getList(endpoints.inventory.categoria.list, page, size),
      onSettled: (_: ListDataResponse<Categoria> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
          console.error('Error fetching categoria list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Categoria>, Error>);
  };

  const useGetCategoriaItem = (id: number) => {
    return useQuery<Categoria, Error>({
      queryKey: ['categoria', 'item', id],
      queryFn: () => apiCategoria.getOne(endpoints.inventory.categoria.getOne(id)),
      enabled: !!id,
      onSettled: (_: Categoria | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la categoría. Por favor, intente nuevamente.'
          );
          console.error('Error fetching categoria item:', error);
        }
      }
    } as UseQueryOptions<Categoria, Error>);
  };

  const useCreateCategoria = () => {
    return useMutation({
      mutationFn: (formData: Partial<Categoria>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Categoria, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
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
          equipo: 'equipo'
        };
        return apiCategoria.create(endpoints.inventory.categoria.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categoria', 'list'] });
        Alert.alert(
          'Éxito',
          'Categoría creada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error creating categoria:', error);
      }
    });
  };

  const useUpdateCategoria = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Categoria> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Categoria> = {
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
          equipo: 'equipo'
        };
        return apiCategoria.update(endpoints.inventory.categoria.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['categoria', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['categoria', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Categoría actualizada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error updating categoria:', error);
      }
    });
  };

  const useDeleteCategoria = () => {
    return useMutation({
      mutationFn: (id: number) => apiCategoria.delete(endpoints.inventory.categoria.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categoria', 'list'] });
        Alert.alert(
          'Éxito',
          'Categoría eliminada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error deleting categoria:', error);
      }
    });
  };

  return {
    useGetCategoriaList,
    useGetCategoriaItem,
    useCreateCategoria,
    useUpdateCategoria,
    useDeleteCategoria
  };
}; 