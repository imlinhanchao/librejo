import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { createApp } from './app.js'
import type { PageContextServer } from 'vike/types'

export { render }
export { passToClient }

const passToClient = ['pageProps', 'userInfo', 'locale']

async function render(pageContext: PageContextServer) {
  const { app } = createApp(pageContext as unknown as Record<string, unknown>)

  const appHtml = await renderToString(app)

  const locale = (pageContext as unknown as Record<string, unknown>).locale as string ?? 'zh'

  return escapeInject`<!DOCTYPE html>
<html lang="${locale}" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Librejo</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="app">${dangerouslySkipEscape(appHtml)}</div>
  </body>
</html>`
}
