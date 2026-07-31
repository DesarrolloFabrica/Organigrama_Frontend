import type { ReactNode } from 'react'

type Props = {
  search: ReactNode
}

export function ExplorerHeader({ search }: Props) {
  return (
    <header className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-cyan-400/70">
          MC1 · Conocimiento demostrado
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
          Explorador de Competencias
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Encuentre personas a partir del conocimiento demostrado en sus hojas
          de vida. La exploración parte de dominios, especialidades y skills —
          no de cargos ni posición en el organigrama.
        </p>
      </div>
      {search}
    </header>
  )
}
