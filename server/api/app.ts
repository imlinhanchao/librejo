export interface ApiResponse<T = unknown> {
  state: number
  msg: string
  data?: T
}

export class AppError extends Error {
  state: number
  msg: string
  data?: unknown
  isdefine = true

  constructor(state: number, message: string, data?: unknown) {
    super(message)
    this.state = state
    this.msg = message
    this.data = data
    if (process.env.NODE_ENV !== 'development') this.stack = undefined
  }

  toJSON() {
    return { state: this.state, msg: this.message, data: this.data ?? '' }
  }
}

export class AppErrors {
  static get param() { return new AppError(2, '接口参数错误！') }
  static get limited() { return new AppError(6, '权限不足') }
  static get unauthorized() { return new AppError(7, '越权请求') }
  static get nologin() { return new AppError(8, '你没有登录或登录信息已过期！') }
  static reg(msg: string) { return new AppError(9, msg) }
  static existed(obj: string, exist = true) {
    return new AppError(1, obj + (exist ? '已存在！' : '不存在！'))
  }
  static db(err: unknown) {
    return new AppError(4, '数据库错误：' + String(err))
  }
  static network(err: unknown) {
    return new AppError(5, '网络错误：' + String(err))
  }
  static server(err?: unknown) {
    if (err) console.warn(err)
    return new AppError(-1, '服务器错误！' + (err ? String(err) : ''))
  }
}

export function ok(msg: string, data?: unknown): ApiResponse {
  return { state: 0, msg, data }
}

export function err(e: unknown): ApiResponse {
  if (e instanceof AppError) return e.toJSON()
  const msg = e instanceof Error ? e.message : String(e)
  return AppErrors.server(msg).toJSON()
}

export function nowTs() {
  return Math.floor(Date.now() / 1000)
}

export function filterObj<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  keys: string[]
): Partial<T> {
  const result: Record<string, unknown> = {}
  for (const k of keys) {
    if (data[k] !== undefined) {
      result[k] = typeof data[k] === 'string'
        ? (data[k] as string).trim()
        : data[k]
    }
  }
  return result as Partial<T>
}
