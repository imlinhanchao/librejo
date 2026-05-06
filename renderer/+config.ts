import type { Config } from 'vike/types'

// https://vike.dev/config
export default {
  // https://vike.dev/passToClient
  passToClient: ['pageProps', 'userInfo', 'locale'],
  // https://vike.dev/clientRouting
  clientRouting: true,
  // https://vike.dev/hydrationCanBeAborted
  hydrationCanBeAborted: true,
} satisfies Config
