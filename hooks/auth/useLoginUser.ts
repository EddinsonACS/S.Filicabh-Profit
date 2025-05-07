import { useMutation } from "@tanstack/react-query";
import { login } from "@/data/api/auth/login";


export const useLoginUser = () => {
  return useMutation({
    mutationFn: login,
  })
}
