<template>
  <div class="max-w-xl mx-auto px-4 py-6">
    <div class="breadcrumbs text-sm mb-4">
      <ul>
        <li><a href="/">Home</a></li>
        <li>{{ t('book.new') }}</li>
      </ul>
    </div>
    <!-- Reuse the same book form page, passing no bookId so isUpdate = false -->
    <BookFormContent :isbn="isbn" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BookFormContent from '../@id/+Page.vue'

const props = defineProps<{ isbn?: string }>()
const { t } = useI18n()

const isbn = props.isbn
</script>
