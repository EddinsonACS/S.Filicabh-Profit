import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LoginFormData } from '@/utils/types/LoginFormData';


export const useLoginUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));
      if (data.username == "admin" && data.password == "admin") {
        router.replace('/(views)/(Auth)/MethodAuth');
      } else {
        throw ("Credenciales invalidas")
      }

    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
};