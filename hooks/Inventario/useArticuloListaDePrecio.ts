import { ArticuloListaPrecio } from '@/core/models/Inventario/ArticuloListaPrecio';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiArticuloListaPrecio = createApiService<ArticuloListaPrecio>();

export const useArticuloListaDePrecio = () => {
  const useGetArticuloListaDePrecioList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<ArticuloListaPrecio>, Error>({
      queryKey: ['articulolistadeprecio', 'list', page, size],
      queryFn: () => apiArticuloListaPrecio.getList(endpoints.inventory.articulolistaprecio.list, page, size),
      onSettled: (_: ListDataResponse<ArticuloListaPrecio> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo lista de precio list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<ArticuloListaPrecio>, Error>);
  };

  const useGetArticuloListaDePrecioItem = (id: number) => {
    return useQuery<ArticuloListaPrecio, Error>({
      queryKey: ['articulolistadeprecio', 'item', id],
      queryFn: () => apiArticuloListaPrecio.getOne(endpoints.inventory.articulolistaprecio.getOne(id)),
      enabled: !!id,
      onSettled: (_: ArticuloListaPrecio | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo lista de precio item:', error);
        }
      }
    } as UseQueryOptions<ArticuloListaPrecio, Error>);
  };

  const useCreateArticuloListaDePrecio = () => {
    return useMutation({
      mutationFn: (formData: Partial<ArticuloListaPrecio>) => {
        if (!formData.idArticulo || !formData.idListasdePrecio || !formData.idMoneda || formData.monto === undefined) {
          throw new Error('Los campos código de artículo, lista de precios, moneda y monto son requeridos');
        }
        const data: Omit<ArticuloListaPrecio, 'id'> = {
          ...formData,
          equipo: formData.equipo || 'equipo',
          fechaDesde: formData.fechaDesde || new Date().toISOString(),
          suspendido: formData.suspendido || false,
          usuario: formData.usuario || 0,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || '',
          otrosC2: formData.otrosC2 || '',
          otrosC3: formData.otrosC3 || '',
          otrosC4: formData.otrosC4 || '',
          otrosT1: formData.otrosT1 || '',
        } as Omit<ArticuloListaPrecio, 'id'>;
        console.log("DATAAAAAAAAAAAAAAAAA",data);
        return apiArticuloListaPrecio.create(endpoints.inventory.articulolistaprecio.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulolistadeprecio', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating articulo lista de precio:', error);
      }
    });
  };

  const useUpdateArticuloListaDePrecio = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<ArticuloListaPrecio> }) => {
        if (!formData.idArticulo || !formData.idListasdePrecio || !formData.idMoneda || formData.monto === undefined) {
          throw new Error('Los campos código de artículo, lista de precios, moneda y monto son requeridos');
        }
        const data: Partial<ArticuloListaPrecio> = {
          ...formData,
          id,
        };
        return apiArticuloListaPrecio.update(endpoints.inventory.articulolistaprecio.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['articulolistadeprecio', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['articulolistadeprecio', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating articulo lista de precio:', error);
      }
    });
  };

  const useDeleteArticuloListaDePrecio = () => {
    return useMutation({
      mutationFn: (id: number) => apiArticuloListaPrecio.delete(endpoints.inventory.articulolistaprecio.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulolistadeprecio', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting articulo lista de precio:', error);
      }
    });
  };

  return {
    useGetArticuloListaDePrecioList,
    useGetArticuloListaDePrecioItem,
    useCreateArticuloListaDePrecio,
    useUpdateArticuloListaDePrecio,
    useDeleteArticuloListaDePrecio
  };
};
