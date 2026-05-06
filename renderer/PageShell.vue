<template>
  <div class="min-h-screen flex flex-col">
    <NavBar :user-info="userInfo" :locale="locale" @locale-change="setLocale" />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="footer footer-center p-4 bg-base-200 text-base-content">
      <p>&copy; 2018 ~ {{ new Date().getFullYear() }} Librejo. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar from '../components/NavBar.vue'

const props = defineProps<{
  userInfo?: Record<string, unknown> | null
  locale?: string
}>()

const { locale: i18nLocale } = useI18n()

function setLocale(l: string) {
  i18nLocale.value = l
  if (typeof localStorage !== 'undefined') localStorage.setItem('locale', l)
}

provide('userInfo', props.userInfo ?? null)
</script>
