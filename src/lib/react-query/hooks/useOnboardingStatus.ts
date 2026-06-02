import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProfileMe } from "../../../features/profile/types";
import { onboardingQueryKeys } from "../queryKeys";
import { useProfile } from "./useProfile";

export type OnboardingStatus = {
  completed: boolean;
  currentStep: number;
  profileCompleted: boolean;
  emergencyContactCompleted: boolean;
};

export function buildOnboardingStatusFromProfile(
  profile: ProfileMe,
  currentStep = 0,
): OnboardingStatus {
  const emergency = profile.editable.emergencyContact;
  const emergencyContactCompleted = Boolean(
    emergency.name?.trim() &&
      emergency.phone?.trim() &&
      emergency.relationship?.trim(),
  );

  return {
    completed: profile.profileCompleted,
    profileCompleted: profile.profileCompleted,
    currentStep,
    emergencyContactCompleted,
  };
}

/**
 * Paso UI en cache (`onboarding-status`) + campos derivados del perfil en React Query.
 */
export function useOnboardingStatus() {
  const queryClient = useQueryClient();
  const profileQuery = useProfile();

  const statusQuery = useQuery({
    queryKey: onboardingQueryKeys.status,
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!profileQuery.data) {
        throw new Error("Perfil no disponible");
      }
      return buildOnboardingStatusFromProfile(profileQuery.data, 0);
    },
    enabled: Boolean(profileQuery.data),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    queryClient.setQueryData(
      onboardingQueryKeys.status,
      (prev: OnboardingStatus | undefined) =>
        buildOnboardingStatusFromProfile(
          profileQuery.data!,
          prev?.currentStep ?? 0,
        ),
    );
  }, [profileQuery.data, queryClient]);

  const setCurrentStep = useCallback(
    (step: number) => {
      queryClient.setQueryData(
        onboardingQueryKeys.status,
        (prev: OnboardingStatus | undefined) => {
          if (!prev || !profileQuery.data) {
            return prev;
          }
          return {
            ...buildOnboardingStatusFromProfile(profileQuery.data, step),
            currentStep: step,
          };
        },
      );
    },
    [profileQuery.data, queryClient],
  );

  return {
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading && !profileQuery.data,
    profileError: profileQuery.error,
    status: statusQuery.data,
    setCurrentStep,
    refetchProfile: profileQuery.refetch,
  };
}
