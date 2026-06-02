import { useQuery } from "@tanstack/react-query";
import { fetchProfileMe } from "../../../features/profile/services/profileService";
import { profileQueryKeys } from "../queryKeys";

type UseProfileOptions = {
  enabled?: boolean;
};

export function useProfile(options?: UseProfileOptions) {
  return useQuery({
    queryKey: profileQueryKeys.profile,
    queryFn: fetchProfileMe,
    enabled: options?.enabled ?? true,
  });
}
