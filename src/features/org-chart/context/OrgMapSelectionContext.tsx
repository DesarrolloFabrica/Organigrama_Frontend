import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

type OrgMapSelectionContextValue = {
  selectedPersonId: string | null;
  selectedRelationId: string | null;
};

const OrgMapSelectionContext =
  createContext<OrgMapSelectionContextValue | null>(null);

type OrgMapSelectionProviderProps = {
  selectedPersonId: string | null;
  selectedRelationId?: string | null;
  children: ReactNode;
};

export function OrgMapSelectionProvider({
  selectedPersonId,
  selectedRelationId = null,
  children,
}: OrgMapSelectionProviderProps) {
  return (
    <OrgMapSelectionContext.Provider
      value={{ selectedPersonId, selectedRelationId }}
    >
      {children}
    </OrgMapSelectionContext.Provider>
  );
}

export function useOrgMapSelection(): OrgMapSelectionContextValue {
  const context = useContext(OrgMapSelectionContext);
  if (!context) {
    return { selectedPersonId: null, selectedRelationId: null };
  }
  return context;
}
