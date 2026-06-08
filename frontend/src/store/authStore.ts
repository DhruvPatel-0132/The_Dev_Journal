import { create } from 'zustand'
import Cookies from 'js-cookie'

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
    Cookies.set('user', JSON.stringify(user), { expires: 7, secure: true })
    Cookies.set('token', token, { expires: 7, secure: true })
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    Cookies.remove('user')
    Cookies.remove('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  initAuth: () => {
    try {
      const userStr = Cookies.get('user')
      const token = Cookies.get('token')
      
      if (userStr && token) {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true, isInitialized: true })
      } else {
        set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
      }
    } catch (e) {
      console.error("Failed to parse user from cookies", e)
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
    }
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state
      const updatedUser = { ...state.user, ...updates }
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7, secure: true })
      return { user: updatedUser }
    })
  }
}))
