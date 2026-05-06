<template>
  <dialog ref="dialog" class="modal" @click.self="$emit('close')">
    <div class="modal-box w-11/12 max-w-2xl">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('close')">✕</button>
      <h3 class="font-bold text-lg mb-4">{{ book.name }} - {{ t('note.title') }}</h3>

      <!-- Tabs -->
      <div class="tabs tabs-bordered mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ 'tab-active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >{{ tab.label }}</button>
      </div>

      <!-- Note form tab -->
      <div v-if="activeTab === 'form'">
        <div class="flex gap-2 mb-2">
          <div class="form-control w-32">
            <label class="label"><span class="label-text text-xs">{{ t('note.page') }}</span></label>
            <input type="number" v-model.number="form.page" class="input input-bordered input-sm" :min="1" />
          </div>
          <div class="form-control flex-1">
            <label class="label"><span class="label-text text-xs">{{ t('note.section') }}</span></label>
            <input type="text" v-model="form.section" class="input input-bordered input-sm" />
          </div>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text text-xs">{{ t('note.content') }}</span></label>
          <textarea v-model="form.content" class="textarea textarea-bordered" rows="6" />
          <label class="label">
            <span class="label-text-alt text-error" v-if="contentError">{{ t('note.minLength') }}</span>
          </label>
        </div>
        <div class="form-control mt-1">
          <label class="label cursor-pointer justify-start gap-2">
            <input type="checkbox" v-model="form.autoread" class="checkbox checkbox-sm" />
            <span class="label-text text-xs">{{ t('note.autoread') }}</span>
          </label>
        </div>
      </div>

      <!-- Preview tab -->
      <div v-if="activeTab === 'preview'" class="prose max-w-none min-h-32">
        <div v-html="renderedContent" />
      </div>

      <!-- History tab -->
      <div v-if="activeTab === 'history'">
        <p v-if="!notes.length" class="text-center text-base-content/50">{{ t('note.empty') }}</p>
        <ul class="divide-y">
          <li v-for="n in notes" :key="n.id" class="py-2 flex justify-between items-start gap-2">
            <button class="text-left flex-1 hover:text-primary text-sm" @click="viewNote(n)">
              [{{ t('note.page') }} {{ n.page }}] {{ n.section || t('note.noSection') }}
            </button>
            <div class="flex gap-1 flex-shrink-0">
              <button class="btn btn-xs btn-outline" @click="editNote(n)">✏️</button>
              <button class="btn btn-xs btn-error btn-outline" @click="confirmDeleteNote(n)">🗑️</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Note viewer -->
      <div v-if="activeTab === 'view'" class="prose max-w-none">
        <h4>[{{ t('note.page') }} {{ viewingNote?.page }}] {{ viewingNote?.section || t('note.noSection') }}</h4>
        <div v-html="viewedContent" />
        <button class="btn btn-sm mt-2" @click="activeTab = 'history'">← {{ t('note.history') }}</button>
      </div>

      <!-- Footer -->
      <div class="modal-action mt-4">
        <button v-if="form.id" class="btn btn-outline" @click="cancelEdit">{{ t('note.cancel') }}</button>
        <button
          class="btn btn-primary"
          :class="{ loading: saving }"
          @click="form.id ? saveUpdate() : saveNew()"
        >
          {{ form.id ? t('note.update') : t('note.add') }}
        </button>
      </div>
    </div>

    <!-- Delete confirm -->
    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <p>{{ t('action.confirmDeleteNote') }}</p>
        <div class="modal-action">
          <button class="btn btn-error" @click="doDeleteNote">{{ t('action.confirm') }}</button>
          <button class="btn" @click="deleteDialog?.close()">{{ t('action.cancel') }}</button>
        </div>
      </div>
    </dialog>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { renderMarkdown } from '../renderer/markdown'
import { useNoteStore, type Note } from '../stores/note'
import type { BookInfo } from '../stores/book'

const props = defineProps<{
  book: BookInfo
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change', notes: Note[]): void
}>()

const { t } = useI18n()
const noteStore = useNoteStore()

const dialog = ref<HTMLDialogElement | null>(null)
const deleteDialog = ref<HTMLDialogElement | null>(null)

const tabs = computed(() => [
  { id: 'form', label: t('note.title') },
  { id: 'preview', label: t('note.preview') },
  ...(notes.value.length ? [{ id: 'history', label: t('note.history') }] : []),
])

const activeTab = ref<string>('form')
const saving = ref(false)
const notes = ref<Note[]>([])
const viewingNote = ref<Note | null>(null)
const deleteTarget = ref<Note | null>(null)

const form = ref({
  id: '',
  bookId: props.book.id,
  ISBN: props.book.ISBN,
  page: props.book.read?.page ?? 1,
  section: '',
  content: '',
  autoread: true,
})

const contentError = computed(() => form.value.content.length > 0 && form.value.content.length < 10)

const renderedContent = computed(() => {
  return renderMarkdown(form.value.content)
})

const viewedContent = computed(() => {
  return renderMarkdown(viewingNote.value?.content ?? '')
})

async function loadNotes() {
  const res = await noteStore.getNotes(props.book.id)
  if (res.state === 0) notes.value = res.data
}

watch(() => props.open, (val) => {
  if (val) {
    dialog.value?.showModal()
    form.value.bookId = props.book.id
    form.value.ISBN = props.book.ISBN
    form.value.page = props.book.read?.page ?? 1
    loadNotes()
  } else {
    dialog.value?.close()
  }
})

onMounted(() => {
  if (props.open) {
    dialog.value?.showModal()
    loadNotes()
  }
})

function viewNote(n: Note) {
  viewingNote.value = n
  activeTab.value = 'view'
}

function editNote(n: Note) {
  form.value = { ...n, autoread: false } as typeof form.value
  activeTab.value = 'form'
}

function cancelEdit() {
  form.value = { id: '', bookId: props.book.id, ISBN: props.book.ISBN, page: 1, section: '', content: '', autoread: true }
  activeTab.value = 'form'
}

async function saveNew() {
  if (!form.value.content || form.value.content.length < 10) return
  saving.value = true
  try {
    const res = await noteStore.insertNote({
      bookId: form.value.bookId,
      ISBN: form.value.ISBN,
      page: form.value.page,
      section: form.value.section,
      content: form.value.content,
      autoread: form.value.autoread,
    })
    if (res.state === 0) {
      notes.value.push(res.data)
      cancelEdit()
      emit('change', notes.value)
    }
  } finally {
    saving.value = false
  }
}

async function saveUpdate() {
  if (!form.value.content || form.value.content.length < 10) return
  saving.value = true
  try {
    const res = await noteStore.updateNote({
      id: form.value.id,
      page: form.value.page,
      section: form.value.section,
      content: form.value.content,
      autoread: form.value.autoread,
    })
    if (res.state === 0) {
      const idx = notes.value.findIndex(n => n.id === form.value.id)
      if (idx >= 0) notes.value[idx] = { ...notes.value[idx], ...form.value }
      cancelEdit()
      emit('change', notes.value)
    }
  } finally {
    saving.value = false
  }
}

function confirmDeleteNote(n: Note) {
  deleteTarget.value = n
  deleteDialog.value?.showModal()
}

async function doDeleteNote() {
  if (!deleteTarget.value) return
  const res = await noteStore.removeNote(deleteTarget.value.id)
  if (res.state === 0) {
    notes.value = notes.value.filter(n => n.id !== deleteTarget.value!.id)
    deleteDialog.value?.close()
    emit('change', notes.value)
  }
}
</script>
