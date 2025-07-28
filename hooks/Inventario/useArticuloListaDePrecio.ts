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
        console.log("FORMDATA",formData);
        if (!formData.idArticulo || !formData.idListasDePrecio || !formData.idMoneda || formData.monto === undefined) {
          throw new Error('Los campos código de artículo, lista de precios, moneda y monto son requeridos');
        }

        // Función helper para convertir fecha DD-MM-YYYY a YYYY-MM-DD
        const formatDateToISO = (dateStr: string, isRequired: boolean = false): string => {
          if (!dateStr || dateStr.trim() === '') {
            return isRequired ? new Date().toISOString().split('T')[0] : '';
          }
          
          // Si ya está en formato ISO (YYYY-MM-DD), devolver tal como está
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
          }
          
          // Si está en formato DD-MM-YYYY, convertir a YYYY-MM-DD
          if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [day, month, year] = dateStr.split('-');
            return `${year}-${month}-${day}`;
          }
          
          // Si no coincide con ningún formato, usar fecha actual para campos requeridos
          return isRequired ? new Date().toISOString().split('T')[0] : dateStr;
        };

        // Formatear fechaHasta - null si está vacía, fecha formateada si tiene valor
        const fechaHastaFormatted = formData.fechaHasta && formData.fechaHasta.trim() !== '' 
          ? formatDateToISO(formData.fechaHasta, false) 
          : null;

        // Construir solo los campos requeridos primero
        const baseData = {
          idArticulo: formData.idArticulo,
          idListasDePrecio: formData.idListasDePrecio,
          idMoneda: formData.idMoneda,
          monto: formData.monto,
          fechaDesde: formatDateToISO(formData.fechaDesde || '', true),
          equipo: formData.equipo || 'equipo',
          usuario: formData.usuario || 0,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || '',
          otrosC2: formData.otrosC2 || '',
          otrosC3: formData.otrosC3 || '',
          otrosC4: formData.otrosC4 || '',
          otrosT1: formData.otrosT1 || '',
        };

        // Agregar fechaHasta solo si tiene valor
        const data = fechaHastaFormatted 
          ? { ...baseData, fechaHasta: fechaHastaFormatted }
          : baseData;
        console.log("DATAAAAAAAAAAAAAAAAA",data);
        return apiArticuloListaPrecio.create(endpoints.inventory.articulolistaprecio.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulolistadeprecio', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating articulo lista de precio:', error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
    });
  };

  const useUpdateArticuloListaDePrecio = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<ArticuloListaPrecio> }) => {
        if (!formData.idArticulo || !formData.idListasDePrecio || !formData.idMoneda || formData.monto === undefined) {
          throw new Error('Los campos código de artículo, lista de precios, moneda y monto son requeridos');
        }

        // Función helper para convertir fecha DD-MM-YYYY a YYYY-MM-DD
        const formatDateToISO = (dateStr: string): string => {
          if (!dateStr) return '';
          
          // Si ya está en formato ISO (YYYY-MM-DD), devolver tal como está
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
          }
          
          // Si está en formato DD-MM-YYYY, convertir a YYYY-MM-DD
          if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [day, month, year] = dateStr.split('-');
            return `${year}-${month}-${day}`;
          }
          
          return dateStr; // Devolver tal como está si no coincide
        };

        const data: Partial<ArticuloListaPrecio> = {
          ...formData,
          id,
          fechaDesde: formData.fechaDesde ? formatDateToISO(formData.fechaDesde) : formData.fechaDesde,
          fechaHasta: formData.fechaHasta ? formatDateToISO(formData.fechaHasta) : formData.fechaHasta,
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
