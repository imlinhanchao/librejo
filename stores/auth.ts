import { defineStore } from 'pinia'
import axios from 'axios'

interface UserInfo {
  id: string
  username: string
  nickname: string
  email: string
  phone: string
  motto: string
  avatar: string
  lastlogin?: number
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserInfo | null,
  }),
  getters: {
    isLogin: (state) => !!state.user,
    loginUser: (state) => state.user,
  },
  actions: {
    async checkLogin() {
      try {
        const { data } = await axios.get<{ state: number; data: UserInfo }>('/api/account/info')
        if (data.state === 0) this.user = data.data
      } catch {
        this.user = null
      }
    },
    async login(username: string, passwd: string) {
      const { data } = await axios.post<{ state: number; data: UserInfo; msg: string }>(
        '/api/account/login',
        { username, passwd }
      )
      if (data.state === 0) this.user = data.data
      return data
    },
    async logout() {
      await axios.get('/api/account/logout')
      this.user = null
    },
    async updateUser(info: Partial<UserInfo> & { username: string; oldpasswd?: string; passwd?: string }) {
      const { data } = await axios.post<{ state: number; data: UserInfo; msg: string }>(
        '/api/account/update',
        info
      )
      if (data.state === 0) this.user = data.data
      return data
    },
  },
})
