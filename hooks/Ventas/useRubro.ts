import { Rubro } from '@/core/models/Ventas/Rubro';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiRubro = createApiService<Rubro>();

export const useRubro = () => {
    const { username } = authStorage();

    const useGetRubroList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Rubro>, Error>({
            queryKey: ['rubro', 'list', page, size],
            queryFn: () => apiRubro.getList(endpoints.sales.rubro.list, page, size),
            onSettled: (_: ListDataResponse<Rubro> | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching rubro list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Rubro>, Error>);
    };

    const useGetRubroItem = (id: number) => {
        return useQuery<Rubro, Error>({
            queryKey: ['rubro', 'item', id],
            queryFn: () => apiRubro.getOne(endpoints.sales.rubro.getOne(id)),
            enabled: !!id,
            onSettled: (_: Rubro | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching rubro item:', error);
                }
            }
        } as UseQueryOptions<Rubro, Error>);
    };

    const useCreateRubro = () => {
        return useMutation({
            mutationFn: (formData: Partial<Rubro>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<Rubro, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    nombre: formData.nombre,
                    codigoListaPrecio: formData.codigoListaPrecio || 0,
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
                return apiRubro.create(endpoints.sales.rubro.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['rubro', 'list'] });
            },
            onError: (error) => {
                console.error('Error creating rubro:', error);
            }
        });
    };

    const useUpdateRubro = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Rubro> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<Rubro> = {
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
                return apiRubro.update(endpoints.sales.rubro.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['rubro', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['rubro', 'item', variables.id] });
            },
            onError: (error) => {
                console.error('Error updating rubro:', error);
            }
        });
    };

    const useDeleteRubro = () => {
        return useMutation({
            mutationFn: (id: number) => apiRubro.delete(endpoints.sales.rubro.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['rubro', 'list'] });
            },
            onError: (error) => {
                console.error('Error deleting rubro:', error);
            }
        });
    };

    return {
        useGetRubroList,
        useGetRubroItem,
        useCreateRubro,
        useUpdateRubro,
        useDeleteRubro
    };
};