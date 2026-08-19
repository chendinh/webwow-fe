import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrgState {
  activeOrgId: string | null;
  activeOrgSlug: string | null;
  themePreference: string;
  setActiveOrg: (id: string, slug: string) => void;
  setThemePreference: (theme: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgSlug: null,
      themePreference: "light",
      setActiveOrg: (id, slug) => set({ activeOrgId: id, activeOrgSlug: slug }),
      setThemePreference: (theme) => set({ themePreference: theme }),
    }),
    { name: "org-storage" }
  )
);