import { useQuery } from '@tanstack/react-query';
import { getEnterpriseList } from '@/data/api/Enterprise/getEnterpriseList';


export const useEnterpriseList = () => {
  return useQuery({
    queryKey:["enterprise"],
    queryFn:getEnterpriseList
  })
};

