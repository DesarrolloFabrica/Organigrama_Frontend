import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../auth/authStorage";
import { PageLoadingScreen } from "../components/PageLoadingScreen";
import { fetchProfileMe } from "../features/profile/services/profileService";
import { buildOnboardingStatusFromProfile } from "../lib/react-query/hooks/useOnboardingStatus";
import {
  logQueryCacheAccess,
  logQueryNetworkTiming,
} from "../lib/react-query/devTelemetry";
import { prefetchOrgChartRootForBoot } from "../lib/react-query/bootWarmup";
import {
  onboardingQueryKeys,
  profileQueryKeys,
} from "../lib/react-query/queryKeys";

const MIN_BOOT_MS = 800;

export function BootLoadingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    const bootStartedAt = performance.now();

    const waitMinimumBoot = async () => {
      const elapsed = performance.now() - bootStartedAt;
      const remaining = MIN_BOOT_MS - elapsed;
      if (remaining > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remaining);
        });
      }
    };

    const preloadOrgChart = (async () => {
      const t0 = performance.now();
      logQueryCacheAccess("org-root", ["org-root"], false);
      await prefetchOrgChartRootForBoot(queryClient);
      logQueryNetworkTiming("org-root", ["org-root"], performance.now() - t0);
    })();

    const preloadProfileAndOnboarding = (async () => {
      if (!isAuthenticated()) return;

      const profileKey = profileQueryKeys.profile;
      const t0 = performance.now();
      logQueryCacheAccess(
        "profile",
        profileKey,
        queryClient.getQueryData(profileKey) !== undefined,
      );
      await queryClient.prefetchQuery({
        queryKey: profileKey,
        queryFn: fetchProfileMe,
      });
      logQueryNetworkTiming("profile", profileKey, performance.now() - t0);

      const profile = queryClient.getQueryData<
        Awaited<ReturnType<typeof fetchProfileMe>>
      >(profileKey);
      if (profile) {
        queryClient.setQueryData(
          onboardingQueryKeys.status,
          buildOnboardingStatusFromProfile(profile, 0),
        );
      }
    })();

    Promise.all([preloadOrgChart, preloadProfileAndOnboarding])
      .then(() => waitMinimumBoot())
      .then(() => {
        if (!cancelled) {
          navigate("/org");
        }
      })
      .catch(() => {
        if (!cancelled) {
          navigate("/org");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient]);

  return <PageLoadingScreen label="Preparando organigrama…" />;
}
