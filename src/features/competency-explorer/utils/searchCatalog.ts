import type {
  CompetencyExplorerDomain,
  CompetencyExplorerSkill,
  CompetencyExplorerSpecialty,
  KnowledgeSearchHit,
} from '../types/competencyExplorer.types'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Búsqueda tipada local (dominio / especialidad / skill).
 * No busca personas.
 */
export function searchKnowledgeCatalog(
  queryText: string,
  domains: CompetencyExplorerDomain[],
  specialties: CompetencyExplorerSpecialty[],
  skills: CompetencyExplorerSkill[],
  limit = 12,
): KnowledgeSearchHit[] {
  const q = normalize(queryText)
  if (q.length < 2) return []

  const domainName = new Map(domains.map((d) => [d.code, d.name]))
  const specialtyName = new Map(specialties.map((s) => [s.code, s.name]))
  const hits: KnowledgeSearchHit[] = []

  for (const domain of domains) {
    if (
      normalize(domain.name).includes(q) ||
      normalize(domain.code).includes(q)
    ) {
      hits.push({
        type: 'domain',
        code: domain.code,
        name: domain.name,
        contextLabel: 'Dominio',
      })
    }
  }

  for (const specialty of specialties) {
    if (
      normalize(specialty.name).includes(q) ||
      normalize(specialty.code).includes(q)
    ) {
      hits.push({
        type: 'specialty',
        code: specialty.code,
        name: specialty.name,
        contextLabel: domainName.get(specialty.domainCode) ?? specialty.domainCode,
      })
    }
  }

  for (const skill of skills) {
    if (
      normalize(skill.name).includes(q) ||
      normalize(skill.code).includes(q)
    ) {
      const specialty = specialtyName.get(skill.specialtyCode) ?? skill.specialtyCode
      const domain = domainName.get(skill.domainCode) ?? skill.domainCode
      hits.push({
        type: 'skill',
        code: skill.code,
        name: skill.name,
        contextLabel: `${domain} · ${specialty}`,
      })
    }
  }

  const order: Record<KnowledgeSearchHit['type'], number> = {
    skill: 0,
    specialty: 1,
    domain: 2,
  }

  return hits
    .sort((a, b) => {
      const typeDiff = order[a.type] - order[b.type]
      if (typeDiff !== 0) return typeDiff
      return a.name.localeCompare(b.name, 'es')
    })
    .slice(0, limit)
}
