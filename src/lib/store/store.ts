import { create } from 'zustand'

interface UserState {
    user: { uid: string; displayName: string } | null
    setUser: (user: { uid: string; displayName: string } | null) => void
}

interface UIState {
    isSidebarOpen: boolean
    toggleSidebar: () => void
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
}))

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
