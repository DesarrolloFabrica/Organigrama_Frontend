import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../auth/authStorage";
import { PageLoadingScreen } from "../components/PageLoadingScreen";
import { fetchOrgChartRoot } from "../features/org-chart/services/orgChartService";
import { fetchProfileMe } from "../features/profile/services/profileService";
import {
  buildOnboardingStatusFromProfile,
} from "../lib/react-query/hooks/useOnboardingStatus";
import {
  logQueryCacheAccess,
  logQueryNetworkTiming,
} from "../lib/react-query/devTelemetry";
import {
  onboardingQueryKeys,
  orgQueryKeys,
  profileQueryKeys,
} from "../lib/react-query/queryKeys";

export function BootLoadingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const minimumLoadingTime = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2400);
    });

    const preloadOrgChart = (async () => {
      const key = orgQueryKeys.root();
      const t0 = performance.now();
      logQueryCacheAccess(
        "org-root",
        key,
        queryClient.getQueryData(key) !== undefined,
      );
      await queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () => fetchOrgChartRoot(),
      });
      logQueryNetworkTiming("org-root", key, performance.now() - t0);
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

      const profile = queryClient.getQueryData<Awaited<ReturnType<typeof fetchProfileMe>>>(
        profileKey,
      );
      if (profile) {
        queryClient.setQueryData(
          onboardingQueryKeys.status,
          buildOnboardingStatusFromProfile(profile, 0),
        );
        if (import.meta.env.DEV) {
          console.debug("[RQ warmup] onboarding-status seeded from profile");
        }
      }
    })();

    Promise.all([minimumLoadingTime, preloadOrgChart, preloadProfileAndOnboarding])
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
