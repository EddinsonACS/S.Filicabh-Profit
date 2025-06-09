import { TipoDeArticulo } from '@/core/models/Inventario/TipoDeArticulo';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiTipoDeArticulo = createApiService<TipoDeArticulo>();

export const useTipoDeArticulo   = () => {

  const useGetTipoDeArticuloList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<TipoDeArticulo>, Error>({
      queryKey: ['tipoDeArticulo', 'list', page, size],
      queryFn: () => apiTipoDeArticulo.getList(endpoints.inventory.tipoDeArticulo.list, page, size),
      onSettled: (_: ListDataResponse<TipoDeArticulo> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching tipo de articulo list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<TipoDeArticulo>, Error>);
  };

  const useGetTipoDeArticuloItem = (id: number) => {
    return useQuery<TipoDeArticulo, Error>({
      queryKey: ['tipoDeArticulo', 'item', id],
      queryFn: () => apiTipoDeArticulo.getOne(endpoints.inventory.tipoDeArticulo.getOne(id)),
      enabled: !!id,
      onSettled: (_: TipoDeArticulo | undefined, error: Error | null) => {
        if (error) {
        console.error('Error fetching tipo de articulo item:', error);
        }
      }
    } as UseQueryOptions<TipoDeArticulo, Error>);
  };

  const useCreateTipoDeArticulo = () => {
    return useMutation({
      mutationFn: (formData: Partial<TipoDeArticulo>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<TipoDeArticulo, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
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
          manejaInventario: formData.manejaInventario || false,
        };
        return apiTipoDeArticulo.create(endpoints.inventory.tipoDeArticulo.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tipoDeArticulo', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating tipo de articulo:', error);
      }
    });
  };

  const useUpdateTipoDeArticulo = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<TipoDeArticulo> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<TipoDeArticulo> = {
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
          manejaInventario: formData.manejaInventario || false,
        };
        return apiTipoDeArticulo.update(endpoints.inventory.tipoDeArticulo.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tipoDeArticulo', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['tipoDeArticulo', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating tipo de articulo:', error);
      }
    });
  };

  const useDeleteTipoDeArticulo = () => {
    return useMutation({
      mutationFn: (id: number) => apiTipoDeArticulo.delete(endpoints.inventory.tipoDeArticulo.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tipoDeArticulo', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting tipo de articulo:', error);
      }
    });
  };

  return {
    useGetTipoDeArticuloList,
    useGetTipoDeArticuloItem,
    useCreateTipoDeArticulo,
    useUpdateTipoDeArticulo,
    useDeleteTipoDeArticulo
  };
}; 