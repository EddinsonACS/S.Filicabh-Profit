import { Sector } from '@/core/models/Ventas/Sector';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiSector = createApiService<Sector>();

export const useSector = () => {
    const { username } = authStorage();

    const useGetSectorList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Sector>, Error>({
            queryKey: ['sector', 'list', page, size],
            queryFn: () => apiSector.getList(endpoints.sales.sector.list, page, size),
            onSettled: (_: ListDataResponse<Sector> | undefined, error: Error | null) => {
                if (error) {
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
                    usuario: username ? (parseInt(username) || 1) : 1
                };
                return apiSector.create(endpoints.sales.sector.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['sector', 'list'] });
            },
            onError: (error) => {
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
                    usuario: username ? (parseInt(username) || 1) : 1
                };
                return apiSector.update(endpoints.sales.sector.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['sector', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['sector', 'item', variables.id] });
            },
            onError: (error) => {
                console.error('Error updating sector:', error);
            }
        });
    };

    const useDeleteSector = () => {
        return useMutation({
            mutationFn: (id: number) => apiSector.delete(endpoints.sales.sector.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['sector', 'list'] });
            },
            onError: (error) => {
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