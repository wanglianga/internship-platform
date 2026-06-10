import { create } from 'zustand';
import { UserRole } from '../types';

interface AppState {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: 'employment_office',
  setCurrentRole: (role) => set({ currentRole: role }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
