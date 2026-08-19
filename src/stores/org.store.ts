import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrgState {
  activeOrgId: string | null;
  activeOrgSlug: string | null;
  theme: string | null;
  setActiveOrg: (id: string, slug: string) => void;
  setTheme: (theme: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgSlug: null,
      theme: null,
      setActiveOrg: (id, slug) => set({ activeOrgId: id, activeOrgSlug: slug }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "org-storage" }
  )
);