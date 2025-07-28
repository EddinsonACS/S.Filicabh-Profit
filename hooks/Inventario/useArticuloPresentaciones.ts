import { ArticuloPresentaciones } from '@/core/models/Inventario/ArticuloPresentaciones';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiArticuloPresentaciones = createApiService<ArticuloPresentaciones>();

export const useArticuloPresentaciones = () => {
  const useGetArticuloPresentacionesList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<ArticuloPresentaciones>, Error>({
      queryKey: ['articulopresentaciones', 'list', page, size],
      queryFn: () => apiArticuloPresentaciones.getList(endpoints.inventory.articulopresentacion.list, page, size),
      onSettled: (_: ListDataResponse<ArticuloPresentaciones> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo presentaciones list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<ArticuloPresentaciones>, Error>);
  };

  const useGetArticuloPresentacionesItem = (id: number) => {
    return useQuery<ArticuloPresentaciones, Error>({
      queryKey: ['articulopresentaciones', 'item', id],
      queryFn: () => apiArticuloPresentaciones.getOne(endpoints.inventory.articulopresentacion.getOne(id)),
      enabled: !!id,
      onSettled: (_: ArticuloPresentaciones | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching articulo presentaciones item:', error);
        }
      }
    } as UseQueryOptions<ArticuloPresentaciones, Error>);
  };

  const useCreateArticuloPresentaciones = () => {
    return useMutation({
      mutationFn: (formData: Partial<ArticuloPresentaciones>) => {
        if (!formData.idArticulo || !formData.idPresentacion) {
          throw new Error('El ID de artículo y presentación son requeridos');
        }
        const data: Omit<ArticuloPresentaciones, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
          ...formData,
          idArticulo: formData.idArticulo,
          idPresentacion: formData.idPresentacion,
          esPrincipal: formData.esPrincipal || false,
          equivalencia: formData.equivalencia || 1,
          usarEnVentas: formData.usarEnVentas || true,
          usarEnCompras: formData.usarEnCompras || true,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || '',
          otrosC2: formData.otrosC2 || '',
          otrosC3: formData.otrosC3 || '',
          otrosC4: formData.otrosC4 || '',
          otrosT1: formData.otrosT1 || '',
          usuario: formData.usuario || 0,
          equipo: formData.equipo || 'mobile'
        };
        return apiArticuloPresentaciones.create(endpoints.inventory.articulopresentacion.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulopresentaciones', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating articulo presentaciones:', error);
      }
    });
  };

  const useUpdateArticuloPresentaciones = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<ArticuloPresentaciones> }) => {
        if (!formData.idArticulo || !formData.idPresentacion) {
          throw new Error('El ID de artículo y presentación son requeridos');
        }
        const data: Partial<ArticuloPresentaciones> = {
          ...formData,
          id,
          usuario: formData.usuario || 0,
          equipo: formData.equipo || 'mobile'
        };
        return apiArticuloPresentaciones.update(endpoints.inventory.articulopresentacion.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['articulopresentaciones', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['articulopresentaciones', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating articulo presentaciones:', error);
      }
    });
  };

  const useDeleteArticuloPresentaciones = () => {
    return useMutation({
      mutationFn: (id: number) => apiArticuloPresentaciones.delete(endpoints.inventory.articulopresentacion.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['articulopresentaciones', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting articulo presentaciones:', error);
      }
    });
  };

  return {
    useGetArticuloPresentacionesList,
    useGetArticuloPresentacionesItem,
    useCreateArticuloPresentaciones,
    useUpdateArticuloPresentaciones,
    useDeleteArticuloPresentaciones
  };
};
