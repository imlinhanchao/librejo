<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <div class="breadcrumbs text-sm mb-4">
      <ul>
        <li><a href="/">Home</a></li>
        <li>Books</li>
        <li>{{ book.name }}</li>
      </ul>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else>
      <!-- Book detail -->
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <div class="flex-shrink-0">
          <img
            :src="coverUrl"
            :alt="book.name"
            class="w-36 h-48 object-cover rounded shadow"
            @error="(e) => (e.target as HTMLImageElement).src = '/img/default.jpg'"
          />
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold mb-3">{{ book.name }}</h1>
          <table class="table table-sm w-full">
            <tbody>
              <tr><td class="font-semibold w-28">{{ t('book.isbn') }}</td><td>{{ book.ISBN || t('book.notPublished') }}</td></tr>
              <tr><td class="font-semibold">{{ t('book.author') }}</td><td>{{ book.author }}</td></tr>
              <tr><td class="font-semibold">{{ t('book.publisher') }}</td><td>{{ book.publisher }}</td></tr>
              <tr><td class="font-semibold">{{ t('book.pubDate') }}</td><td>{{ book.pubDate }}</td></tr>
              <tr><td class="font-semibold">{{ t('book.page') }}</td><td>{{ book.page }}</td></tr>
              <tr>
                <td class="font-semibold">{{ t('book.status') }}</td>
                <td>
                  <progress
                    v-if="book.read?.status !== 0"
                    class="progress progress-primary w-36"
                    :value="readProgress"
                    max="100"
                  />
                  <span v-else>{{ t('read.unread') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notes section -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold">{{ t('note.title') }}</h2>
          <button v-if="isOwner" class="btn btn-primary btn-sm" @click="noteOpen = true">
            + {{ t('note.add') }}
          </button>
        </div>

        <p v-if="notes.length === 0" class="text-center text-base-content/50">{{ t('note.empty') }}</p>

        <details v-for="n in notes" :key="n.id" class="collapse collapse-arrow border border-base-300 rounded-lg mb-2">
          <summary class="collapse-title text-sm font-medium">
            [{{ t('note.page') }} {{ n.page }}] {{ n.section || t('note.noSection') }}
          </summary>
          <div class="collapse-content prose max-w-none text-sm" v-html="renderMd(n.content)" />
        </details>
      </div>
    </div>

    <!-- Notes modal -->
    <BookNote
      v-if="book.id && noteOpen"
      :book="book"
      :open="noteOpen"
      @close="noteOpen = false"
      @change="notes = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMarkdown } from '../../../renderer/markdown'
import { useBookStore, type BookInfo } from '../../../stores/book'
import { useNoteStore, type Note } from '../../../stores/note'
import BookNote from '../../../components/BookNote.vue'

const props = defineProps<{ bookId: string }>()
const { t } = useI18n()
const bookStore = useBookStore()
const noteStore = useNoteStore()
const userInfo = inject<Record<string, unknown> | null>('userInfo', null)

const loading = ref(true)
const noteOpen = ref(false)
const notes = ref<Note[]>([])
const book = ref<BookInfo>({
  id: '', userId: '', dbId: '', img: '', name: '', author: '',
  publisher: '', page: 1, ISBN: '', pubDate: '', status: 0,
  read: { bookId: '', status: 0, page: 0 },
})

const isOwner = computed(() => userInfo?.id === book.value.userId)
const coverUrl = computed(() => {
  const img = book.value.img
  if (!img) return '/img/default.jpg'
  if (img.startsWith('http')) return img
  return `/upload/${img.replace(/^\/upload\//, '')}`
})

const readProgress = computed(() => {
  const read = book.value.read
  if (!read || read.status === 0) return 0
  return Math.min(100, Math.floor((read.page / book.value.page) * 100))
})

function renderMd(content: string) {
  return renderMarkdown(content)
}

onMounted(async () => {
  const res = await bookStore.getBook(props.bookId)
  if (res.state === 0) book.value = res.data
  loading.value = false

  const nRes = await noteStore.getNotes(props.bookId)
  if (nRes.state === 0) notes.value = nRes.data
})
</script>
