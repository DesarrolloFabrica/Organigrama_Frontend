import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patchProfileMe,
  postPhotoFromGoogle,
} from "../../../features/profile/services/profileService";
import type { ProfileMe, UpdateProfilePayload } from "../../../features/profile/types";
import { setProfileCompleted } from "../../../auth/profileGateStorage";
import { profileQueryKeys } from "../queryKeys";
import { invalidateAfterProfileChange } from "../invalidations";

export function usePatchProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => patchProfileMe(payload),
    onSuccess: (data: ProfileMe) => {
      queryClient.setQueryData(profileQueryKeys.profile, data);
      setProfileCompleted(data.profileCompleted);
      void invalidateAfterProfileChange(queryClient, data);
    },
  });
}

export function usePostPhotoFromGoogle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postPhotoFromGoogle,
    onSuccess: (data: ProfileMe) => {
      queryClient.setQueryData(profileQueryKeys.profile, data);
      setProfileCompleted(data.profileCompleted);
      void invalidateAfterProfileChange(queryClient, data);
    },
  });
}
