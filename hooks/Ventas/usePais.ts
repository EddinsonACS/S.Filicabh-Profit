import { Pais } from '@/core/models/Ventas/Pais';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiPais = createApiService<Pais>();

export const usePais = () => {
    const { username } = authStorage();

    const useGetPaisList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Pais>, Error>({
            queryKey: ['pais', 'list', page, size],
            queryFn: () => apiPais.getList(endpoints.sales.pais.list, page, size),
            onSettled: (_: ListDataResponse<Pais> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de países. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching pais list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Pais>, Error>);
    };

    const useGetPaisItem = (id: number) => {
        return useQuery<Pais, Error>({
            queryKey: ['pais', 'item', id],
            queryFn: () => apiPais.getOne(endpoints.sales.pais.getOne(id)),
            enabled: !!id,
            onSettled: (_: Pais | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar el país. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching pais item:', error);
                }
            }
        } as UseQueryOptions<Pais, Error>);
    };

    const useCreatePais = () => {
        return useMutation({
            mutationFn: (formData: Partial<Pais>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<Pais, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    codigo: formData.codigo || "",
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
                    usuario: username ? parseInt(username) : 0
                };
                return apiPais.create(endpoints.sales.pais.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['pais', 'list'] });
                Alert.alert('Éxito', 'País creado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo crear el país. Por favor, intente nuevamente.');
                console.error('Error creating pais:', error);
            }
        });
    };

    const useUpdatePais = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Pais> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<Pais> = {
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
                return apiPais.update(endpoints.sales.pais.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['pais', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['pais', 'item', variables.id] });
                Alert.alert('Éxito', 'País actualizado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo actualizar el país. Por favor, intente nuevamente.');
                console.error('Error updating pais:', error);
            }
        });
    };

    const useDeletePais = () => {
        return useMutation({
            mutationFn: (id: number) => apiPais.delete(endpoints.sales.pais.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['pais', 'list'] });
                Alert.alert('Éxito', 'País eliminado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar el país. Por favor, intente nuevamente.');
                console.error('Error deleting pais:', error);
            }
        });
    };

    return {
        useGetPaisList,
        useGetPaisItem,
        useCreatePais,
        useUpdatePais,
        useDeletePais
    };
};