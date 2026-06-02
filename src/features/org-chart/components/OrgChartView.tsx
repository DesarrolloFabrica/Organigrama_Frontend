/**
 * @legacy Vista árbol en tarjetas (`OrgNodeCard` + `RadarBackground`).
 * No está montada en rutas activas: `/org` y `/org/team/:id` usan `OrgMapView`.
 * Se conserva como referencia; la expansión de hijos usa React Query vía `fetchQuery`.
 */
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { orgChartChildrenQueryOptions } from "../../../lib/react-query/hooks";
import type { OrgNode } from "../types";
import { OrgNodeCard } from "./OrgNodeCard";
import { RadarBackground } from "./RadarBackground";

type Props = {
  root: OrgNode;
  selectedPersonId: string | null;
  onSelectNode: (id: string) => void;
};

type BranchProps = {
  node: OrgNode;
  depth: number;
  selectedPersonId: string | null;
  onSelectNode: (id: string) => void;
};

function OrgBranch({
  node,
  depth,
  selectedPersonId,
  onSelectNode,
}: BranchProps) {
  const queryClient = useQueryClient();
  const [children, setChildren] = useState<OrgNode[]>(node.children ?? []);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [childrenLoaded, setChildrenLoaded] = useState(
    (node.children?.length ?? 0) > 0,
  );

  const directCount = children.length;
  const [expanded, setExpanded] = useState(depth < 1);

  return (
    <div className="flex flex-col gap-3">
      <OrgNodeCard
        node={node}
        emphasis={depth === 0 ? "root" : "default"}
        directReportsCount={directCount}
        childrenExpanded={expanded}
        selected={selectedPersonId === node.id}
        onSelectNode={onSelectNode}
        onToggleChildren={async () => {
          if (expanded) {
            setExpanded(false);
            return;
          }

          if (!childrenLoaded) {
            try {
              setLoadingChildren(true);
              const loadedChildren = await queryClient.fetchQuery(
                orgChartChildrenQueryOptions(node.id),
              );
              setChildren(loadedChildren);
              setChildrenLoaded(true);
            } finally {
              setLoadingChildren(false);
            }
          }

          setExpanded(true);
        }}
      />
      {loadingChildren ? (
        <p className="ml-4 text-xs text-slate-500">Cargando equipo...</p>
      ) : null}

      {directCount > 0 && expanded ? (
        <ul
          className="ml-4 flex list-none flex-col gap-4 border-l border-slate-200 pl-4 sm:ml-6 sm:pl-6"
          role="group"
          aria-label={`Equipo directo de ${node.name}`}
        >
          {children.map((child) => (
            <li key={child.id}>
              <OrgBranch
                node={child}
                depth={depth + 1}
                selectedPersonId={selectedPersonId}
                onSelectNode={onSelectNode}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Contenedor del árbol: recibe selección desde la página para resaltar nodos. */
export function OrgChartView({ root, selectedPersonId, onSelectNode }: Props) {
  return (
    <section
      className="relative overflow-hidden h-full min-h-[280px] rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-8 shadow-sm sm:px-8"
      aria-label="Organigrama"
    >
      <RadarBackground />
      <div className="relative z-10">
        <OrgBranch
          node={root}
          depth={0}
          selectedPersonId={selectedPersonId}
          onSelectNode={onSelectNode}
        />
      </div>
    </section>
  );
}
