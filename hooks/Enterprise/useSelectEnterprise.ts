import { useMutation } from "@tanstack/react-query";
import { selectEnterprise } from "@/data/api/Enterprise/selectEnterprise";


export const useSelectEnterprise = () => {
  return useMutation({
    mutationFn: selectEnterprise,
  })
}
