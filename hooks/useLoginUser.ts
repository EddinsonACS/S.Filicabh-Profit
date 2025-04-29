import { useMutation } from "@tanstack/react-query";
import { login } from "@/data/api/login";


export const useLoginUser = () => {
  return useMutation({
    mutationFn: login,
  })
}
