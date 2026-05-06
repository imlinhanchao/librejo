<template>
  <div>
    <div v-if="!scanning" class="flex justify-center">
      <button class="btn btn-outline btn-sm" @click="startScan">
        📷 {{ t('book.scan') ?? 'Scan Barcode' }}
      </button>
    </div>

    <div v-if="scanning" class="relative w-full max-w-sm mx-auto">
      <video ref="videoEl" class="w-full rounded-lg" autoplay muted playsinline />
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="border-2 border-primary w-3/4 h-1/3 rounded opacity-70" />
      </div>
      <button
        class="btn btn-circle btn-sm absolute top-2 right-2 bg-base-100/80"
        @click="stopScan"
      >✕</button>
      <p v-if="scanError" class="text-error text-xs mt-1">{{ scanError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  (e: 'detected', code: string): void
}>()

const { t } = useI18n()

const scanning = ref(false)
const scanError = ref('')
const videoEl = ref<HTMLVideoElement | null>(null)

// Lazy-loaded to avoid SSR issues
let codeReader: import('@zxing/library').BrowserBarcodeReader | null = null
let stream: MediaStream | null = null

async function startScan() {
  scanError.value = ''
  scanning.value = true

  try {
    // Dynamically import to avoid SSR bundle issues
    const { BrowserBarcodeReader } = await import('@zxing/library')
    codeReader = new BrowserBarcodeReader()

    // Wait for the video element to be mounted
    await new Promise(r => setTimeout(r, 100))

    if (!videoEl.value) {
      scanError.value = 'Video element not available'
      return
    }

    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    videoEl.value.srcObject = stream

    codeReader.decodeFromVideoDevice(null, videoEl.value, (result, _err) => {
      if (result) {
        const code = result.getText()
        emit('detected', code)
        stopScan()
      }
    })
  } catch (e) {
    scanError.value = e instanceof Error ? e.message : 'Camera access denied'
    scanning.value = false
  }
}

function stopScan() {
  scanning.value = false
  if (codeReader) {
    codeReader.reset()
    codeReader = null
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  if (videoEl.value) videoEl.value.srcObject = null
}

onBeforeUnmount(() => stopScan())
</script>
