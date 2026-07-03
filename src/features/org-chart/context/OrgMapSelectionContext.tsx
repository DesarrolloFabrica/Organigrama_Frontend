import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

type OrgMapSelectionContextValue = {
  selectedPersonId: string | null;
};

const OrgMapSelectionContext =
  createContext<OrgMapSelectionContextValue | null>(null);

type OrgMapSelectionProviderProps = {
  selectedPersonId: string | null;
  children: ReactNode;
};

export function OrgMapSelectionProvider({
  selectedPersonId,
  children,
}: OrgMapSelectionProviderProps) {
  return (
    <OrgMapSelectionContext.Provider value={{ selectedPersonId }}>
      {children}
    </OrgMapSelectionContext.Provider>
  );
}

export function useOrgMapSelection(): OrgMapSelectionContextValue {
  const context = useContext(OrgMapSelectionContext);
  if (!context) {
    return { selectedPersonId: null };
  }
  return context;
}
