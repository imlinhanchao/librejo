import { createApp } from './app.js'
import type { PageContextClient } from 'vike/types'

export { render }

async function render(pageContext: PageContextClient) {
  const { app } = createApp(pageContext as unknown as Record<string, unknown>)
  app.mount('#app')
}
