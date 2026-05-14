// Importamos useNavigate para poder redirigir al usuario a otra ruta.
import { useNavigate } from "react-router-dom";

// Página temporal de login.
// No tiene autenticación real: solo simula el inicio de sesión.
export function LoginPage() {
  // Hook de React Router para navegar entre páginas.
  const navigate = useNavigate();

  // Función que se ejecuta al hacer click en el botón.
  // Por ahora solo redirige directamente al organigrama.
  const handleMockLogin = () => {
    // Primero enviamos al usuario a la pantalla de carga.
    // Esa pantalla se encargará de redirigir luego al organigrama.
    navigate("/loading");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050814] text-white">
      {/* Fondo decorativo tipo mapa organizacional */}
      {/* Fondo base atmosférico */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base principal */}
        <div className="absolute inset-0 bg-[#020817]" />

        {/* Glow superior */}
        <div className="absolute left-1/2 top-[-180px] h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-300/12 blur-3xl" />

        {/* Glow central */}
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />

        {/* Círculos técnicos tipo radar */}
        <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/25" />

        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/12" />

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/50" />

        {/* Oscurecimiento lateral */}
        <div className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#020817] via-[#020817]/80 to-transparent" />

        <div className="absolute inset-y-0 right-0 w-[28%] bg-gradient-to-l from-[#020817] via-[#020817]/80 to-transparent" />

        {/* Viñeta general */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,8,23,0.25)_55%,rgba(2,8,23,0.92)_100%)]" />

        {/* Grid técnico MUY sutil */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>
      {/* Contenedor principal centrado en toda la pantalla */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        {/* Card base del login */}
        <div className="relative flex h-[420px] w-[420px] flex-col text-center items-center justify-center overflow-hidden rounded-full border border-cyan-200/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),rgba(15,23,42,0.92)_58%)] p-12 shadow-[0_0_120px_rgba(34,211,238,0.12)] backdrop-blur-2xl">
          {/* Glow interior */}
          {/* Glow interior */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

          {/* Halo exterior */}
          <div className="pointer-events-none absolute inset-[10px] rounded-full border border-cyan-200/10" />
          <h1 className="text-3xl font-bold relative z-10">
            Organigrama Operacional
          </h1>

          <button
            type="button"
            onClick={handleMockLogin}
            className="mt-8 w-full rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
          >
            Iniciar sesión
          </button>

          <p className="mt-3 text-sm text-slate-300">
            Visualización estratégica de la estructura organizacional de la
            dirección de operaciones.
          </p>

          {/* Botón temporal de inicio de sesión */}
        </div>
      </section>
    </main>
  );
}
