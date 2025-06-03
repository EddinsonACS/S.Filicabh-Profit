import { Articulo } from '@/core/models/Inventario/Articulo';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiArticulo = createApiService<Articulo>();

export const useArticulo = () => {
  const useGetArticuloList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Articulo>, Error>({
      queryKey: ['articulo', 'list', page, size],
      queryFn: () => apiArticulo.getList(endpoints.inventory.articulo.list, page, size),
      onSettled: (_: ListDataResponse<Articulo> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Articulo>, Error>);
  };

  const useGetArticuloItem = (id: number) => {
    return useQuery<Articulo, Error>({
      queryKey: ['articulo', 'item', id],
      queryFn: () => apiArticulo.getOne(endpoints.inventory.articulo.getOne(id)),
      enabled: !!id,
      onSettled: (_: Articulo | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo item:', error);
        }
      }
    } as UseQueryOptions<Articulo, Error>);
  };

  const useCreateArticulo = () => {
    return useMutation({
      mutationFn: (formData: Partial<Articulo>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        // Aquí puedes agregar lógica para los campos requeridos y defaults
        // El backend debe aceptar los campos tal como el modelo Articulo
        const data: Omit<Articulo, 'id'> = {
          ...formData,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          equipo: 'equipo',
          usuario: 0,
          presentaciones: [],
        } as Omit<Articulo, 'id'>;
        console.log(data);
        return apiArticulo.create(endpoints.inventory.articulo.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulo', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating articulo:', error);
      }
    });
  };

  const useUpdateArticulo = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Articulo> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Articulo> = {
          ...formData,
          id,
        };
        return apiArticulo.update(endpoints.inventory.articulo.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['articulo', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['articulo', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating articulo:', error);
      }
    });
  };

  const useDeleteArticulo = () => {
    return useMutation({
      mutationFn: (id: number) => apiArticulo.delete(endpoints.inventory.articulo.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulo', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting articulo:', error);
      }
    });
  };

  return {
    useGetArticuloList,
    useGetArticuloItem,
    useCreateArticulo,
    useUpdateArticulo,
    useDeleteArticulo
  };
};
