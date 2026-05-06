<template>
  <div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <BookItem
        v-for="book in books"
        :key="book.id"
        :book="book"
        :admin="admin"
        @remove="removeBook"
        @reads="updateRead"
        @notes="openNotes"
      />
    </div>

    <p v-if="!loading && total > 0 && total === books.length" class="text-center text-base-content/50 mt-6">
      {{ t('book.noMore') }}
    </p>
    <p v-if="!loading && total === 0" class="text-center text-base-content/50 mt-6">
      <template v-if="isLogin">
        <i18n-t keypath="book.addFirst" tag="span">
          <a href="/book/add" class="link link-primary">{{ t('book.add') }}</a>
        </i18n-t>
      </template>
    </p>

    <div v-if="loading" class="flex justify-center mt-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Notes modal -->
    <BookNote
      v-if="noteBook"
      :book="noteBook"
      :open="noteOpen"
      @close="noteOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookStore, type BookInfo, type ReadRecord } from '../stores/book'
import BookItem from './BookItem.vue'
import BookNote from './BookNote.vue'

const props = defineProps<{
  query?: Record<string, unknown>
  admin?: boolean
}>()

const { t } = useI18n()
const bookStore = useBookStore()
const userInfo = inject<Record<string, unknown> | null>('userInfo', null)
const isLogin = !!userInfo

const books = ref<BookInfo[]>([])
const total = ref(0)
const loading = ref(false)
const timestamp = ref(Math.floor(Date.now() / 1000))
const isBusy = ref(false)

const noteBook = ref<BookInfo | null>(null)
const noteOpen = ref(false)

async function fetchBooks(index: number, extraQuery?: Record<string, unknown>) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await bookStore.queryBooks({
      index,
      count: 20,
      query: {
        create_time: timestamp.value,
        userId: userInfo?.id,
        ...props.query,
        ...extraQuery,
      },
    })
    if (res.state === 0) {
      if (index === 0) books.value = res.data.data
      else books.value.push(...res.data.data)
      total.value = res.data.total
    }
  } finally {
    loading.value = false
    isBusy.value = false
  }
}

function loadMore() {
  if (!isBusy.value && books.value.length < total.value) {
    isBusy.value = true
    fetchBooks(books.value.length)
  }
}

function scrollHandler() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  if (scrollTop + window.innerHeight >= document.body.clientHeight - 50) {
    loadMore()
  }
}

onMounted(() => {
  fetchBooks(0)
  window.addEventListener('scroll', scrollHandler)
})

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler)
})

watch(
  () => props.query,
  (val) => {
    books.value = []
    timestamp.value = Math.floor(Date.now() / 1000)
    fetchBooks(0, val ?? {})
  },
  { deep: true }
)

function removeBook(id: string) {
  total.value -= 1
  books.value = books.value.filter(b => b.id !== id)
}

function updateRead(read: ReadRecord) {
  const idx = books.value.findIndex(b => b.id === read.bookId)
  if (idx >= 0) books.value[idx].read = read
}

function openNotes(book: BookInfo) {
  noteBook.value = book
  noteOpen.value = true
}
</script>
