import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  MOCK_EXPLORER_DOMAINS,
  MOCK_EXPLORER_SKILLS,
  MOCK_EXPLORER_SPECIALTIES,
} from '../mocks/competencyExplorer.mock'
import type { KnowledgeSearchHit } from '../types/competencyExplorer.types'
import { searchKnowledgeCatalog } from '../utils/searchCatalog'

type Props = {
  value: string
  onChange: (value: string) => void
  onSelectHit: (hit: KnowledgeSearchHit) => void
}

/**
 * Buscador global tipado (dominio / especialidad / skill).
 * No busca personas; resultados mock locales.
 */
export function GlobalKnowledgeSearch({
  value,
  onChange,
  onSelectHit,
}: Props) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const hits = useMemo(
    () =>
      searchKnowledgeCatalog(
        value,
        MOCK_EXPLORER_DOMAINS,
        MOCK_EXPLORER_SPECIALTIES,
        MOCK_EXPLORER_SKILLS,
      ),
    [value],
  )

  const showPanel = open && value.trim().length >= 2

  useEffect(() => {
    setActiveIndex(0)
  }, [value])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function selectHit(hit: KnowledgeSearchHit) {
    onSelectHit(hit)
    onChange('')
    setOpen(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showPanel) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (event.key === 'Enter' && hits[activeIndex]) {
      event.preventDefault()
      selectHit(hits[activeIndex])
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const grouped = groupHits(hits)

  return (
    <div className="w-full" ref={rootRef}>
      <label htmlFor="competency-explorer-global-search" className="sr-only">
        Buscar dominio, especialidad o skill
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        >
          <SearchIcon />
        </span>
        <input
          id="competency-explorer-global-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && hits[activeIndex]
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar dominio, especialidad o skill..."
          autoComplete="off"
          className="w-full rounded-xl border border-slate-600/45 bg-[#020617]/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors hover:border-slate-500/55 focus:border-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-300/45"
        />

        {showPanel ? (
          <div
            id={listId}
            role="listbox"
            aria-label="Resultados de conocimiento"
            className="absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-600/50 bg-[#06111f] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]"
          >
            {hits.length === 0 ? (
              <p className="px-3 py-3 text-[13px] text-slate-500" role="status">
                No hay coincidencias en el catálogo mock.
              </p>
            ) : (
              <div className="py-1.5">
                {grouped.map((group) => (
                  <div key={group.type} className="px-1.5 py-1">
                    <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      {group.label}
                    </p>
                    <ul>
                      {group.items.map(({ hit, index }) => (
                        <li key={`${hit.type}-${hit.code}`}>
                          <button
                            type="button"
                            id={`${listId}-option-${index}`}
                            role="option"
                            aria-selected={index === activeIndex}
                            className={
                              index === activeIndex
                                ? 'flex w-full flex-col rounded-lg bg-cyan-950/45 px-2.5 py-2 text-left outline-none'
                                : 'flex w-full flex-col rounded-lg px-2.5 py-2 text-left outline-none hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-cyan-300/45'
                            }
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => selectHit(hit)}
                          >
                            <span className="text-[13px] text-slate-100">
                              {hit.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {hit.contextLabel}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        Ejemplo: Power BI, Registro Calificado o Analítica Educativa
      </p>
    </div>
  )
}

function groupHits(hits: KnowledgeSearchHit[]) {
  const labels: Record<KnowledgeSearchHit['type'], string> = {
    skill: 'Skills',
    specialty: 'Especialidades',
    domain: 'Dominios',
  }
  const order: KnowledgeSearchHit['type'][] = ['skill', 'specialty', 'domain']
  return order
    .map((type) => ({
      type,
      label: labels[type],
      items: hits
        .map((hit, index) => ({ hit, index }))
        .filter(({ hit }) => hit.type === type),
    }))
    .filter((g) => g.items.length > 0)
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 10.5 13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
