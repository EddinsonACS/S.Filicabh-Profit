import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';
import { seccionApi } from '@/data/api/Inventario/seccionApi';
import { Seccion } from '@/core/models/Seccion';

export const useSeccion = () => {

  const useGetSeccionList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Seccion>, Error>({
      queryKey: ['seccion', 'list', page, size],
      queryFn: () => seccionApi.getList(page, size),
      onSettled: (_: ListDataResponse<Seccion> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
          console.error('Error fetching seccion list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Seccion>, Error>);
  };

  const useGetSeccionItem = (id: number) => {
    return useQuery<Seccion, Error>({
      queryKey: ['seccion', 'item', id],
      queryFn: () => seccionApi.getOne(id),
      enabled: !!id,
      onSettled: (_: Seccion | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el grupo. Por favor, intente nuevamente.'
          );
          console.error('Error fetching seccion item:', error);
        }
      }
    } as UseQueryOptions<Seccion, Error>);
  };

  const useCreateSeccion = () => {
    return useMutation({
      mutationFn: (formData: Partial<Seccion>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Seccion, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
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
          codigoGrupo: formData.codigoGrupo || 0
        };
        return seccionApi.create(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seccion', 'list'] });
        Alert.alert(
          'Éxito',
          'Sección creada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear la sección. Por favor, intente nuevamente.'
        );
        console.error('Error creating seccion:', error);
      }
    });
  };

  const useUpdateSeccion = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Seccion> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Seccion> = {
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
          codigoGrupo: formData.codigoGrupo || 0
        };
        return seccionApi.update(id, data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['seccion', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['seccion', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Sección actualizada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar la categoría. Por favor, intente nuevamente.'
        );
        console.error('Error updating seccion:', error);
      }
    });
  };

  const useDeleteSeccion = () => {
    return useMutation({
      mutationFn: (id: number) => seccionApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seccion', 'list'] });
        Alert.alert(
          'Éxito',
          'Sección eliminada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el grupo. Por favor, intente nuevamente.'
        );
        console.error('Error deleting seccion:', error);
      }
    });
  };

  return {
    useGetSeccionList,
    useGetSeccionItem,
    useCreateSeccion,
    useUpdateSeccion,
    useDeleteSeccion
  };
}; 