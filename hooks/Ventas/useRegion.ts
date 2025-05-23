import { Region } from '@/core/models/Ventas/Region';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiRegion = createApiService<Region>();

export const useRegion = () => {
    const { username } = authStorage();

    const useGetRegionList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Region>, Error>({
            queryKey: ['region', 'list', page, size],
            queryFn: () => apiRegion.getList(endpoints.sales.region.list, page, size),
            onSettled: (_: ListDataResponse<Region> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de regiones. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching region list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Region>, Error>);
    };

    const useGetRegionItem = (id: number) => {
        return useQuery<Region, Error>({
            queryKey: ['region', 'item', id],
            queryFn: () => apiRegion.getOne(endpoints.sales.region.getOne(id)),
            enabled: !!id,
            onSettled: (_: Region | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la región. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching region item:', error);
                }
            }
        } as UseQueryOptions<Region, Error>);
    };

    const useCreateRegion = () => {
        return useMutation({
            mutationFn: async (formData: Partial<Region>) => {
                try {
                    console.log('=== REGIÓN DEBUG START ===');
                    console.log('Region form data received:', formData);
                    console.log('Username from authStorage:', username);

                    if (!formData.nombre) {
                        throw new Error('El nombre es requerido');
                    }

                    let usuarioId = 1;
                    if (username) {
                        const parsedUser = parseInt(username);
                        if (!isNaN(parsedUser)) {
                            usuarioId = parsedUser;
                        }
                    }

                    console.log('Final usuario ID:', usuarioId);

                    const data = {
                        nombre: formData.nombre,
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
                        usuario: usuarioId
                    };

                    console.log('Region data being sent to API:', JSON.stringify(data, null, 2));
                    console.log('API URL:', endpoints.sales.region.create);

                    const result = await apiRegion.create(endpoints.sales.region.create, data);
                    console.log('API SUCCESS:', result);
                    return result;

                } catch (error) {
                    console.log('=== REGIÓN ERROR DETAILS ===');
                    console.error('Error type:', typeof error);
                    console.error('Error name:', error?.constructor?.name);
                    console.error('Error message:', error?.message);

                    if (error?.response) {
                        console.error('Response status:', error.response.status);
                        console.error('Response statusText:', error.response.statusText);
                        console.error('Response headers:', error.response.headers);
                        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
                    }

                    if (error?.request) {
                        console.error('Request details:', error.request);
                    }

                    console.error('Full error object:', error);
                    console.log('=== REGIÓN ERROR END ===');

                    throw error; // Re-throw para que llegue al onError
                }
            },
            onSuccess: (result) => {
                console.log('=== REGIÓN SUCCESS ===');
                console.log('Created region:', result);
                queryClient.invalidateQueries({ queryKey: ['region', 'list'] });
                Alert.alert('Éxito', 'Región creada correctamente.');
            },
            onError: (error) => {
                console.log('=== REGIÓN MUTATION ERROR ===');
                console.error('Mutation error:', error);
                Alert.alert('Error', 'No se pudo crear la región. Por favor, intente nuevamente.');
            }
        });
    };

    const useUpdateRegion = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Region> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }

                // Mismo manejo del usuario
                let usuarioId = 1;
                if (username) {
                    const parsedUser = parseInt(username);
                    if (!isNaN(parsedUser)) {
                        usuarioId = parsedUser;
                    }
                }

                const data = {
                    id,
                    nombre: formData.nombre,
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
                    usuario: usuarioId
                };

                console.log('Region update data being sent:', data); // Debug
                return apiRegion.update(endpoints.sales.region.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['region', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['region', 'item', variables.id] });
                Alert.alert('Éxito', 'Región actualizada correctamente.');
            },
            onError: (error) => {
                console.error('Region update error:', error);
                if (error.response?.data) {
                    console.error('Region update error response data:', error.response.data);
                }
                Alert.alert('Error', 'No se pudo actualizar la región. Por favor, intente nuevamente.');
            }
        });
    };

    const useDeleteRegion = () => {
        return useMutation({
            mutationFn: (id: number) => apiRegion.delete(endpoints.sales.region.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['region', 'list'] });
                Alert.alert('Éxito', 'Región eliminada correctamente.');
            },
            onError: (error) => {
                console.error('Region delete error:', error);
                if (error.response?.data) {
                    console.error('Region delete error response data:', error.response.data);
                }
                Alert.alert('Error', 'No se pudo eliminar la región. Por favor, intente nuevamente.');
            }
        });
    };

    return {
        useGetRegionList,
        useGetRegionItem,
        useCreateRegion,
        useUpdateRegion,
        useDeleteRegion
    };
};