import { Vendedor } from '@/core/models/Ventas/Vendedor';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiVendedor = createApiService<Vendedor>();

export const useVendedor = () => {
    const { username } = authStorage();

    const useGetVendedorList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Vendedor>, Error>({
            queryKey: ['vendedor', 'list', page, size],
            queryFn: () => apiVendedor.getList(endpoints.sales.vendedor.list, page, size),
            onSettled: (_: ListDataResponse<Vendedor> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de vendedores. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching vendedor list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Vendedor>, Error>);
    };

    const useGetVendedorItem = (id: number) => {
        return useQuery<Vendedor, Error>({
            queryKey: ['vendedor', 'item', id],
            queryFn: () => apiVendedor.getOne(endpoints.sales.vendedor.getOne(id)),
            enabled: !!id,
            onSettled: (_: Vendedor | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar el vendedor. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching vendedor item:', error);
                }
            }
        } as UseQueryOptions<Vendedor, Error>);
    };

    const useCreateVendedor = () => {
        return useMutation({
            mutationFn: (formData: Partial<Vendedor>) => {
                console.log('=== HOOK VENDEDOR EJECUTÁNDOSE ===');
                console.log('Datos recibidos en hook:', formData);

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

                // FUNCIÓN HELPER PARA MANEJAR STRINGS VACÍOS
                const getStringValue = (value: string | undefined): string | null => {
                    if (!value || value.trim() === '') {
                        return null; // Enviar null en lugar de string vacío
                    }
                    return value.trim();
                };

                // ESTRUCTURA CON CAMPOS CORRECTOS
                const data = {
                    nombre: formData.nombre,
                    direccion: getStringValue(formData.direccion) || "Sin dirección", // Valor por defecto
                    telefono: getStringValue(formData.telefono) || "Sin teléfono", // Valor por defecto
                    email: getStringValue(formData.email) || "sin-email@example.com", // Email válido por defecto
                    esVendedor: formData.esVendedor || false,
                    esCobrador: formData.esCobrador || false,
                    codigoRegion: formData.codigoRegion || 1,
                    codigoTipoVendedor: formData.codigoTipoVendedor || 1,
                    codigoListaPrecio: formData.codigoListaPrecio || 1,
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

                console.log('Datos CON VALORES VÁLIDOS que se envían:', data);
                return apiVendedor.create(endpoints.sales.vendedor.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['vendedor', 'list'] });
                Alert.alert('Éxito', 'Vendedor creado correctamente.');
            },
            onError: (error) => {
                console.error('Error completo del vendedor:', error);
                if (error?.response?.data) {
                    console.error('Respuesta del servidor:', error.response.data);
                }
                Alert.alert('Error', 'No se pudo crear el vendedor. Por favor, intente nuevamente.');
            }
        });
    };

    const useUpdateVendedor = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Vendedor> }) => {
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

                const getStringValue = (value: string | undefined): string | null => {
                    if (!value || value.trim() === '') {
                        return null;
                    }
                    return value.trim();
                };

                const data = {
                    id,
                    nombre: formData.nombre,
                    direccion: getStringValue(formData.direccion) || "Sin dirección",
                    telefono: getStringValue(formData.telefono) || "Sin teléfono",
                    email: getStringValue(formData.email) || "sin-email@example.com",
                    esVendedor: formData.esVendedor || false,
                    esCobrador: formData.esCobrador || false,
                    codigoRegion: formData.codigoRegion || 1,
                    codigoTipoVendedor: formData.codigoTipoVendedor || 1,
                    codigoListaPrecio: formData.codigoListaPrecio || 1,
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

                console.log('Datos de actualización enviados:', data);
                return apiVendedor.update(endpoints.sales.vendedor.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['vendedor', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['vendedor', 'item', variables.id] });
                Alert.alert('Éxito', 'Vendedor actualizado correctamente.');
            },
            onError: (error) => {
                console.error('Error actualizando vendedor:', error);
                if (error?.response?.data) {
                    console.error('Respuesta del servidor en update:', error.response.data);
                }
                Alert.alert('Error', 'No se pudo actualizar el vendedor. Por favor, intente nuevamente.');
            }
        });
    };

    const useDeleteVendedor = () => {
        return useMutation({
            mutationFn: (id: number) => apiVendedor.delete(endpoints.sales.vendedor.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['vendedor', 'list'] });
                Alert.alert('Éxito', 'Vendedor eliminado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar el vendedor. Por favor, intente nuevamente.');
                console.error('Error deleting vendedor:', error);
            }
        });
    };

    return {
        useGetVendedorList,
        useGetVendedorItem,
        useCreateVendedor,
        useUpdateVendedor,
        useDeleteVendedor
    };
};