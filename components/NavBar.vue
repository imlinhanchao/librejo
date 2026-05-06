<template>
  <nav class="navbar bg-base-100 shadow-md px-4">
    <!-- Logo -->
    <div class="navbar-start">
      <a href="/" class="btn btn-ghost text-xl font-bold">📚 Librejo</a>
    </div>

    <!-- Search -->
    <div class="navbar-center hidden md:flex">
      <div class="form-control">
        <input
          v-model="searchWord"
          type="text"
          :placeholder="t('nav.search')"
          class="input input-bordered input-sm w-64"
          @keyup.enter="doSearch"
        />
      </div>
    </div>

    <!-- Right side -->
    <div class="navbar-end gap-2">
      <!-- Locale toggle -->
      <button class="btn btn-ghost btn-sm" @click="toggleLocale">
        {{ currentLocale === 'zh' ? 'EN' : '中' }}
      </button>

      <!-- Logged-in menu -->
      <template v-if="userInfo">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-8 rounded-full overflow-hidden">
              <img
                :src="fileUrl(userInfo.avatar as string, '/img/user.png')"
                :alt="userInfo.nickname as string"
              />
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a :href="`/user/${userInfo.username}`">
                <span class="font-semibold">{{ userInfo.nickname }}</span>
              </a>
            </li>
            <li><a href="/book/add">{{ t('book.new') }}</a></li>
            <li><a @click="handleLogout">{{ t('nav.logout') }}</a></li>
          </ul>
        </div>
        <a href="/book/add" class="btn btn-primary btn-sm hidden md:flex">+ {{ t('book.add') }}</a>
      </template>

      <!-- Guest menu -->
      <template v-else>
        <a href="/login" class="btn btn-ghost btn-sm">{{ t('nav.login') }}</a>
        <a href="/login?register=1" class="btn btn-primary btn-sm">{{ t('nav.register') }}</a>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const props = defineProps<{
  userInfo?: Record<string, unknown> | null
  locale?: string
}>()

const emit = defineEmits<{
  (e: 'locale-change', locale: string): void
}>()

const { t, locale } = useI18n()
const authStore = useAuthStore()

const searchWord = ref('')
const currentLocale = computed(() => locale.value)

function toggleLocale() {
  const next = currentLocale.value === 'zh' ? 'en' : 'zh'
  locale.value = next
  emit('locale-change', next)
}

function doSearch() {
  if (searchWord.value.trim()) {
    window.location.href = `/search/${encodeURIComponent(searchWord.value.trim())}`
  }
}

async function handleLogout() {
  await authStore.logout()
  window.location.href = '/'
}

function fileUrl(name: string, defaultImg = '/img/default.jpg') {
  if (!name) return defaultImg
  if (name.startsWith('http')) return name
  return `/upload/${name.replace(/^\/upload\//, '')}`
}
</script>
