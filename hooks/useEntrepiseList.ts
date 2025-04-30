import { useQuery } from '@tanstack/react-query';
import { getEnterpriseList } from '@/data/api/getEnterpriseList';


export const useEnterpriseList = () => {
  return useQuery({
    queryKey:["enterprise"],
    queryFn:getEnterpriseList
  })
};

