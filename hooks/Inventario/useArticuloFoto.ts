import { ArticuloFoto } from '@/core/models/Inventario/ArticuloFoto';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiArticuloFoto = createApiService<ArticuloFoto>();

export const useArticuloFoto = () => {
  const useGetArticuloFotoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<ArticuloFoto>, Error>({
      queryKey: ['articulofoto', 'list', page, size],
      queryFn: () => apiArticuloFoto.getList(endpoints.inventory.articulofoto.list, page, size),
      onSettled: (_: ListDataResponse<ArticuloFoto> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo foto list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<ArticuloFoto>, Error>);
  };

  const useGetArticuloFotoItem = (id: number) => {
    return useQuery<ArticuloFoto, Error>({
      queryKey: ['articulofoto', 'item', id],
      queryFn: () => apiArticuloFoto.getOne(endpoints.inventory.articulofoto.getOne(id)),
      enabled: !!id,
      onSettled: (_: ArticuloFoto | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo foto item:', error);
        }
      }
    } as UseQueryOptions<ArticuloFoto, Error>);
  };

  const useCreateArticuloFoto = () => {
    return useMutation({
      mutationFn: (formData: Partial<ArticuloFoto>) => {
        if (!formData.CodigoArticulo || !formData.ImageFile) {
          throw new Error('El código de artículo y la imagen son requeridos');
        }
        const data: Omit<ArticuloFoto, 'id'> = {
          ...formData,
          EsPrincipal: formData.EsPrincipal || false,
          Orden: formData.Orden || 0,
          Equipo: formData.Equipo || 'equipo'
        } as Omit<ArticuloFoto, 'id'>;
        
        // Create FormData for file upload
        const formDataToSend = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value as string | Blob);
          }
        });
        
        return apiArticuloFoto.create(endpoints.inventory.articulofoto.create, formDataToSend as Partial<ArticuloFoto>,true);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulofoto', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating articulo foto:', error);
      }
    });
  };

  const useUpdateArticuloFoto = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<ArticuloFoto> }) => {
        if (!formData.CodigoArticulo) {
          throw new Error('El código de artículo es requerido');
        }
        const data: Partial<ArticuloFoto> = {
          ...formData,
          id,
        };
        
        // If there's a file, use FormData
        if (formData.ImageFile) {
          const formDataToSend = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formDataToSend.append(key, value as string | Blob);
            }
          });
          return apiArticuloFoto.update(endpoints.inventory.articulofoto.update(id), formDataToSend as Partial<ArticuloFoto>, true);
        }
        
        return apiArticuloFoto.update(endpoints.inventory.articulofoto.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['articulofoto', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['articulofoto', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating articulo foto:', error);
      }
    });
  };

  const useDeleteArticuloFoto = () => {
    return useMutation({
      mutationFn: (id: number) => apiArticuloFoto.delete(endpoints.inventory.articulofoto.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulofoto', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting articulo foto:', error);
      }
    });
  };

  return {
    useGetArticuloFotoList,
    useGetArticuloFotoItem,
    useCreateArticuloFoto,
    useUpdateArticuloFoto,
    useDeleteArticuloFoto
  };
};
