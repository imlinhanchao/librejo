<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content w-full max-w-sm">
      <div class="card bg-base-100 w-full shadow-xl">
        <div class="card-body">
          <h2 class="card-title justify-center">
            {{ isRegister ? t('auth.registerTitle') : isRegister === false ? t('auth.loginTitle') : t('auth.loginOrRegister') }}
          </h2>

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
                  class="h-12 cursor-pointer rounded border"
                  @click="captchaRand = Math.random()"
                  alt="captcha"
                />
              </div>
            </div>
          </template>

          <p v-if="errorMsg" class="text-error text-sm">{{ errorMsg }}</p>

          <div class="card-actions mt-2">
            <button
              class="btn btn-primary w-full"
              :class="{ loading }"
              @click="submit"
            >
              {{ isRegister ? t('auth.registerTitle') : t('auth.loginTitle') }}
            </button>
          </div>

          <p class="text-center text-sm mt-2">
            <a href="/" class="link">← {{ t('nav.books') }}</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const isRegister = ref<boolean | null>(null)
const loading = ref(false)
const showPwd = ref(false)
const errorMsg = ref('')
const captchaRand = ref(Math.random())

const form = ref({
  username: '',
  passwd: '',
  email: '',
  captcha: '',
})

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('register') === '1') isRegister.value = true
})

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
      window.location.href = '/'
    } else {
      errorMsg.value = res.msg
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
