import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (user: User, token: string) => void
  logout: () => void
  initAuth: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  initAuth: () => {
    try {
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (userStr && token) {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true, isInitialized: true })
      } else {
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e)
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
    }
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state
      const updatedUser = { ...state.user, ...updates }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { user: updatedUser }
    })
  }
}))
