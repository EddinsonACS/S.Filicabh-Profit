import { useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import ListDataResponse from '@/core/response/ListDataResponse';
import { Alert } from 'react-native';
import { Color } from '@/core/models/Color';
import { queryClient } from '@/utils/libs/queryClient';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';

const colorApiGeneric = createApiService<Color>();

export const useColor   = () => {

  const useGetColorList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Color>, Error>({
      queryKey: ['color', 'list', page, size],
      queryFn: () => colorApiGeneric.getList(endpoints.inventory.color.list, page, size),
      onSettled: (_: ListDataResponse<Color> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
          console.error('Error fetching color list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Color>, Error>);
  };

  const useGetColorItem = (id: number) => {
    return useQuery<Color, Error>({
      queryKey: ['color', 'item', id],
      queryFn: () => colorApiGeneric.getOne(endpoints.inventory.color.getOne(id)),
      enabled: !!id,
      onSettled: (_: Color | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el color. Por favor, intente nuevamente.'
          );
          console.error('Error fetching color item:', error);
        }
      }
    } as UseQueryOptions<Color, Error>);
  };

  const useCreateColor = () => {
    return useMutation({
      mutationFn: (formData: Partial<Color>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Color, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
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
        return colorApiGeneric.create(endpoints.inventory.color.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['color', 'list'] });
        Alert.alert(
          'Éxito',
          'Color creada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el color. Por favor, intente nuevamente.'
        );
        console.error('Error creating color:', error);
      }
    });
  };

  const useUpdateColor = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Color> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Color> = {
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
        return colorApiGeneric.update(endpoints.inventory.color.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['color', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['color', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Color actualizada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar el color. Por favor, intente nuevamente.'
        );
        console.error('Error updating color:', error);
      }
    });
  };

  const useDeleteColor = () => {
    return useMutation({
      mutationFn: (id: number) => colorApiGeneric.delete(endpoints.inventory.color.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['color', 'list'] });
        Alert.alert(
          'Éxito',
          'Color eliminada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el color. Por favor, intente nuevamente.'
        );
        console.error('Error deleting color:', error);
      }
    });
  };

  return {
    useGetColorList,
    useGetColorItem,
    useCreateColor,
    useUpdateColor,
    useDeleteColor
  };
};