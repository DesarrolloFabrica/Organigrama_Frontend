import { CompetenciesExplorer } from "../../../competencies";

type Props = {
  personId: string;
};

/** Wrapper del explorador MC1 para el módulo Competencias. */
export function PersonCompetenciesPanel({ personId }: Props) {
  return <CompetenciesExplorer personId={personId} />;
}
