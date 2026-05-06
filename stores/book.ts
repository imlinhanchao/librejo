import { defineStore } from 'pinia'
import axios from 'axios'

export interface ReadRecord {
  id?: string
  bookId: string
  ISBN?: string
  status: number
  page: number
  create_time?: number
}

export interface BookInfo {
  id: string
  userId: string
  dbId: string
  img: string
  name: string
  author: string
  publisher: string
  page: number
  ISBN: string
  pubDate: string
  status: number
  create_time?: number
  update_time?: number
  read?: ReadRecord
}

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [] as BookInfo[],
    total: 0,
  }),
  actions: {
    async getBook(id: string) {
      const { data } = await axios.get<{ state: number; data: BookInfo; msg: string }>(
        `/api/book/get/${id}`
      )
      return data
    },
    async queryBooks(params: { index?: number; count?: number; query?: Record<string, unknown> }) {
      const { data } = await axios.post<{
        state: number
        data: { data: BookInfo[]; total: number }
        msg: string
      }>('/api/book/query', { index: 0, count: 10, ...params })
      return data
    },
    async insertBook(book: Omit<BookInfo, 'id' | 'userId' | 'status'>) {
      const { data } = await axios.post<{ state: number; data: BookInfo; msg: string }>(
        '/api/book/new',
        book
      )
      return data
    },
    async updateBook(book: Partial<BookInfo> & { id: string }) {
      const { data } = await axios.post<{ state: number; data: BookInfo; msg: string }>(
        '/api/book/set',
        book
      )
      return data
    },
    async removeBook(id: string) {
      const { data } = await axios.post<{ state: number; data: string; msg: string }>(
        '/api/book/del',
        { id }
      )
      return data
    },
    async addRead(read: { bookId: string; status: number; page?: number }) {
      const { data } = await axios.post<{ state: number; data: ReadRecord; msg: string }>(
        '/api/read/new',
        read
      )
      return data
    },
  },
})
