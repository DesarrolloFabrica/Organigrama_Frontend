import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { performAppLogout } from "../../../auth/appLogout";

export function LogoutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    performAppLogout(queryClient);
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-medium tracking-wide text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
    >
      <span className="text-slate-500" aria-hidden>
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