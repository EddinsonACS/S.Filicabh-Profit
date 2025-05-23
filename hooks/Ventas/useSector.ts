import { Sector } from '@/core/models/Ventas/Sector';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiSector = createApiService<Sector>();

export const useSector = () => {
    const { username } = authStorage();

    const useGetSectorList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Sector>, Error>({
            queryKey: ['sector', 'list', page, size],
            queryFn: () => apiSector.getList(endpoints.sales.sector.list, page, size),
            onSettled: (_: ListDataResponse<Sector> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de sectores. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching sector list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Sector>, Error>);
    };

    const useGetSectorItem = (id: number) => {
        return useQuery<Sector, Error>({
            queryKey: ['sector', 'item', id],
            queryFn: () => apiSector.getOne(endpoints.sales.sector.getOne(id)),
            enabled: !!id,
            onSettled: (_: Sector | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar el sector. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching sector item:', error);
                }
            }
        } as UseQueryOptions<Sector, Error>);
    };

    const useCreateSector = () => {
        return useMutation({
            mutationFn: (formData: Partial<Sector>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<Sector, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
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
                return apiSector.create(endpoints.sales.sector.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['sector', 'list'] });
                Alert.alert('Éxito', 'Sector creado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo crear el sector. Por favor, intente nuevamente.');
                console.error('Error creating sector:', error);
            }
        });
    };

    const useUpdateSector = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Sector> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<Sector> = {
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
                return apiSector.update(endpoints.sales.sector.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['sector', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['sector', 'item', variables.id] });
                Alert.alert('Éxito', 'Sector actualizado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo actualizar el sector. Por favor, intente nuevamente.');
                console.error('Error updating sector:', error);
            }
        });
    };

    const useDeleteSector = () => {
        return useMutation({
            mutationFn: (id: number) => apiSector.delete(endpoints.sales.sector.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['sector', 'list'] });
                Alert.alert('Éxito', 'Sector eliminado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar el sector. Por favor, intente nuevamente.');
                console.error('Error deleting sector:', error);
            }
        });
    };

    return {
        useGetSectorList,
        useGetSectorItem,
        useCreateSector,
        useUpdateSector,
        useDeleteSector
    };
};