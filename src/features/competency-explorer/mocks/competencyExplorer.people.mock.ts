import type { CompetencyExplorerPerson } from '../types/competencyExplorer.types'

/**
 * Personas mock del Explorador (Fase 3 / Bloque 1A).
 * Sin cargo, dependencia, jefe ni profesión.
 * photoUrl omitido → la UI usará iniciales.
 *
 * Diseño deliberado:
 * - skills compartidas entre varias personas (p. ej. Power BI, React);
 * - multi-especialidad dentro del mismo dominio;
 * - multi-dominio en varios perfiles.
 */
export const MOCK_EXPLORER_PEOPLE: CompetencyExplorerPerson[] = [
  {
    id: 'mock-person-01',
    fullName: 'Laura Mendoza Ruiz',
    primaryDomainCode: 'EDUCATION_MANAGEMENT',
    specialtyCodes: ['EM_ACADEMIC_QUALITY', 'EM_CURRICULUM_DESIGN'],
    skillCodes: [
      'SKILL_REGISTRO_CALIFICADO',
      'SKILL_ACREDITACION',
      'SKILL_RESULTADOS_APRENDIZAJE',
      'SKILL_DISENO_CURRICULAR',
      'SKILL_SYLLABUS',
    ],
    evidenceStrength: 88,
  },
  {
    id: 'mock-person-02',
    fullName: 'Andrés Felipe Castro',
    primaryDomainCode: 'EDUCATION_MANAGEMENT',
    specialtyCodes: ['EM_ACADEMIC_QUALITY', 'EM_ACADEMIC_PROGRAMS'],
    skillCodes: [
      'SKILL_REGISTRO_CALIFICADO',
      'SKILL_ASEGURAMIENTO_CALIDAD',
      'SKILL_GESTION_PROGRAMAS',
      'SKILL_COORDINACION_ACADEMICA',
    ],
    evidenceStrength: 76,
  },
  {
    id: 'mock-person-03',
    fullName: 'Camila Ríos Vargas',
    primaryDomainCode: 'OPERATIONS_MANAGEMENT',
    specialtyCodes: ['OPS_ANALYTICS', 'OPS_PROCESS'],
    skillCodes: [
      'SKILL_POWER_BI',
      'SKILL_KPIS_OPERATIVOS',
      'SKILL_ANALITICA_EDUCATIVA',
      'SKILL_AUTOMATIZACION_PROCESOS',
      'SKILL_GESTION_PROYECTOS',
    ],
    evidenceStrength: 82,
  },
  {
    id: 'mock-person-04',
    fullName: 'Julián Herrera Soto',
    // Multi-dominio: educación + operaciones
    primaryDomainCode: 'EDUCATION_MANAGEMENT',
    specialtyCodes: [
      'EM_CURRICULUM_DESIGN',
      'OPS_ANALYTICS',
      'EM_TEACHING_INNOVATION',
    ],
    skillCodes: [
      'SKILL_DISENO_CURRICULAR',
      'SKILL_INNOVACION_CURRICULAR',
      'SKILL_POWER_BI',
      'SKILL_ANALITICA_EDUCATIVA',
      'SKILL_TECNOLOGIA_EDUCATIVA',
      'SKILL_DOCENCIA_VIRTUAL',
    ],
    evidenceStrength: 91,
  },
  {
    id: 'mock-person-05',
    fullName: 'Sofía Alejandra Núñez',
    primaryDomainCode: 'SOFTWARE',
    specialtyCodes: ['SOFTWARE_FRONTEND', 'SOFTWARE_BACKEND'],
    skillCodes: [
      'SKILL_REACT',
      'SKILL_TYPESCRIPT',
      'SKILL_CSS_TAILWIND',
      'SKILL_NODEJS',
      'SKILL_API_REST',
    ],
    evidenceStrength: 85,
  },
  {
    id: 'mock-person-06',
    fullName: 'Diego Martín Pardo',
    primaryDomainCode: 'SOFTWARE',
    specialtyCodes: ['SOFTWARE_FRONTEND', 'SOFTWARE_DATA', 'SOFTWARE_AI_APPLIED'],
    skillCodes: [
      'SKILL_REACT',
      'SKILL_TYPESCRIPT',
      'SKILL_POSTGRESQL',
      'SKILL_SQL_AVANZADO',
      'SKILL_PROMPT_ENGINEERING',
      'SKILL_RAG',
    ],
    evidenceStrength: 79,
  },
  {
    id: 'mock-person-07',
    fullName: 'Valentina Gómez Cruz',
    // Multi-dominio: software + diseño
    primaryDomainCode: 'VISUAL_DESIGN',
    specialtyCodes: ['VISUAL_UI', 'SOFTWARE_FRONTEND', 'VISUAL_GRAPHIC'],
    skillCodes: [
      'SKILL_FIGMA',
      'SKILL_DESIGN_SYSTEMS',
      'SKILL_PROTOTIPADO_UI',
      'SKILL_REACT',
      'SKILL_ACCESIBILIDAD_WEB',
      'SKILL_COMPOSICION_VISUAL',
    ],
    evidenceStrength: 87,
  },
  {
    id: 'mock-person-08',
    fullName: 'Mateo Ignacio Ramírez',
    primaryDomainCode: 'VISUAL_DESIGN',
    specialtyCodes: ['VISUAL_IDENTITY', 'VISUAL_GRAPHIC'],
    skillCodes: [
      'SKILL_BRANDING',
      'SKILL_MANUAL_MARCA',
      'SKILL_ILLUSTRATOR',
      'SKILL_COMPOSICION_VISUAL',
      'SKILL_PIEZAS_GRAFICAS',
    ],
    evidenceStrength: 74,
  },
  {
    id: 'mock-person-09',
    fullName: 'Isabella Torres Mejía',
    primaryDomainCode: 'TALENT_MANAGEMENT',
    specialtyCodes: ['TM_TALENT', 'TM_PEOPLE_ANALYTICS'],
    skillCodes: [
      'SKILL_SELECCION_TALENTO',
      'SKILL_ONBOARDING',
      'SKILL_GESTION_DESEMPENO',
      'SKILL_PEOPLE_ANALYTICS',
      'SKILL_DASHBOARDS_TH',
      'SKILL_POWER_BI',
    ],
    evidenceStrength: 80,
  },
  {
    id: 'mock-person-10',
    fullName: 'Sebastián López Duarte',
    // Multi-dominio: talento + marketing
    primaryDomainCode: 'MARKETING_MANAGEMENT',
    specialtyCodes: [
      'MM_MARKETING_ANALYTICS',
      'MM_DIGITAL_OMNICHANNEL',
      'TM_PEOPLE_ANALYTICS',
    ],
    skillCodes: [
      'SKILL_GOOGLE_ANALYTICS',
      'SKILL_MEDICION_CAMPANAS',
      'SKILL_CAMPANAS_DIGITALES',
      'SKILL_SEO',
      'SKILL_INDICADORES_TH',
      'SKILL_POWER_BI',
    ],
    evidenceStrength: 72,
  },
  {
    id: 'mock-person-11',
    fullName: 'Mariana Escobar Peña',
    primaryDomainCode: 'AUDIOVISUAL_PRODUCTION',
    specialtyCodes: ['AV_EDITING', 'AV_MOTION'],
    skillCodes: [
      'SKILL_PREMIERE',
      'SKILL_MONTAJE',
      'SKILL_AFTER_EFFECTS',
      'SKILL_MOTION_GRAPHICS',
      'SKILL_NARRATIVA_AV',
    ],
    evidenceStrength: 83,
  },
  {
    id: 'mock-person-12',
    fullName: 'Nicolás Vargas Quintero',
    primaryDomainCode: 'OPERATIONS_MANAGEMENT',
    specialtyCodes: ['OPS_QUALITY', 'OPS_ACADEMIC', 'EM_ACADEMIC_QUALITY'],
    skillCodes: [
      'SKILL_CONTROL_CALIDAD_OPS',
      'SKILL_NORMATIVA_EDUCATIVA',
      'SKILL_PROGRAMACION_ACADEMICA',
      'SKILL_REGISTRO_CALIFICADO',
      'SKILL_ACREDITACION',
      'SKILL_CUMPLIMIENTO_INSTITUCIONAL',
    ],
    evidenceStrength: 77,
  },
  {
    id: 'mock-person-13',
    fullName: 'Carolina Díaz Beltrán',
    // Multi-dominio: software + operaciones (analítica)
    primaryDomainCode: 'SOFTWARE',
    specialtyCodes: [
      'SOFTWARE_DATA',
      'SOFTWARE_BACKEND',
      'OPS_ANALYTICS',
    ],
    skillCodes: [
      'SKILL_POSTGRESQL',
      'SKILL_MODELADO_DATOS',
      'SKILL_NESTJS',
      'SKILL_API_REST',
      'SKILL_POWER_BI',
      'SKILL_DECISION_DATA_DRIVEN',
    ],
    evidenceStrength: 84,
  },
  {
    id: 'mock-person-14',
    fullName: 'Felipe Andrés Molina',
    primaryDomainCode: 'EDUCATION_MANAGEMENT',
    specialtyCodes: ['EM_ACADEMIC_LEADERSHIP', 'EM_TEACHING_INNOVATION'],
    skillCodes: [
      'SKILL_LIDERAZGO_EQUIPOS_DOCENTES',
      'SKILL_ATENCION_ESTUDIANTE',
      'SKILL_PLANEACION_ACADEMICA',
      'SKILL_DOCENCIA_VIRTUAL',
      'SKILL_EVALUACION_COMPETENCIAS',
    ],
    evidenceStrength: 70,
  },
]
