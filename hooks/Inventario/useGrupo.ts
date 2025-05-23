import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';
import { grupoApi } from '@/data/api/Inventario/grupoApi';
import { Grupo } from '@/core/models/Grupo';

export const useGrupo = () => {

  const useGetGrupoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Grupo>, Error>({
      queryKey: ['grupo', 'list', page, size],
      queryFn: () => grupoApi.getList(page, size),
      onSettled: (_: ListDataResponse<Grupo> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
          console.error('Error fetching grupo list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Grupo>, Error>);
  };

  const useGetGrupoItem = (id: number) => {
    return useQuery<Grupo, Error>({
      queryKey: ['grupo', 'item', id],
      queryFn: () => grupoApi.getOne(id),
      enabled: !!id,
      onSettled: (_: Grupo | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el grupo. Por favor, intente nuevamente.'
          );
          console.error('Error fetching grupo item:', error);
        }
      }
    } as UseQueryOptions<Grupo, Error>);
  };

  const useCreateGrupo = () => {
    return useMutation({
      mutationFn: (formData: Partial<Grupo>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Grupo, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          codigoCategoria: formData.codigoCategoria || 0,
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
        return grupoApi.create(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['grupo', 'list'] });
        Alert.alert(
          'Éxito',
          'Grupo creado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el grupo. Por favor, intente nuevamente.'
        );
        console.error('Error creating grupo:', error);
      }
    });
  };

  const useUpdateGrupo = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Grupo> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Grupo> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          codigoCategoria: formData.codigoCategoria || 0,
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
        return grupoApi.update(id, data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['grupo', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['grupo', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Grupo actualizado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error updating grupo:', error);
      }
    });
  };

  const useDeleteGrupo = () => {
    return useMutation({
      mutationFn: (id: number) => grupoApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['grupo', 'list'] });
        Alert.alert(
          'Éxito',
          'Grupo eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el grupo. Por favor, intente nuevamente.'
        );
        console.error('Error deleting grupo:', error);
      }
    });
  };

  return {
    useGetGrupoList,
    useGetGrupoItem,
    useCreateGrupo,
    useUpdateGrupo,
    useDeleteGrupo
  };
}; 