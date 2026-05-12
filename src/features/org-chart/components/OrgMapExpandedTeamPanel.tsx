import type { MouseEvent } from "react";

import type { OrgNode } from "../types";
import { resolveOrgMapVisualLevel } from "../utils/orgMapLevelTheme";
import { OrgMapTeamMemberMiniCard } from "./OrgMapTeamMemberMiniCard";

type Props = {
  leaderName: string;
  members: OrgNode[];
  /** Profundidad de layout del miembro en el mapa (p. ej. padre depth + 1). */
  memberLayoutDepth: number;
  onOpenDetail: (id: string) => void;
  onExploreTeam?: (nodeId: string) => void;
  stopMouse: (e: MouseEvent) => void;
};

/**
 * Panel interno del hub: grilla de mini-cards (sólo se monta cuando el padre está expandido).
 */
export function OrgMapExpandedTeamPanel({
  leaderName,
  members,
  memberLayoutDepth,
  onOpenDetail,
  onExploreTeam,
  stopMouse,
}: Props) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div
      className="org-map-team-panel w-full min-w-0 px-0.5 pt-0.5"
      role="region"
      aria-label={`Equipo directo de ${leaderName}`}
    >
      <div className="org-map-team-panel__divider mb-3 mt-1" aria-hidden />
      <p className="org-map-team-panel__heading mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
        Equipo
      </p>
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <OrgMapTeamMemberMiniCard
            key={m.id}
            member={m}
            visualLevel={resolveOrgMapVisualLevel(m, memberLayoutDepth)}
            onOpenDetail={onOpenDetail}
            onExploreTeam={onExploreTeam}
            stopMouse={stopMouse}
          />
        ))}
      </div>
    </div>
  );
}
