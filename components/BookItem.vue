<template>
  <div class="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer group relative">
    <!-- Cover image -->
    <figure class="relative overflow-hidden" style="aspect-ratio: 3/4;">
      <img
        :src="coverUrl"
        :alt="book.name"
        class="w-full h-full object-cover"
        @error="onImgError"
      />
      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <!-- Title -->
        <div class="flex gap-1 items-start">
          <a
            :href="`/detail/${book.id}`"
            class="flex-1 badge badge-ghost text-white font-bold truncate"
            :title="book.name"
          >{{ book.name }}</a>
          <!-- Read status button -->
          <button class="btn btn-circle btn-xs bg-base-content/60 border-0 text-white" @click.prevent="toggleReadPanel" :title="readTitle">
            <span>{{ readIcon }}</span>
          </button>
        </div>
        <!-- Admin actions -->
        <div v-if="admin" class="flex justify-around">
          <button class="btn btn-circle btn-xs bg-base-content/60 border-0 text-white" :title="t('action.borrow')">
            🤝
          </button>
          <a :href="`/book/${book.id}`" class="btn btn-circle btn-xs bg-base-content/60 border-0 text-white" :title="t('book.edit')">✏️</a>
          <button
            class="btn btn-circle btn-xs bg-base-content/60 border-0 text-white"
            :title="t('book.remove')"
            @click.prevent="confirmDelete"
          >🗑️</button>
          <button class="btn btn-circle btn-xs bg-base-content/60 border-0 text-white" :title="t('note.title')" @click.prevent="$emit('notes', book)">💬</button>
        </div>
      </div>
    </figure>

    <!-- Read panel -->
    <div v-if="showReadPanel" class="absolute top-8 right-0 z-10 bg-base-100 shadow-xl rounded-box p-3 w-48" @click.stop>
      <div class="flex justify-end mb-2">
        <button class="btn btn-xs btn-ghost" @click="showReadPanel = false">✕</button>
      </div>
      <div class="flex justify-center gap-1 mb-2">
        <button v-for="s in [0,1,2]" :key="s"
          :class="['btn btn-sm btn-circle', readInfo.status === s ? 'btn-primary' : 'btn-ghost']"
          @click="readInfo.status = s"
          :title="readLabels[s]"
        >{{ readIcons[s] }}</button>
      </div>
      <div v-if="readInfo.status === 1" class="form-control mb-2">
        <label class="label"><span class="label-text text-xs">{{ t('read.page') }}</span></label>
        <input type="number" v-model.number="readInfo.page" class="input input-bordered input-xs" :min="0" :max="book.page" />
      </div>
      <button class="btn btn-primary btn-sm w-full" @click="saveRead" :class="{ loading: readLoading }">
        {{ t('action.save') }}
      </button>
    </div>

    <!-- Delete confirm dialog -->
    <dialog :ref="(el) => (deleteDialog = el as HTMLDialogElement)" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ t('action.confirmDelete') }}</h3>
        <div class="modal-action">
          <button class="btn btn-error" @click="doDelete" :class="{ loading: deleteLoading }">{{ t('action.confirm') }}</button>
          <button class="btn" @click="deleteDialog?.close()">{{ t('action.cancel') }}</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBookStore, type BookInfo, type ReadRecord } from '../stores/book'

const props = defineProps<{
  book: BookInfo
  admin?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'reads', read: ReadRecord): void
  (e: 'notes', book: BookInfo): void
}>()

const { t } = useI18n()
const bookStore = useBookStore()

const showReadPanel = ref(false)
const readLoading = ref(false)
const deleteLoading = ref(false)
const deleteDialog = ref<HTMLDialogElement | null>(null)
const imgError = ref(false)

const readInfo = ref<ReadRecord>({
  bookId: props.book.id,
  status: props.book.read?.status ?? 0,
  page: props.book.read?.page ?? 0,
  ISBN: props.book.ISBN,
})

const readIcons = ['⭕', '⭐', '✅']
const readLabels = [t('read.unread'), t('read.reading'), t('read.haveRead')]

const readIcon = computed(() => readIcons[props.book.read?.status ?? 0])
const readTitle = computed(() => readLabels[props.book.read?.status ?? 0])

const coverUrl = computed(() => {
  if (imgError.value) return '/img/default.jpg'
  const img = props.book.img
  if (!img) return '/img/default.jpg'
  if (img.startsWith('http')) return img
  return `/upload/${img.replace(/^\/upload\//, '')}`
})

function onImgError() { imgError.value = true }

function toggleReadPanel() {
  readInfo.value.status = props.book.read?.status ?? 0
  readInfo.value.page = props.book.read?.page ?? 0
  showReadPanel.value = !showReadPanel.value
}

async function saveRead() {
  readLoading.value = true
  try {
    const res = await bookStore.addRead(readInfo.value)
    if (res.state === 0) {
      emit('reads', { ...readInfo.value, ...res.data })
      showReadPanel.value = false
    }
  } finally {
    readLoading.value = false
  }
}

function confirmDelete() {
  deleteDialog.value?.showModal()
}

async function doDelete() {
  deleteLoading.value = true
  try {
    const res = await bookStore.removeBook(props.book.id)
    if (res.state === 0) {
      deleteDialog.value?.close()
      emit('remove', props.book.id)
    }
  } finally {
    deleteLoading.value = false
  }
}
</script>
