// Importamos useEffect para ejecutar la redirección cuando la pantalla cargue.
import { useEffect } from "react";

// Importamos useNavigate para movernos a la página del organigrama.
import { useNavigate } from "react-router-dom";

// Página visual intermedia entre el login y el organigrama.
export function BootLoadingPage() {
  // Hook de React Router para redirigir después de la animación.
  const navigate = useNavigate();

  useEffect(() => {
    // Tiempo mínimo visible de la pantalla de carga.
    const timer = window.setTimeout(() => {
      navigate("/org");
    }, 2400);

    // Limpiamos el temporizador si el componente se desmonta.
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050814] text-white">
      {/* Fondo base oscuro */}
      <div className="absolute inset-0 bg-[#020817]" />

      {/* Glow central suave */}
      <div className="absolute h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[90px]" />

      {/* Anillos tipo radar */}
      <div className="absolute h-72 w-72 animate-[radarPulse_2.4s_ease-in-out_infinite] rounded-full border border-cyan-300/20" />
      <div className="absolute h-96 w-96 animate-[radarPulse_2.4s_ease-in-out_infinite_0.35s] rounded-full border border-cyan-300/10" />

      {/* Contenedor del logo */}
      <section className="relative z-10 flex flex-col items-center justify-center">
        {/* Aura del logo */}
        <div className="absolute h-44 w-44 animate-[logoGlow_2.4s_ease-in-out_infinite] rounded-full bg-cyan-300/10 blur-2xl" />

        {/* Logo con respiración */}
        <img
          src="/logo-cun.svg"
          alt="Logo CUN"
          className="relative h-28 w-28 animate-[logoBreath_2.4s_ease-in-out_infinite] object-contain opacity-90 drop-shadow-[0_0_28px_rgba(103,232,249,0.28)]"
        />
      </section>
    </main>
  );
}