import { useEffect, useState } from 'react'
import type { OrgPersonDetail } from '../types'
import { fetchOrgPersonDetail } from '../services/orgChartService'

type Props = {
  /** Persona seleccionada en el árbol; `null` muestra estado vacío. */
  personId: string | null
  /**
   * Total de personas bajo el nodo en el árbol ya cargado (excluye a la persona).
   * El detalle del API solo trae reportes directos; esto enriquece “subordinados totales”.
   */
  treeDescendantCount: number | null
  /** Permite cerrar desde el panel (búsqueda futura podrá fijar la misma API). */
  onClose?: () => void
}

function formatValue(value: string | null | undefined): string {
  if (value == null || String(value).trim() === '') return '—'
  return String(value)
}

/**
 * Panel lateral de ficha: consume GET /api/org-chart/person/:id.
 * Pensado para extenderse con búsqueda global, navegación programática e indicadores.
 */
export function PersonDetailPanel(props: Props) {
  /** Sin `personId` no montamos estado ni efectos de red: el contenido cargado va en un hijo. */
  if (!props.personId) {
    return <PersonDetailEmptyAside />
  }

  return (
    <PersonDetailLoaded
      key={props.personId}
      personId={props.personId}
      treeDescendantCount={props.treeDescendantCount}
      onClose={props.onClose}
    />
  )
}

function PersonDetailEmptyAside() {
  return (
    <aside
      className="flex h-full min-h-[280px] flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center"
      aria-label="Detalle de persona"
    >
      <p className="text-sm font-medium text-slate-700">
        Seleccione una persona
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Haga clic en una tarjeta del organigrama para ver la ficha completa desde el
        servidor.
      </p>
    </aside>
  )
}

type LoadedProps = Props & { personId: string }

function PersonDetailLoaded({
  personId,
  treeDescendantCount,
  onClose,
}: LoadedProps) {
  const [detail, setDetail] = useState<OrgPersonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchOrgPersonDetail(personId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDetail(null)
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el detalle de la persona.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [personId])

  if (loading) {
    return (
      <aside
        className="flex h-full min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white px-5 py-8 shadow-sm"
        aria-busy="true"
        aria-label="Cargando detalle"
      >
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />
        <p className="mt-4 text-center text-sm text-slate-600">
          Cargando ficha…
        </p>
      </aside>
    )
  }

  if (error) {
    return (
      <aside
        className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 shadow-sm"
        role="alert"
        aria-label="Error al cargar detalle"
      >
        <p className="text-sm font-semibold text-rose-900">
          Error al cargar la persona
        </p>
        <p className="mt-1 text-sm text-rose-800">{error}</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm font-medium text-rose-900 underline hover:no-underline"
          >
            Cerrar panel
          </button>
        ) : null}
      </aside>
    )
  }

  if (!detail) {
    return null
  }

  const regionName = detail.location?.region?.name ?? null
  const cityName = detail.location?.city?.name ?? null
  const campusName = detail.location?.campus?.name ?? null

  return (
    <aside
      className="flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-label={`Detalle de ${detail.full_name}`}
    >
      <div className="shrink-0 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {detail.full_name}
            </h2>
            <p className="mt-1 text-sm font-medium text-sky-800">
              {detail.role?.name?.trim()
                ? detail.role.name
                : 'Sin cargo asignado'}
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              aria-label="Cerrar panel de detalle"
            >
              Cerrar
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section className="space-y-4 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Datos de contacto
          </h3>
          <dl className="grid gap-3">
            <DetailRow
              label="Documento"
              value={formatValue(detail.document)}
              hint={detail.type_document ?? undefined}
            />
            <DetailRow
              label="Correo"
              value={formatValue(detail.email)}
            />
            <DetailRow
              label="Correo educativo"
              value={formatValue(detail.edu_email)}
            />
            <DetailRow
              label="Teléfono"
              value={formatValue(detail.phone)}
            />
          </dl>
        </section>

        <section className="mt-6 space-y-4 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Organización
          </h3>
          <dl className="grid gap-3">
            <DetailRow
              label="Jerarquía"
              value={formatValue(detail.hierarchy?.name ?? null)}
            />
            <DetailRow
              label="Área"
              value={formatValue(detail.area?.name ?? null)}
            />
            <DetailRow
              label="Escuela"
              value={formatValue(detail.school?.name ?? null)}
            />
            <DetailRow
              label="Programa"
              value={formatValue(detail.program?.name ?? null)}
            />
          </dl>
        </section>

        <section className="mt-6 space-y-4 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ubicación
          </h3>
          <dl className="grid gap-3">
            <DetailRow
              label="Región"
              value={formatValue(regionName)}
            />
            <DetailRow
              label="Ciudad"
              value={formatValue(cityName)}
            />
            <DetailRow
              label="Campus"
              value={formatValue(campusName)}
            />
          </dl>
        </section>

        <section className="mt-6 space-y-4 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Equipo
          </h3>
          <dl className="grid gap-3">
            <DetailRow
              label="Subordinados totales (en árbol cargado)"
              value={
                treeDescendantCount != null
                  ? String(treeDescendantCount)
                  : '—'
              }
            />
            <DetailRow
              label="Equipo directo (cantidad)"
              value={String(detail.direct_reports_count)}
            />
          </dl>
          {detail.direct_reports.length > 0 ? (
            <ul
              className="mt-2 list-inside list-disc rounded-lg bg-slate-50 px-3 py-2 text-slate-700"
              aria-label="Lista de reportes directos"
            >
              {detail.direct_reports.map((r) => (
                <li key={r.id}>{r.full_name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Sin reportes directos.</p>
          )}
        </section>

        <section className="mt-6 space-y-2 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ruta jerárquica
          </h3>
          {detail.hierarchy_path.length === 0 ? (
            <p className="text-slate-500">Sin ruta disponible.</p>
          ) : (
            <ol className="list-decimal space-y-1 pl-5 text-slate-800">
              {detail.hierarchy_path.map((seg) => (
                <li key={seg.id}>
                  <span className="font-medium">{seg.name}</span>
                  {seg.role?.name ? (
                    <span className="text-slate-600"> — {seg.role.name}</span>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Ancla para futuros bloques: búsqueda, KPIs, integraciones */}
        <div
          className="mt-8 border-t border-slate-100 pt-4"
          aria-hidden
        />
      </div>
    </aside>
  )
}

function DetailRow({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">
        {value}
        {hint ? (
          <span className="ml-1 text-xs font-normal text-slate-500">
            ({hint})
          </span>
        ) : null}
      </dd>
    </div>
  )
}
