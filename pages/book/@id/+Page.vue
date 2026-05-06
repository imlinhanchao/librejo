<template>
  <div class="max-w-2xl mx-auto px-4 py-6">
    <!-- Breadcrumb -->
    <div class="breadcrumbs text-sm mb-6">
      <ul>
        <li><a href="/">Home</a></li>
        <li>{{ isUpdate ? t('book.edit') : t('book.new') }}</li>
        <li v-if="isUpdate">{{ form.name }}</li>
      </ul>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Cover preview -->
      <div class="flex-shrink-0 flex flex-col items-center gap-3">
        <img
          :src="coverUrl"
          alt="cover"
          class="w-32 h-44 object-cover rounded shadow"
          @error="(e) => (e.target as HTMLImageElement).src = '/img/default.jpg'"
        />
        <label class="btn btn-outline btn-sm">
          {{ t('action.upload') }}
          <input type="file" class="hidden" accept="image/*" @change="uploadCover" />
        </label>
      </div>

      <!-- Form -->
      <div class="flex-1">
        <!-- ISBN + scan -->
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">{{ t('book.isbn') }}</span></label>
          <div class="join w-full">
            <input
              v-model="form.ISBN"
              type="text"
              class="input input-bordered join-item flex-1"
              :disabled="isUpdate"
              :placeholder="t('book.isbn')"
            />
            <button class="btn btn-outline join-item" @click="searchByISBN" :class="{ loading: isbnLoading }">
              🔍
            </button>
          </div>
        </div>

        <!-- Barcode scanner -->
        <div v-if="!isUpdate" class="mb-3">
          <BarcodeScanner @detected="onBarcodeDetected" />
        </div>

        <!-- Book name + autocomplete -->
        <div class="form-control mb-3 relative">
          <label class="label"><span class="label-text">{{ t('book.name') }} *</span></label>
          <input
            v-model="form.name"
            type="text"
            class="input input-bordered"
            @input="searchByName"
            @blur="autocompleteResults = []"
          />
          <!-- Autocomplete dropdown -->
          <ul v-if="autocompleteResults.length" class="absolute top-full left-0 right-0 z-10 bg-base-100 border rounded-box shadow mt-1 max-h-64 overflow-auto">
            <li v-for="b in autocompleteResults" :key="b.ISBN" class="flex items-center gap-2 p-2 hover:bg-base-200 cursor-pointer" @mousedown.prevent="selectAutocomplete(b)">
              <img :src="b.img || '/img/default.jpg'" class="w-8 h-12 object-cover rounded" />
              <div class="flex-1 overflow-hidden">
                <p class="text-sm font-medium truncate text-primary">{{ b.name }}</p>
                <p class="text-xs text-base-content/60 truncate">{{ b.author }} {{ b.pubDate?.slice(0,4) }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">{{ t('book.author') }}</span></label>
          <input v-model="form.author" type="text" class="input input-bordered" />
        </div>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">{{ t('book.publisher') }}</span></label>
          <input v-model="form.publisher" type="text" class="input input-bordered" />
        </div>
        <div class="form-control mb-3">
          <label class="label"><span class="label-text">{{ t('book.pubDate') }}</span></label>
          <input v-model="form.pubDate" type="month" class="input input-bordered" />
        </div>
        <div class="form-control mb-4">
          <label class="label"><span class="label-text">{{ t('book.page') }} *</span></label>
          <input v-model.number="form.page" type="number" :min="1" class="input input-bordered" />
        </div>

        <p v-if="errorMsg" class="text-error text-sm mb-3">{{ errorMsg }}</p>

        <div class="flex gap-2">
          <button v-if="!isUpdate" class="btn btn-primary" :class="{ loading }" @click="submitForm">
            {{ t('book.submit') }}
          </button>
          <button v-if="isUpdate" class="btn btn-primary" :class="{ loading }" @click="updateForm">
            {{ t('book.update') }}
          </button>
          <button v-if="isUpdate" class="btn btn-error btn-outline" :class="{ loading: removing }" @click="removeForm">
            {{ t('book.remove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useBookStore } from '../../stores/book'
import BarcodeScanner from '../../components/BarcodeScanner.vue'

// Props injected from Vike page context
const props = defineProps<{ bookId?: string; isbn?: string }>()

const { t } = useI18n()
const bookStore = useBookStore()

const isUpdate = ref(!!props.bookId)
const loading = ref(false)
const removing = ref(false)
const isbnLoading = ref(false)
const errorMsg = ref('')
const autocompleteResults = ref<Array<{ ISBN: string; name: string; author: string; pubDate: string; img: string }>>([])

const form = ref({
  id: '',
  name: '',
  dbId: '',
  img: '',
  author: '',
  publisher: '',
  page: 1,
  ISBN: props.isbn ?? '',
  pubDate: '',
})

const coverUrl = computed(() => {
  const img = form.value.img
  if (!img) return '/img/default.jpg'
  if (img.startsWith('http')) return img
  return `/upload/${img.replace(/^\/upload\//, '')}`
})

onMounted(async () => {
  if (props.bookId) {
    const res = await bookStore.getBook(props.bookId)
    if (res.state === 0) {
      form.value = { ...form.value, ...res.data, pubDate: res.data.pubDate ?? '' }
    }
  } else if (props.isbn) {
    await searchByISBN()
  }
})

async function searchByISBN() {
  if (!form.value.ISBN) return
  isbnLoading.value = true
  try {
    const { data } = await axios.get(`/api/isbn/${form.value.ISBN}`)
    if (data.state === 0) {
      const b = data.data
      form.value = { ...form.value, ...b }
    } else {
      errorMsg.value = data.msg
    }
  } finally {
    isbnLoading.value = false
  }
}

let nameTimer: ReturnType<typeof setTimeout> | null = null
async function searchByName() {
  if (isUpdate.value || !form.value.name) return
  if (nameTimer) clearTimeout(nameTimer)
  nameTimer = setTimeout(async () => {
    try {
      const { data } = await axios.get(`/api/isbn/search?q=${encodeURIComponent(form.value.name)}&count=5`)
      if (data.state === 0) autocompleteResults.value = data.data ?? []
    } catch {}
  }, 500)
}

function selectAutocomplete(b: { ISBN: string; name: string; author: string; pubDate: string; img: string }) {
  form.value = { ...form.value, ...b }
  autocompleteResults.value = []
  if (b.ISBN) searchByISBN()
}

function onBarcodeDetected(code: string) {
  form.value.ISBN = code
  searchByISBN()
}

async function uploadCover(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await axios.post('/api/lib/upload', fd)
  if (data.state === 0) form.value.img = data.data[0]
}

async function submitForm() {
  if (!form.value.name || !form.value.page) { errorMsg.value = 'Name and page are required'; return }
  loading.value = true
  try {
    const res = await bookStore.insertBook(form.value)
    if (res.state === 0) {
      window.location.href = `/book/${res.data.id}`
    } else {
      errorMsg.value = res.msg
    }
  } finally {
    loading.value = false
  }
}

async function updateForm() {
  loading.value = true
  try {
    const res = await bookStore.updateBook({ ...form.value, id: props.bookId! })
    if (res.state !== 0) errorMsg.value = res.msg
  } finally {
    loading.value = false
  }
}

async function removeForm() {
  removing.value = true
  try {
    const res = await bookStore.removeBook(props.bookId!)
    if (res.state === 0) window.location.href = '/'
  } finally {
    removing.value = false
  }
}
</script>
