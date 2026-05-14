// Importamos useNavigate para poder redirigir al login.
import { useNavigate } from "react-router-dom";

// Botón reutilizable para cerrar sesión.
// Por ahora no elimina tokens ni sesión real porque el login es simulado.
export function LogoutButton() {
  const navigate = useNavigate();

  // Simula el cierre de sesión y redirige al login.
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-white/20 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-300/35 hover:bg-white/30 hover:text-white"
    >
      <span className="text-slate-400" aria-hidden>
        <svg
          className="size-3.5"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M8 14l4-4-4-4M3 9h9"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}