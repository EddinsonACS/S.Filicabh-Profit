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

  // Define the expected file type for React Native
  type ReactNativeFile = {
    uri: string;
    name: string;
    type: string;
  };

  // Define the input type for the mutation
  type CreateArticuloFotoInput = {
    idArticulo: number;
    esPrincipal: boolean;
    orden: number;
    equipo: string;
    imageFile: ReactNativeFile;
  };

  // Type for the form data that will be sent to the API
  type ArticuloFotoFormData = FormData;

  type CreateArticuloFotoParams = {
    idArticulo: number;
    esPrincipal: boolean;
    orden: number;
    equipo: string;
    imageFile: {
      uri: string;
      name: string;
      type: string;
    };
  };

  const useCreateArticuloFoto = () => {
    return useMutation<ArticuloFoto, Error, CreateArticuloFotoParams>({
      mutationFn: async (params) => {
        try {
          console.log('📸 Iniciando subida de foto con parámetros:', {
            idArticulo: params.idArticulo,
            esPrincipal: params.esPrincipal,
            orden: params.orden,
            equipo: params.equipo,
            imageFile: {
              name: params.imageFile.name,
              type: params.imageFile.type
            }
          });
          
          // Validar parámetros requeridos
          if (!params.idArticulo || params.idArticulo <= 0) {
            throw new Error('ID de artículo inválido');
          }
          
          if (!params.imageFile || !params.imageFile.uri) {
            throw new Error('Archivo de imagen requerido');
          }
          
          const formData = new FormData();
          
          // Campos requeridos
          formData.append('IdArticulo', params.idArticulo.toString());
          formData.append('EsPrincipal', params.esPrincipal.toString());
          formData.append('Orden', params.orden.toString());
          formData.append('Equipo', params.equipo);
          
          // Preparar archivo
          const file = {
            uri: params.imageFile.uri,
            name: params.imageFile.name || `image_${Date.now()}.jpg`,
            type: params.imageFile.type || 'image/jpeg',
          };
          
          // Agregar archivo al FormData
          formData.append('ImageFile', {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);

          
          const response = await apiArticuloFoto.create(
            endpoints.inventory.articulofoto.create, 
            formData as unknown as Partial<ArticuloFoto>,
            true
          ) as ArticuloFoto;
          
          return response;
          
        } catch (error: any) {
          console.error('❌ Error en useCreateArticuloFoto - mutationFn:');
          if (error.response) {
            console.error('Error del servidor:', {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            });
          } else if (error.request) {
            console.error('No se recibió respuesta del servidor:', error.request);
          } else {
            console.error('Error al configurar la petición:', error.message);
          }
          console.error('Stack trace:', error.stack);
          throw error;
        }
      },
      onError: (error: any) => {
        console.error('Error en useCreateArticuloFoto - onError:');
        console.error('Error:', error);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['articulofoto', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['articulo', 'list'] });
      },
    });
  };

  const useUpdateArticuloFoto = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<ArticuloFoto> }) => {
        if (!formData.idArticulo) {
          throw new Error('El código de artículo es requerido');
        }
        const data: Partial<ArticuloFoto> = {
          ...formData,
          id,
        };
        
        // If there's a file, use FormData
        if (formData.idArticulo) {
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
        queryClient.invalidateQueries({ queryKey: ['articulo', 'list'] });
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
    useDeleteArticuloFoto,
  };
};

// Export individual hooks for easier imports
export const { 
  useGetArticuloFotoList, 
  useGetArticuloFotoItem, 
  useCreateArticuloFoto, 
  useUpdateArticuloFoto, 
  useDeleteArticuloFoto 
} = useArticuloFoto();
