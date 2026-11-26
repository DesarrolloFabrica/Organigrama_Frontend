import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

import {
  OrgMapOrbitRequisitionsSection,
  type OrgMapOrbitRequisitionsNodeData,
} from "./OrgMapOrbitRequisitions";

/**
 * Nodo de lienzo con las requisiciones de Orbit de la coordinación raíz cuando
 * su equipo se dibuja como fila de nodos (árbol horizontal). Va debajo de esa
 * fila; no tiene aristas, ficha ni acciones, y no cuenta como persona.
 */
function OrgMapOrbitRequisitionsNodeComponent({ data }: NodeProps) {
  const { cards, leaderName, themeVars, columns } =
    data as OrgMapOrbitRequisitionsNodeData;
  return (
    <div
      className="org-map-orbit-node nodrag nopan rounded-sm p-3"
      style={themeVars}
    >
      <OrgMapOrbitRequisitionsSection
        cards={cards}
        leaderName={leaderName}
        variant="hub"
        columns={columns}
      />
    </div>
  );
}

export const OrgMapOrbitRequisitionsNode = memo(
  OrgMapOrbitRequisitionsNodeComponent,
);
