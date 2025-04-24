import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { enterpriseStore } from '@/data/global/entrepiseStore';
import { Enterprise } from '@/core/models/Enterpise';
import { EnterpriseSelect } from '@/utils/types/EnterpiseSelect';


export const useEnterprise = () => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setSelectedEnterprise } = enterpriseStore()

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockEnterprises: Enterprise[] = [
          {
            id: '1',
            name: 'Empresa A',
            description: 'Empresa líder en tecnología',
            balance: 15000
          },
          {
            id: '2',
            name: 'Empresa B',
            description: 'Especialistas en servicios financieros',
            balance: 25000
          },
          {
            id: '3',
            name: 'Empresa C',
            description: 'Innovación en retail',
            balance: 35000
          },
        ];

        setEnterprises(mockEnterprises);
      } catch (err) {
        setError('Error al cargar las empresas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnterprises();
  }, []);

  const selectEnterprise = async (data: EnterpriseSelect) => {
    try {
      setIsSubmitting(true);
      const selected = enterprises.find(enterprise => enterprise.id === data.enterpriseId);

      if (selected) {
        setSelectedEnterprise(selected);
        await router.replace('/(views)/(home)/Home');
      } else {
        throw 'Empresa no encontrada';
      }
    } catch (err) {
      setError(err as string);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    enterprises,
    isLoading,
    error,
    isSubmitting,
    selectEnterprise,
  };
};

