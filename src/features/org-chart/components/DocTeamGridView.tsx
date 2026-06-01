import { formatRoleLabel, orgNodeHasDirectReports, type OrgNode } from '../types'
import { RadarBackground } from './RadarBackground'

type Props = {
  leader: OrgNode
  onSelectPerson: (id: string) => void
  onExploreTeam?: (id: string) => void
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/**
 * Contenido central para la vista de docentes.
 * Se monta DENTRO del layout existente de OrgChartExplorePage, en lugar de OrgMapView.
 * No incluye fondo, botón volver ni resumen; esos ya vienen del layout padre.
 */
export function DocTeamGridView({
  leader,
  onSelectPerson,
  onExploreTeam,
}: Props) {
  const members = leader.children
  const leaderRole = formatRoleLabel(leader)

  return (
    <div className="relative h-full overflow-hidden">
      {/* Mismo fondo radar que OrgMapView */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <RadarBackground />
      </div>

      <div className="relative z-10 h-full overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Ficha del líder */}
        <section className="rounded-xl border border-cyan-300/20 bg-[#020617]/80 p-5 shadow-[0_12px_40px_-12px_rgba(34,211,238,0.18)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/10 font-mono text-lg font-bold tracking-tight text-cyan-100">
              {initials(leader.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="truncate text-base font-bold tracking-tight text-slate-100 sm:text-lg"
                title={leader.name}
              >
                {leader.name}
              </h2>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-400" title={leaderRole}>
                {leaderRole}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/80">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" aria-hidden />
                Activo
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectPerson(leader.id)}
              className="shrink-0 rounded-md border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100/80 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-50"
            >
              Detalle
            </button>
          </div>
        </section>

        {/* Grid de docentes */}
        <section className="mt-6">
          <header className="mb-4 flex items-baseline gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/70">
              Docentes asociados
            </h3>
            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/5 px-2 py-0.5 text-[10px] font-bold tabular-nums text-cyan-200/60">
              {members.length}
            </span>
          </header>

          {members.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">
              No hay docentes asociados a este líder.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => {
                const mRole = formatRoleLabel(m)
                const hasTeam = orgNodeHasDirectReports(m)

                return (
                  <article
                    key={m.id}
                    className="group flex flex-col gap-2.5 rounded-lg border border-cyan-300/12 bg-slate-950/60 p-3 shadow-[0_4px_20px_-6px_rgba(34,211,238,0.08)] backdrop-blur-sm transition hover:border-cyan-300/25 hover:shadow-[0_4px_24px_-6px_rgba(34,211,238,0.15)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-cyan-300/15 bg-cyan-400/8 font-mono text-[11px] font-bold tracking-tight text-cyan-100/90">
                        {initials(m.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className="truncate text-sm font-semibold leading-snug tracking-tight text-slate-100"
                          title={m.name}
                        >
                          {m.name}
                        </h4>
                        <p
                          className="mt-0.5 truncate text-[10px] font-medium text-slate-400/90"
                          title={mRole}
                        >
                          {mRole}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300/70">
                          <span className="size-1.5 rounded-full bg-emerald-400/80" aria-hidden />
                          Activo
                        </p>
                      </div>
                    </div>
                    <div className={hasTeam ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-1'}>
                      {hasTeam && onExploreTeam ? (
                        <button
                          type="button"
                          onClick={() => onExploreTeam(m.id)}
                          className="flex items-center justify-center gap-1 rounded-md border border-cyan-300/15 bg-cyan-300/5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100/70 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-50"
                        >
                          Ver equipo
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onSelectPerson(m.id)}
                        className="rounded-md border border-slate-500/20 bg-slate-800/40 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-slate-300/80 transition hover:border-slate-400/30 hover:bg-slate-700/50 hover:text-slate-100"
                      >
                        Detalle
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
      </div>
    </div>
  )
}
