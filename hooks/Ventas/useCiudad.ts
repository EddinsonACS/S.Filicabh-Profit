import { Ciudad } from '@/core/models/Ventas/Ciudad';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiCiudad = createApiService<Ciudad>();

export const useCiudad = () => {
    const { username } = authStorage();

    const useGetCiudadList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Ciudad>, Error>({
            queryKey: ['ciudad', 'list', page, size],
            queryFn: () => apiCiudad.getList(endpoints.sales.ciudad.list, page, size),
            onSettled: (_: ListDataResponse<Ciudad> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de ciudades. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching ciudad list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Ciudad>, Error>);
    };

    const useGetCiudadItem = (id: number) => {
        return useQuery<Ciudad, Error>({
            queryKey: ['ciudad', 'item', id],
            queryFn: () => apiCiudad.getOne(endpoints.sales.ciudad.getOne(id)),
            enabled: !!id,
            onSettled: (_: Ciudad | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la ciudad. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching ciudad item:', error);
                }
            }
        } as UseQueryOptions<Ciudad, Error>);
    };

    const useCreateCiudad = () => {
        return useMutation({
            mutationFn: (formData: Partial<Ciudad>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<Ciudad, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    nombre: formData.nombre,
                    codigoRegion: formData.codigoRegion || 0,
                    suspendido: formData.suspendido || false,
                    otrosF1: new Date().toISOString(),
                    otrosN1: 0,
                    otrosN2: 0,
                    otrosC1: "",
                    otrosC2: "",
                    otrosC3: "",
                    otrosC4: "",
                    otrosT1: "",
                    equipo: "equipo",
                    usuario: username ? parseInt(username) : 0
                };
                return apiCiudad.create(endpoints.sales.ciudad.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['ciudad', 'list'] });
                Alert.alert('Éxito', 'Ciudad creada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo crear la ciudad. Por favor, intente nuevamente.');
                console.error('Error creating ciudad:', error);
            }
        });
    };

    const useUpdateCiudad = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Ciudad> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<Ciudad> = {
                    ...formData,
                    id,
                    otrosF1: new Date().toISOString(),
                    otrosN1: 0,
                    otrosN2: 0,
                    otrosC1: "",
                    otrosC2: "",
                    otrosC3: "",
                    otrosC4: "",
                    otrosT1: "",
                    equipo: "equipo",
                    usuario: username ? parseInt(username) : 0
                };
                return apiCiudad.update(endpoints.sales.ciudad.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['ciudad', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['ciudad', 'item', variables.id] });
                Alert.alert('Éxito', 'Ciudad actualizada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo actualizar la ciudad. Por favor, intente nuevamente.');
                console.error('Error updating ciudad:', error);
            }
        });
    };

    const useDeleteCiudad = () => {
        return useMutation({
            mutationFn: (id: number) => apiCiudad.delete(endpoints.sales.ciudad.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['ciudad', 'list'] });
                Alert.alert('Éxito', 'Ciudad eliminada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar la ciudad. Por favor, intente nuevamente.');
                console.error('Error deleting ciudad:', error);
            }
        });
    };

    return {
        useGetCiudadList,
        useGetCiudadItem,
        useCreateCiudad,
        useUpdateCiudad,
        useDeleteCiudad
    };
};