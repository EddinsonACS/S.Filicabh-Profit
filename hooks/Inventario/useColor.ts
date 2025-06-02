import { Color } from '@/core/models/Inventario/Color';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiColor = createApiService<Color>();

export const useColor = () => {

  const useGetColorList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Color>, Error>({
      queryKey: ['color', 'list', page, size],
      queryFn: () => apiColor.getList(endpoints.inventory.color.list, page, size),
      onSettled: (_: ListDataResponse<Color> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching color list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Color>, Error>);
  };

  const useGetColorItem = (id: number) => {
    return useQuery<Color, Error>({
      queryKey: ['color', 'item', id],
      queryFn: () => apiColor.getOne(endpoints.inventory.color.getOne(id)),
      enabled: !!id,
      onSettled: (_: Color | undefined, error: Error | null) => {
        if (error) {
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
        const data: Omit<Color, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
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
          usuario: 1,
          equipo: 'equipo'
        };
        return apiColor.create(endpoints.inventory.color.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['color', 'list'] });
      },
      onError: (error) => {
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
          usuario: 1,
          equipo: 'equipo'
        };
        return apiColor.update(endpoints.inventory.color.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['color', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['color', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating color:', error);
      }
    });
  };

  const useDeleteColor = () => {
    return useMutation({
      mutationFn: (id: number) => apiColor.delete(endpoints.inventory.color.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['color', 'list'] });
      },
      onError: (error) => {
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