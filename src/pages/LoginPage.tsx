import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { performAppLogout } from "../auth/appLogout";
import { isAuthenticated, saveAuthSession } from "../auth/authStorage";
import { loginWithDevEmail, loginWithGoogleIdToken } from "../auth/authService";
import { setProfileCompleted } from "../auth/profileGateStorage";
import { useQueryClient } from "@tanstack/react-query";
import { fetchProfileMe } from "../features/profile/services/profileService";
import { profileQueryKeys } from "../lib/react-query/queryKeys";

const SUBMARINE_SRC = "/img/Submarino.png";
const DEV_LOGIN_ENABLED = import.meta.env.DEV;
const GOOGLE_BTN_WIDTH_DESKTOP = 300;
const GOOGLE_BTN_WIDTH_TABLET = 280;
const GOOGLE_BTN_WIDTH_MOBILE = 240;

function getGoogleButtonCap(viewportWidth: number): number {
  if (viewportWidth <= 640) {
    return GOOGLE_BTN_WIDTH_MOBILE;
  }
  if (viewportWidth <= 1024) {
    return GOOGLE_BTN_WIDTH_TABLET;
  }
  return GOOGLE_BTN_WIDTH_DESKTOP;
}

function useGoogleButtonWidth() {
  const [width, setWidth] = useState(GOOGLE_BTN_WIDTH_DESKTOP);

  useEffect(() => {
    const update = () => {
      const cap = getGoogleButtonCap(window.innerWidth);
      const next = Math.min(cap, Math.max(GOOGLE_BTN_WIDTH_MOBILE, window.innerWidth - 48));
      setWidth(next);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devEmail, setDevEmail] = useState("");
  const googleButtonWidth = useGoogleButtonWidth();

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    let cancelled = false;

    queryClient
      .fetchQuery({
        queryKey: profileQueryKeys.profile,
        queryFn: fetchProfileMe,
      })
      .then((profile) => {
        if (cancelled) return;
        setProfileCompleted(profile.profileCompleted);
        navigate(profile.profileCompleted ? "/loading" : "/onboarding", {
          replace: true,
        });
      })
      .catch(() => {
        if (!cancelled) {
          navigate("/onboarding", { replace: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient]);

  const completeLogin = async (
    result: Awaited<ReturnType<typeof loginWithGoogleIdToken>>,
  ) => {
    saveAuthSession(result.accessToken, result.user);
    const profile = await queryClient.fetchQuery({
      queryKey: profileQueryKeys.profile,
      queryFn: fetchProfileMe,
    });
    setProfileCompleted(profile.profileCompleted);
    navigate(profile.profileCompleted ? "/loading" : "/onboarding");
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError("Google no devolvió credenciales válidas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      performAppLogout(queryClient);

      const result = await loginWithGoogleIdToken(credential);
      await completeLogin(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = devEmail.trim();
    if (!email) {
      setError("Ingresa un correo institucional");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      performAppLogout(queryClient);
      const result = await loginWithDevEmail(email);
      await completeLogin(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-sub relative min-h-screen min-h-dvh overflow-hidden text-white">
      {/* Capa 0 — fondo marino */}
      <div className="login-sub__bg pointer-events-none absolute inset-0 z-0" aria-hidden />

      {/* Mapa organizacional único (fondo sumergido) */}
      <div
        className="login-sub__org-map pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        aria-hidden
      >
        <svg
          className="login-sub__org-map-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <g className="login-sub__org-map-edges">
            {/* Tronco raíz → barra principal */}
            <path d="M 720 78 L 720 148" />
            <path d="M 250 148 L 1190 148" />
            <path d="M 250 148 L 250 188" />
            <path d="M 470 148 L 470 188" />
            <path d="M 970 148 L 970 188" />
            <path d="M 1190 148 L 1190 188" />
            {/* Rama izquierda extrema */}
            <path d="M 250 192 L 250 248 L 170 248 L 170 298" />
            <path d="M 250 192 L 250 248 L 330 248 L 330 298" />
            <path d="M 170 302 L 170 358 L 110 358 L 110 428" />
            <path d="M 170 302 L 170 358 L 230 358 L 230 428" />
            <path d="M 330 302 L 330 358 L 280 358 L 280 428" />
            <path d="M 330 302 L 330 358 L 390 358 L 390 428" />
            {/* Rama izquierda media */}
            <path d="M 470 192 L 470 248 L 400 248 L 400 298" />
            <path d="M 470 192 L 470 248 L 540 248 L 540 298" />
            <path d="M 400 302 L 400 358 L 350 358 L 350 428" />
            <path d="M 540 302 L 540 358 L 590 358 L 590 428" />
            {/* Rama derecha media */}
            <path d="M 970 192 L 970 248 L 900 248 L 900 298" />
            <path d="M 970 192 L 970 248 L 1040 248 L 1040 298" />
            <path d="M 900 302 L 900 358 L 850 358 L 850 428" />
            <path d="M 1040 302 L 1040 358 L 1090 358 L 1090 428" />
            {/* Rama derecha extrema */}
            <path d="M 1190 192 L 1190 248 L 1110 248 L 1110 298" />
            <path d="M 1190 192 L 1190 248 L 1270 248 L 1270 298" />
            <path d="M 1110 302 L 1110 358 L 1050 358 L 1050 428" />
            <path d="M 1110 302 L 1110 358 L 1170 358 L 1170 428" />
            <path d="M 1270 302 L 1270 358 L 1220 358 L 1220 428" />
            <path d="M 1270 302 L 1270 358 L 1330 358 L 1330 428" />
          </g>
          {/* Raíz */}
          <circle
            className="login-sub__org-map-node login-sub__org-map-node--accent"
            cx="720"
            cy="72"
            r="5.5"
          />
          {/* Ramas principales (L2) */}
          <circle
            className="login-sub__org-map-node login-sub__org-map-node--accent"
            cx="250"
            cy="184"
            r="4"
          />
          <circle
            className="login-sub__org-map-node login-sub__org-map-node--accent"
            cx="470"
            cy="184"
            r="4"
          />
          <circle
            className="login-sub__org-map-node login-sub__org-map-node--accent"
            cx="970"
            cy="184"
            r="4"
          />
          <circle
            className="login-sub__org-map-node login-sub__org-map-node--accent"
            cx="1190"
            cy="184"
            r="4"
          />
          {/* Secundarios (L3) */}
          <circle className="login-sub__org-map-node" cx="170" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="330" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="400" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="540" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="900" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="1040" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="1110" cy="294" r="3.5" />
          <circle className="login-sub__org-map-node" cx="1270" cy="294" r="3.5" />
          {/* Terciarios (L4) */}
          <circle className="login-sub__org-map-node" cx="110" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="230" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="280" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="390" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="350" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="590" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="850" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="1090" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="1050" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="1170" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="1220" cy="424" r="3" />
          <circle className="login-sub__org-map-node" cx="1330" cy="424" r="3" />
        </svg>
      </div>

      {/* Capa 1 — haz submarino (atmósfera + partículas) */}
      <div
        className="login-sub__beam-wrap login-sub__beam-breath pointer-events-none absolute z-[1]"
        aria-hidden
      >
        <div className="login-sub__beam-fog" />
        <div className="login-sub__beam login-sub__beam--outer" />
        <div className="login-sub__beam login-sub__beam--mid" />
        <div className="login-sub__beam login-sub__beam--core" />
        <div className="login-sub__particles" />
      </div>

      {/* Tres focos bajo los faros del asset (sin puntos duplicados) */}
      <div className="login-sub__lamp-glows pointer-events-none absolute z-[2]" aria-hidden>
        <span className="login-sub__lamp-glow-spot login-sub__lamp-glow-spot--left" />
        <span className="login-sub__lamp-glow-spot login-sub__lamp-glow-spot--center" />
        <span className="login-sub__lamp-glow-spot login-sub__lamp-glow-spot--right" />
      </div>

      {/* Capa 3 — submarino suspendido */}
      <div className="login-sub__submarine-wrap pointer-events-none absolute z-[5]">
        <img
          src={SUBMARINE_SRC}
          alt=""
          className="login-sub__submarine block h-auto w-full select-none"
          width={220}
          height={220}
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Tres haces desde los faros (delante del PNG) */}
      <div
        className="login-sub__lamp-rays pointer-events-none absolute z-[6]"
        aria-hidden
      >
        <span className="login-sub__lamp-ray login-sub__lamp-ray--left" />
        <span className="login-sub__lamp-ray login-sub__lamp-ray--center" />
        <span className="login-sub__lamp-ray login-sub__lamp-ray--right" />
      </div>

      {/* Capa 4 — contenido dentro del cono */}
      <section
        className="login-sub__content relative z-[4] flex min-h-screen min-h-dvh flex-col items-center justify-center px-5 text-center sm:px-6"
        aria-labelledby="login-sub-title"
      >
        <div className="login-sub__copy flex w-full max-w-[520px] flex-col items-center">
          <h1
            id="login-sub-title"
            className="text-[2.125rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
          >
            Organigrama Operacional
          </h1>

          <p className="mt-4 max-w-[30rem] text-base leading-relaxed text-slate-300/95 sm:text-lg">
            Explora la estructura operacional desde el centro de mando.
          </p>

          <div className="login-sub__cta mt-10 flex w-full max-w-[26.25rem] flex-col items-center">
            {loading ? (
              <div className="login-sub__loading flex h-14 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-sm">
                <p className="text-sm font-medium text-slate-200">
                  Validando acceso…
                </p>
              </div>
            ) : (
              <div className="login-google-action w-full">
                <GoogleLogin
                  onSuccess={(response) =>
                    void handleGoogleSuccess(response.credential)
                  }
                  onError={() =>
                    setError(
                      "No se pudo completar el inicio de sesión con Google",
                    )
                  }
                  hosted_domain="cun.edu.co"
                  useOneTap={false}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="signin_with"
                  width={googleButtonWidth}
                />
              </div>
            )}
          </div>

          {DEV_LOGIN_ENABLED ? (
            <form
              onSubmit={(e) => void handleDevLogin(e)}
              className="login-dev mt-6 flex w-full max-w-[26.25rem] flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-white/5 p-4 text-left backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
                Acceso dev (correo en base de datos)
              </p>
              <label className="flex flex-col gap-1.5 text-sm text-slate-200">
                Correo @cun.edu.co
                <input
                  type="email"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  placeholder="nombre_apellido@cun.edu.co"
                  className="rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2.5 text-white outline-none ring-cyan-400/40 placeholder:text-slate-500 focus:ring-2"
                  autoComplete="email"
                  disabled={loading}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
              >
                Entrar con correo
              </button>
            </form>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <p className="login-sub__footer">
        Acceso exclusivo para colaboradores registrados en cun.edu.co
      </p>
    </main>
  );
}
