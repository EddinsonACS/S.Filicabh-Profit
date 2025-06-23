import { Seccion } from '@/core/models/Inventario/Seccion';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiSeccion = createApiService<Seccion>();

export const useSeccion = () => {

  const useGetSeccionList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Seccion>, Error>({
      queryKey: ['seccion', 'list', page, size],
      queryFn: () => apiSeccion.getList(endpoints.inventory.seccion.list, page, size),
      onSettled: (_: ListDataResponse<Seccion> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching seccion list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Seccion>, Error>);
  };

  const useGetSeccionItem = (id: number) => {
    return useQuery<Seccion, Error>({
      queryKey: ['seccion', 'item', id],
      queryFn: () => apiSeccion.getOne(endpoints.inventory.seccion.getOne(id)),
      enabled: !!id,
      onSettled: (_: Seccion | undefined, error: Error | null) => {
        if (error) {
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
        return apiSeccion.create(endpoints.inventory.seccion.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seccion', 'list'] });
      },
      onError: (error) => {
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
          codigoGrupo: formData.codigoGrupo || 0
        };
        return apiSeccion.update(endpoints.inventory.seccion.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['seccion', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['seccion', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating seccion:', error);
      }
    });
  };

  const useDeleteSeccion = () => {
    return useMutation({
      mutationFn: (id: number) => apiSeccion.delete(endpoints.inventory.seccion.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seccion', 'list'] });
      },
      onError: (error) => {
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