import './app.css'
import { createSSRApp, defineComponent, h } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import zh from '../locales/zh.json'
import en from '../locales/en.json'
import PageShell from './PageShell.vue'

export { createApp }

function createApp(pageContext: Record<string, unknown>) {
  const { Page, pageProps, userInfo, locale } = pageContext as {
    Page: ReturnType<typeof defineComponent>
    pageProps: Record<string, unknown>
    userInfo: Record<string, unknown> | null
    locale: string
  }

  const app = createSSRApp({
    render() {
      return h(
        PageShell,
        { userInfo, locale },
        {
          default() {
            return h(Page as ReturnType<typeof defineComponent>, (pageProps ?? {}) as Record<string, unknown>)
          },
        }
      )
    },
  })

  const pinia = createPinia()
  app.use(pinia)

  const i18n = createI18n({
    legacy: false,
    locale: locale ?? 'zh',
    fallbackLocale: 'en',
    messages: { zh, en },
  })
  app.use(i18n)

  return { app, pinia }
}
