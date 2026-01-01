import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postUpdateAvatar, schema } from "../endpoints/profile/update-avatar_POST.schema";
import { AUTH_QUERY_KEY } from "./useAuth";
import { PROFILE_QUERY_KEY } from "./useProfile";
import { z } from "zod";

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      return await postUpdateAvatar(data);
    },
    onSuccess: (data) => {
      // Optimistically update the auth session data with the new user info
      // This ensures the UI reflects the change immediately without a reload
      queryClient.setQueryData(AUTH_QUERY_KEY, (oldData: any) => {
        if (!oldData) return oldData;
        // We need to be careful to match the structure expected by AUTH_QUERY_KEY
        // The auth query returns just the user object directly based on useAuth implementation
        return {
          ...oldData,
          ...data.user
        };
      });
      
      // Also invalidate to be safe
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};