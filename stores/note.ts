import { defineStore } from 'pinia'
import axios from 'axios'

export interface Note {
  id: string
  bookId: string
  ISBN: string
  page: number
  section: string
  content: string
  favcount: number
  create_time?: number
  update_time?: number
}

export const useNoteStore = defineStore('note', {
  actions: {
    async getNotes(bookId: string) {
      const { data } = await axios.get<{ state: number; data: Note[]; msg: string }>(
        `/api/note/get/${bookId}`
      )
      return data
    },
    async insertNote(note: Omit<Note, 'id' | 'favcount'> & { autoread?: boolean }) {
      const { data } = await axios.post<{ state: number; data: Note & { read?: unknown }; msg: string }>(
        '/api/note/new',
        note
      )
      return data
    },
    async updateNote(note: Partial<Note> & { id: string; autoread?: boolean }) {
      const { data } = await axios.post<{ state: number; data: Note & { read?: unknown }; msg: string }>(
        '/api/note/set',
        note
      )
      return data
    },
    async removeNote(id: string) {
      const { data } = await axios.post<{ state: number; data: string; msg: string }>(
        '/api/note/del',
        { id }
      )
      return data
    },
  },
})
