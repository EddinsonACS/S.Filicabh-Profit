import { ArticuloUbicacion } from '@/core/models/Inventario/ArticuloUbicacion';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiArticuloUbicacion = createApiService<ArticuloUbicacion>();

export const useArticuloUbicacion = () => {
  const useGetArticuloUbicacionList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<ArticuloUbicacion>, Error>({
      queryKey: ['articuloubicacion', 'list', page, size],
      queryFn: () => apiArticuloUbicacion.getList(endpoints.inventory.articuloubicacion.list, page, size),
      onSettled: (_: ListDataResponse<ArticuloUbicacion> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo ubicacion list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<ArticuloUbicacion>, Error>);
  };

  const useGetArticuloUbicacionItem = (id: number) => {
    return useQuery<ArticuloUbicacion, Error>({
      queryKey: ['articuloubicacion', 'item', id],
      queryFn: () => apiArticuloUbicacion.getOne(endpoints.inventory.articuloubicacion.getOne(id)),
      enabled: !!id,
      onSettled: (_: ArticuloUbicacion | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo ubicacion item:', error);
        }
      }
    } as UseQueryOptions<ArticuloUbicacion, Error>);
  };

  const useCreateArticuloUbicacion = () => {
    return useMutation({
      mutationFn: (formData: Partial<ArticuloUbicacion>) => {
        console.log('🔵 Datos del formulario ubicacion recibidos:', formData);
        
        if (!formData.idArticulo || !formData.idAlmacen || !formData.ubicacion) {
          throw new Error('Los campos ID de artículo, ID de almacén y ubicación son requeridos');
        }
        
        const data: Omit<ArticuloUbicacion, 'id'> = {
          idArticulo: Number(formData.idArticulo),
          idAlmacen: Number(formData.idAlmacen),
          ubicacion: formData.ubicacion,
          equipo: formData.equipo || 'equipo',
          otrosF1: new Date().toISOString(),
          otrosN1: Number(formData.otrosN1) || 0,
          otrosN2: Number(formData.otrosN2) || 0,
          otrosC1: formData.otrosC1 || '',
          otrosC2: formData.otrosC2 || '',
          otrosC3: formData.otrosC3 || '',
          otrosC4: formData.otrosC4 || '',
          otrosT1: formData.otrosT1 || '',
          usuario: Number(formData.usuario) || 0
        };
        
        console.log('🔵 Datos de ubicacion que se enviarán al servidor:', JSON.stringify(data, null, 2));
        return apiArticuloUbicacion.create(endpoints.inventory.articuloubicacion.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articuloubicacion'] });
      },
      onError: (error) => {
        console.error('Error creating articulo ubicacion:', error);
      }
    });
  };

  const useUpdateArticuloUbicacion = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<ArticuloUbicacion> }) => {
        if (!formData.idArticulo || !formData.idAlmacen || !formData.ubicacion) {
          throw new Error('Los campos ID de artículo, ID de almacén y ubicación son requeridos');
        }
        const data: Partial<ArticuloUbicacion> = {
          ...formData,
          id,
        };
        return apiArticuloUbicacion.update(endpoints.inventory.articuloubicacion.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['articuloubicacion'] });
        queryClient.invalidateQueries({ queryKey: ['articuloubicacion', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating articulo ubicacion:', error);
      }
    });
  };

  const useDeleteArticuloUbicacion = () => {
    return useMutation({
      mutationFn: (id: number) => apiArticuloUbicacion.delete(endpoints.inventory.articuloubicacion.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articuloubicacion', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting articulo ubicacion:', error);
      }
    });
  };

  return {
    useGetArticuloUbicacionList,
    useGetArticuloUbicacionItem,
    useCreateArticuloUbicacion,
    useUpdateArticuloUbicacion,
    useDeleteArticuloUbicacion
  };
};
