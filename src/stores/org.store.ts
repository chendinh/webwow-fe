import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrgState {
  activeOrgId: string | null;
  activeOrgSlug: string | null;
  setActiveOrg: (id: string, slug: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgSlug: null,
      setActiveOrg: (id, slug) => set({ activeOrgId: id, activeOrgSlug: slug }),
    }),
    { name: "org-storage" }
  )
);
