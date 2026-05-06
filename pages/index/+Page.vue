<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Book type dropdown -->
    <div v-if="userInfo" class="dropdown mb-4">
      <div tabindex="0" role="button" class="btn btn-ghost m-1">
        {{ bookTypeLabels[currentType] }} ▾
      </div>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
        <li v-for="(label, i) in bookTypeLabels" :key="i">
          <a @click="currentType = i; filterBooks()">{{ label }}</a>
        </li>
      </ul>
    </div>

    <div v-if="!userInfo" class="hero min-h-48">
      <div class="hero-content text-center">
        <div>
          <h1 class="text-3xl font-bold">📚 Librejo</h1>
          <p class="py-4">{{ t('error.noLogin') }}</p>
          <a href="/login" class="btn btn-primary">{{ t('nav.login') }}</a>
        </div>
      </div>
    </div>

    <BookList v-else :query="bookQuery" :admin="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import BookList from '../../components/BookList.vue'

const { t } = useI18n()
const userInfo = inject<Record<string, unknown> | null>('userInfo', null)

const currentType = ref(0)

const bookTypeLabels = computed(() => ['All', 'Reading', 'Lent'])

const bookQuery = ref<Record<string, unknown>>({})

function filterBooks() {
  // TODO: filter by read status when needed
  bookQuery.value = {}
}
</script>
