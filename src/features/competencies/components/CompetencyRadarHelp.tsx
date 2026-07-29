export function CompetencyRadarHelp() {
  return (
    <details className="min-w-0">
      <summary className="cursor-pointer font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-400">
        ¿Cómo interpretar el radar?
      </summary>
      <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-500">
        <li>Cada eje representa una especialidad.</li>
        <li>
          La distancia al centro indica la proporción de skills asociadas que
          cuentan con evidencia.
        </li>
        <li>No representa seniority ni nivel de dominio.</li>
      </ul>
    </details>
  )
}

export function CompetencyRadarLegend() {
  return (
    <p className="text-[11px] leading-snug text-slate-500">
      Distancia al centro = cobertura de evidencia
    </p>
  )
}
