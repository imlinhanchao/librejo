import 'express-session'

declare module 'express-session' {
  interface SessionData {
    account_login?: Record<string, unknown>
    captcha?: string
  }
}
