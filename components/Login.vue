<template>
  <dialog ref="dialog" class="modal" @click.self="close">
    <div class="modal-box w-11/12 max-w-sm">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="close">✕</button>
      <h3 class="font-bold text-lg mb-4">
        {{ isRegister ? t('auth.registerTitle') : t('auth.loginTitle') }}
      </h3>

      <div class="form-control mb-2">
        <label class="label"><span class="label-text">{{ t('auth.username') }}</span></label>
        <input
          v-model="form.username"
          type="text"
          class="input input-bordered"
          @blur="checkExist"
        />
      </div>

      <div class="form-control mb-2">
        <label class="label"><span class="label-text">{{ t('auth.password') }}</span></label>
        <input v-model="form.passwd" :type="showPwd ? 'text' : 'password'" class="input input-bordered" />
      </div>

      <template v-if="isRegister">
        <div class="form-control mb-2">
          <label class="label"><span class="label-text">{{ t('auth.email') }}</span></label>
          <input v-model="form.email" type="email" class="input input-bordered" />
        </div>
        <div class="form-control mb-4">
          <label class="label"><span class="label-text">{{ t('auth.captcha') }}</span></label>
          <div class="flex gap-2">
            <input v-model="form.captcha" type="text" class="input input-bordered flex-1" />
            <img
              :src="`/api/lib/captcha?r=${captchaRand}`"
              class="h-10 cursor-pointer rounded"
              @click="captchaRand = Math.random()"
              alt="captcha"
            />
          </div>
        </div>
      </template>

      <p v-if="errorMsg" class="text-error text-sm mb-2">{{ errorMsg }}</p>

      <div class="modal-action">
        <button class="btn btn-primary w-full" :class="{ loading: loading }" @click="submit">
          {{ isRegister ? t('auth.registerTitle') : t('auth.loginTitle') }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const props = defineProps<{
  open: boolean
  register?: boolean | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const authStore = useAuthStore()

const dialog = ref<HTMLDialogElement | null>(null)
const isRegister = ref<boolean>(props.register ?? false)
const loading = ref(false)
const errorMsg = ref('')
const showPwd = ref(false)
const captchaRand = ref(Math.random())

const form = ref({
  username: '',
  passwd: '',
  email: '',
  captcha: '',
})

watch(() => props.open, (val) => {
  if (val) dialog.value?.showModal()
  else dialog.value?.close()
})

watch(() => props.register, (val) => {
  if (val !== null && val !== undefined) isRegister.value = val
})

function close() {
  emit('close')
}

async function checkExist() {
  if (!form.value.username || form.value.username.length < 5) return
  try {
    const { data } = await axios.get(`/api/account/exist/${form.value.username}`)
    if (data.state === 0) isRegister.value = !data.data
  } catch {}
}

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (isRegister.value) {
      const { data } = await axios.post('/api/account/create', form.value)
      if (data.state !== 0) { errorMsg.value = data.msg; return }
    }
    const res = await authStore.login(form.value.username, form.value.passwd)
    if (res.state === 0) {
      emit('success')
      close()
    } else {
      errorMsg.value = res.msg
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Error'
  } finally {
    loading.value = false
  }
}
</script>
