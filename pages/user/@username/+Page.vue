<template>
  <div>
    <!-- Profile section -->
    <div class="bg-base-200 py-8">
      <div class="max-w-2xl mx-auto px-4">
        <div v-if="!info.id" class="flex justify-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else class="flex gap-6 items-start">
          <!-- Avatar -->
          <div class="relative">
            <div class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="avatarUrl" :alt="info.nickname" />
              </div>
            </div>
            <label v-if="isCurrentUser" class="btn btn-xs btn-circle absolute bottom-0 right-0 cursor-pointer">
              📷
              <input type="file" class="hidden" accept="image/*" @change="uploadAvatar" />
            </label>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <template v-if="editNickname">
                <input v-model="tempNickname" class="input input-bordered input-sm" @keyup.enter="saveNickname" @keyup.esc="editNickname = false" />
                <button class="btn btn-primary btn-xs" @click="saveNickname">✓</button>
                <button class="btn btn-ghost btn-xs" @click="editNickname = false">✕</button>
              </template>
              <template v-else>
                <h2 class="text-2xl font-bold">{{ info.nickname }}</h2>
                <button v-if="isCurrentUser" class="btn btn-ghost btn-xs opacity-50 hover:opacity-100" @click="startEditNickname">✏️</button>
              </template>
            </div>
            <p class="text-xs text-base-content/50 mb-1" v-if="info.lastlogin">
              {{ t('user.lastLogin') }} {{ new Date((info.lastlogin as number) * 1000).toLocaleString() }}
            </p>
            <div class="flex items-center gap-2">
              <template v-if="editMotto">
                <input v-model="tempMotto" class="input input-bordered input-sm flex-1" @keyup.enter="saveMotto" @keyup.esc="editMotto = false" />
                <button class="btn btn-primary btn-xs" @click="saveMotto">✓</button>
                <button class="btn btn-ghost btn-xs" @click="editMotto = false">✕</button>
              </template>
              <template v-else>
                <p class="text-base-content/70">{{ info.motto || t('user.noMotto') }}</p>
                <button v-if="isCurrentUser" class="btn btn-ghost btn-xs opacity-50 hover:opacity-100" @click="startEditMotto">✏️</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Books section -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <BookList
        v-if="info.id"
        :query="{ userId: info.id }"
        :admin="isCurrentUser"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../../../stores/auth'
import BookList from '../../../components/BookList.vue'

const props = defineProps<{ username: string }>()
const { t } = useI18n()
const authStore = useAuthStore()
const userInfo = inject<Record<string, unknown> | null>('userInfo', null)

const info = ref<{
  id: string; username: string; nickname: string; avatar: string; motto: string; lastlogin?: number
}>({ id: '', username: '', nickname: '', avatar: '', motto: '' })

const editNickname = ref(false)
const editMotto = ref(false)
const tempNickname = ref('')
const tempMotto = ref('')

const isCurrentUser = computed(() => userInfo?.id === info.value.id)

const avatarUrl = computed(() => {
  const img = info.value.avatar
  if (!img) return '/img/user.png'
  if (img.startsWith('http')) return img
  return `/upload/${img.replace(/^\/upload\//, '')}`
})

onMounted(async () => {
  if (!props.username) {
    window.location.href = '/'
    return
  }
  const { data } = await axios.post('/api/account/query', { username: props.username })
  if (data.state === 0 && data.data.total > 0) {
    info.value = data.data.data[0]
  } else {
    window.location.href = '/'
  }
})

function startEditNickname() {
  tempNickname.value = info.value.nickname
  editNickname.value = true
}

async function saveNickname() {
  if (!isCurrentUser.value) return
  const res = await authStore.updateUser({ username: info.value.username, nickname: tempNickname.value })
  if (res.state === 0) { info.value.nickname = tempNickname.value; editNickname.value = false }
}

function startEditMotto() {
  tempMotto.value = info.value.motto
  editMotto.value = true
}

async function saveMotto() {
  if (!isCurrentUser.value) return
  const res = await authStore.updateUser({ username: info.value.username, motto: tempMotto.value })
  if (res.state === 0) { info.value.motto = tempMotto.value; editMotto.value = false }
}

async function uploadAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await axios.post('/api/lib/upload', fd)
  if (data.state === 0) {
    const res = await authStore.updateUser({ username: info.value.username, avatar: data.data[0] })
    if (res.state === 0) info.value.avatar = data.data[0]
  }
}
</script>
