import type { CompetencyExplorerStats } from '../types/competencyExplorer.types'

type Props = {
  stats: CompetencyExplorerStats
}

const ITEMS: {
  key: keyof CompetencyExplorerStats
  label: string
}[] = [
  { key: 'evaluatedPeople', label: 'personas evaluadas' },
  { key: 'domains', label: 'dominios' },
  { key: 'specialties', label: 'especialidades' },
  { key: 'skills', label: 'skills demostradas' },
]

/** Resumen numérico del catálogo (valores mock en Fase 1). */
export function ExplorerStats({ stats }: Props) {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      aria-label="Resumen del conocimiento evaluado"
    >
      {ITEMS.map(({ key, label }) => (
        <li
          key={key}
          className="rounded-xl border border-cyan-400/12 bg-[#06111f]/55 px-3 py-3"
        >
          <p className="text-xl font-semibold tracking-tight text-cyan-50 tabular-nums sm:text-2xl">
            {stats[key].toLocaleString('es-CO')}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{label}</p>
        </li>
      ))}
    </ul>
  )
}
