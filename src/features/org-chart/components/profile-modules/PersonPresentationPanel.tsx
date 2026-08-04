/**
 * Módulo Presentación: reproductor HTML5 con stream ticketed (Fase 4B).
 *
 * controlsList="nodownload" solo reduce exposición UI; no es protección de seguridad.
 */
import { useEffect, useRef, useState } from "react";
import type { PersonVideoResponse } from "../../types";
import { getOrgChartApiBaseUrl } from "../../services/orgChartService";
import {
  resolvePersonVideoStreamUrl,
  UnsafePersonVideoStreamUrlError,
} from "../../utils/personVideoStreamUrl";
import {
  canAutoRetryVideoError,
  shouldRefreshTicketOnEnter,
} from "../../utils/personPresentationRules";

type VideoRefreshResult = {
  data?: PersonVideoResponse;
};

type Props = {
  personId: string;
  video: PersonVideoResponse | undefined;
  isFetching: boolean;
  isError: boolean;
  refreshPersonVideo: () => Promise<VideoRefreshResult>;
};

type UiState =
  | "preparing"
  | "ready"
  | "renewing"
  | "error"
  | "unavailable"
  | "unsupported";

export function PersonPresentationPanel({
  personId,
  video,
  isFetching,
  isError,
  refreshPersonVideo,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoRetryUsedRef = useRef(false);
  const [boundPersonId, setBoundPersonId] = useState(personId);
  const [playbackSrc, setPlaybackSrc] = useState<string | null>(null);
  const [uiState, setUiState] = useState<UiState>("preparing");
  const [restoreTime, setRestoreTime] = useState<number | null>(null);
  const [wasPlaying, setWasPlaying] = useState(false);

  if (boundPersonId !== personId) {
    setBoundPersonId(personId);
    autoRetryUsedRef.current = false;
    setPlaybackSrc(null);
    setUiState("preparing");
    setRestoreTime(null);
    setWasPlaying(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function syncSrc() {
      if (isError) {
        setUiState("error");
        return;
      }
      if (!video) {
        setUiState(isFetching ? "preparing" : "unavailable");
        return;
      }
      if (!video.hasVideo) {
        setUiState("unavailable");
        setPlaybackSrc(null);
        return;
      }

      let current = video;
      if (shouldRefreshTicketOnEnter(video.streamTicketExpiresAt)) {
        setUiState("renewing");
        try {
          const refreshed = (await refreshPersonVideo()) as VideoRefreshResult;
          const next = refreshed?.data;
          if (cancelled) return;
          if (!next || !next.hasVideo) {
            setUiState("unavailable");
            setPlaybackSrc(null);
            return;
          }
          current = next;
        } catch {
          if (!cancelled) setUiState("error");
          return;
        }
      }

      try {
        const src = resolvePersonVideoStreamUrl(
          current.streamUrl,
          getOrgChartApiBaseUrl(),
        );
        if (cancelled) return;
        setPlaybackSrc(src);
        setUiState("ready");
      } catch (err) {
        if (cancelled) return;
        void err;
        if (!(err instanceof UnsafePersonVideoStreamUrlError)) {
          /* contrato inválido → error controlado */
        }
        setUiState("error");
        setPlaybackSrc(null);
      }
    }

    void syncSrc();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh estable (RQ refetch)
  }, [video, isFetching, isError, personId]);

  useEffect(() => {
    const el = videoRef.current;
    return () => {
      if (!el) return;
      try {
        el.pause();
        el.removeAttribute("src");
        el.load();
      } catch {
        /* ignore */
      }
    };
  }, [personId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !playbackSrc) return;
    if (el.getAttribute("src") === playbackSrc) return;
    el.src = playbackSrc;
    el.load();
  }, [playbackSrc]);

  const onLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el || restoreTime == null || !Number.isFinite(restoreTime)) return;
    try {
      if (restoreTime > 0 && restoreTime < (el.duration || Infinity)) {
        el.currentTime = restoreTime;
      }
    } catch {
      /* ignore */
    }
    setRestoreTime(null);
    if (wasPlaying) {
      void el.play().catch(() => undefined);
    }
    setWasPlaying(false);
  };

  const onVideoError = async () => {
    const el = videoRef.current;
    const t = el && Number.isFinite(el.currentTime) ? el.currentTime : null;
    const playing = el ? !el.paused : false;

    if (canAutoRetryVideoError(autoRetryUsedRef.current)) {
      autoRetryUsedRef.current = true;
      setRestoreTime(t);
      setWasPlaying(playing);
      setUiState("renewing");
      try {
        const refreshed = (await refreshPersonVideo()) as VideoRefreshResult;
        const next = refreshed?.data;
        if (!next || !next.hasVideo) {
          setUiState("unavailable");
          return;
        }
        const src = resolvePersonVideoStreamUrl(
          next.streamUrl,
          getOrgChartApiBaseUrl(),
        );
        setPlaybackSrc(src);
        setUiState("ready");
      } catch {
        setUiState("error");
      }
      return;
    }
    setUiState("error");
  };

  const onManualRetry = async () => {
    autoRetryUsedRef.current = false;
    setUiState("renewing");
    try {
      const refreshed = (await refreshPersonVideo()) as VideoRefreshResult;
      const next = refreshed?.data;
      if (!next || !next.hasVideo) {
        setUiState("unavailable");
        return;
      }
      const src = resolvePersonVideoStreamUrl(
        next.streamUrl,
        getOrgChartApiBaseUrl(),
      );
      setPlaybackSrc(src);
      setUiState("ready");
    } catch {
      setUiState("error");
    }
  };

  const statusMessage =
    uiState === "preparing"
      ? "Preparando la presentación…"
      : uiState === "renewing"
        ? "Renovando acceso…"
        : uiState === "error"
          ? "No fue posible reproducir el video."
          : uiState === "unavailable"
            ? "La presentación ya no está disponible."
            : uiState === "unsupported"
              ? "Este formato de video no es compatible con el navegador."
              : null;

  const showPlayer =
    (uiState === "ready" || uiState === "renewing") && playbackSrc != null;

  return (
    <div
      id="person-panel-presentacion"
      role="tabpanel"
      aria-labelledby="person-tab-presentacion"
      className="flex flex-col gap-3 pb-4"
    >
      <header className="px-0.5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/80">
          Presentación
        </p>
        <p className="mt-1 text-[12px] leading-snug text-slate-400">
          Video de presentación de la persona seleccionada
        </p>
      </header>

      {statusMessage && uiState !== "ready" ? (
        <div
          className="rounded-xl border border-cyan-400/15 bg-cyan-950/25 px-3 py-4 text-center"
          aria-live="polite"
        >
          <p className="text-sm text-slate-300">{statusMessage}</p>
          {uiState === "error" ? (
            <button
              type="button"
              onClick={() => void onManualRetry()}
              className="mt-3 inline-flex items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : null}

      {showPlayer ? (
        <div className="overflow-hidden rounded-xl border border-cyan-400/15 bg-black/80 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]">
          <div className="relative aspect-video w-full bg-neutral-950">
            <video
              ref={videoRef}
              className="absolute inset-0 size-full bg-black object-contain"
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
              aria-label="Video de presentación de la persona seleccionada"
              onLoadedMetadata={onLoadedMetadata}
              onError={() => void onVideoError()}
            >
              Su navegador no puede reproducir este video.
            </video>
          </div>
        </div>
      ) : null}
    </div>
  );
}
