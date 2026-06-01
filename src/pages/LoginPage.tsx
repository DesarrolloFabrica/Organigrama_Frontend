import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, saveAuthSession } from "../auth/authStorage";
import { loginWithGoogleIdToken } from "../auth/authService";
import { setProfileCompleted } from "../auth/profileGateStorage";
import { fetchProfileMe } from "../features/profile/services/profileService";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    let cancelled = false;

    fetchProfileMe()
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
  }, [navigate]);

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError("Google no devolvió credenciales válidas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginWithGoogleIdToken(credential);
      saveAuthSession(result.accessToken, result.user);
      const profile = await fetchProfileMe();
      setProfileCompleted(profile.profileCompleted);
      navigate(profile.profileCompleted ? "/loading" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050814] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute left-1/2 top-[-180px] h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-300/12 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/25" />
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/12" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/50" />
        <div className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#020817] via-[#020817]/80 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[28%] bg-gradient-to-l from-[#020817] via-[#020817]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,8,23,0.25)_55%,rgba(2,8,23,0.92)_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="relative flex min-h-[420px] w-full max-w-[420px] flex-col items-center justify-center overflow-hidden rounded-full border border-cyan-200/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),rgba(15,23,42,0.92)_58%)] p-12 shadow-[0_0_120px_rgba(34,211,238,0.12)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-[10px] rounded-full border border-cyan-200/10" />

          <h1 className="relative z-10 text-3xl font-bold">
            Organigrama Operacional
          </h1>

          <p className="relative z-10 mt-3 text-sm text-slate-300">
            Acceso exclusivo para colaboradores @cun.edu.co registrados en el
            organigrama.
          </p>

          <div className="relative z-10 mt-8 flex w-full flex-col items-center gap-3">
            {loading ? (
              <p className="text-sm text-cyan-200">Validando acceso…</p>
            ) : (
              <GoogleLogin
                onSuccess={(response) =>
                  void handleGoogleSuccess(response.credential)
                }
                onError={() =>
                  setError("No se pudo completar el inicio de sesión con Google")
                }
                hosted_domain="cun.edu.co"
                useOneTap={false}
                theme="filled_black"
                shape="pill"
                text="signin_with"
              />
            )}
          </div>

          {error ? (
            <p className="relative z-10 mt-4 max-w-[280px] text-center text-sm text-rose-300">
              {error}
            </p>
          ) : null}

        </div>
      </section>
    </main>
  );
}
