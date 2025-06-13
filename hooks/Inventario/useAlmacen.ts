import { Almacen } from '@/core/models/Inventario/Almacen';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiAlmacen = createApiService<Almacen>();

export const useAlmacen = () => {

  const useGetAlmacenList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Almacen>, Error>({
      queryKey: ['almacen', 'list', page, size],
      queryFn: () => apiAlmacen.getList(endpoints.inventory.almacen.list, page, size),
      onSettled: (_: ListDataResponse<Almacen> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching almacen list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Almacen>, Error>);
  };

  const useGetAlmacenItem = (id: number) => {
    return useQuery<Almacen, Error>({
      queryKey: ['almacen', 'item', id],
      queryFn: () => apiAlmacen.getOne(endpoints.inventory.almacen.getOne(id)),
      enabled: !!id,
      onSettled: (_: Almacen | undefined, error: Error | null) => {
        if (error) {
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
        return apiAlmacen.create(endpoints.inventory.almacen.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['almacen', 'list'] });
      },
      onError: (error) => {
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
          id: id,
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
        return apiAlmacen.update(endpoints.inventory.almacen.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['almacen', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['almacen', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating almacen item:', error);
      }
    });
  };

  const useDeleteAlmacen = () => {
    return useMutation({
      mutationFn: (id: number) => apiAlmacen.delete(endpoints.inventory.almacen.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['almacen', 'list'] });
      },
      onError: (error) => {
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