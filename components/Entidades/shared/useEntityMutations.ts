import { useNotificationContext } from '@/contexts/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';

interface MutationConfig<T> {
  entityName: string;
  queryKey: string;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  onSuccessCallback?: (item: T, action: 'create' | 'update' | 'delete') => void;
}

export const useEntityMutations = <T extends { id: number }>(config: MutationConfig<T>) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotificationContext();

  const handleCreate = async (formData: any): Promise<boolean> => {
    return new Promise((resolve) => {
      config.createMutation.mutate(formData, {
        onSuccess: (createdItem: T) => {
          queryClient.invalidateQueries({ queryKey: [config.queryKey] });
          showSuccess('¡Éxito!', `${config.entityName} creado correctamente.`);
          config.onSuccessCallback?.(createdItem, 'create');
          resolve(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.mensaje || error.message || `Error al crear ${config.entityName.toLowerCase()}`;
          showError('Error', errorMessage);
          resolve(false);
        }
      });
    });
  };

  const handleUpdate = async (id: number, formData: any): Promise<boolean> => {
    return new Promise((resolve) => {
      config.updateMutation.mutate({ id, formData }, {
        onSuccess: (updatedItem: T) => {
          queryClient.invalidateQueries({ queryKey: [config.queryKey] });
          showSuccess('¡Actualizado!', `${config.entityName} actualizado correctamente.`);
          config.onSuccessCallback?.(updatedItem, 'update');
          resolve(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.mensaje || error.message || `Error al actualizar ${config.entityName.toLowerCase()}`;
          showError('Error', errorMessage);
          resolve(false);
        }
      });
    });
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
      config.deleteMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [config.queryKey] });
          showSuccess('¡Eliminado!', `${config.entityName} eliminado correctamente.`);
          config.onSuccessCallback?.({ id } as T, 'delete');
          resolve(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.mensaje || error.message || `Error al eliminar ${config.entityName.toLowerCase()}`;
          showError('Error', errorMessage);
          resolve(false);
        }
      });
    });
  };

  return {
    handleCreate,
    handleUpdate,
    handleDelete
  };
}; 