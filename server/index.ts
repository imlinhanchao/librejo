import 'dotenv/config'
import './session.js'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import FileStoreFactory from 'session-file-store'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupSwagger } from './middleware/swagger.js'
import { libRouter } from './middleware/lib.js'
import { err } from './api/app.js'
import * as accountApi from './api/account.js'
import * as bookApi from './api/book.js'
import * as noteApi from './api/note.js'
import * as readApi from './api/read.js'
import * as lendApi from './api/lend.js'
import { isbnQuery } from './api/isbn.js'
import type { Request, Response, NextFunction } from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT ?? 6789)

const FileStore = FileStoreFactory(session)

async function startServer() {
  const app = express()

  // ─── Middleware ───────────────────────────────────────────────────────────
  app.use(morgan('dev'))
  app.use(compression())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  app.use(
    session({
      name: process.env.IDENTITY_KEY ?? 'librejo.sid',
      secret: process.env.SECRET ?? 'librejo-secret-change-me',
      store: new FileStore({ path: './sessions', ttl: 86400 * 365, retries: 1, logFn: () => {} }),
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        secure: isProduction,
        httpOnly: true,
        sameSite: 'lax',
      },
    })
  )

  // Rate limit login and register endpoints
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { state: 3, msg: '请求过于频繁，请稍后再试', data: '' },
  })

  // Static files
  const publicDir = path.join(__dirname, '..', 'public')
  app.use(express.static(publicDir))

  // Swagger docs
  setupSwagger(app)

  // ─── Auth guard middleware ────────────────────────────────────────────────
  const NO_AUTH: Record<string, string[]> = {
    account: ['login', 'create', 'exist', 'exists', 'query'],
    book: ['get', 'query'],
    read: ['get', 'last', 'lasts'],
    note: ['get', 'query'],
    isbn: ['*'],
    lib: ['captcha', 'upload'],
  }

  app.use('/api/:resource/:fn*', (req: Request, res: Response, next: NextFunction) => {
    const resource = req.params.resource
    const fn = req.params.fn
    const session = req.session as unknown as Record<string, unknown>
    const allowed = NO_AUTH[resource]
    if (allowed && (allowed.includes('*') || allowed.includes(fn))) return next()
    if (!session.account_login) return res.json(err({ message: '你没有登录或登录信息已过期！', state: 8 }))
    next()
  })

  // ─── API Routes ───────────────────────────────────────────────────────────

  // Lib (upload / captcha)
  app.use('/api/lib', libRouter())

  /**
   * @openapi
   * /account/login:
   *   post:
   *     tags: [Account]
   *     summary: User login
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username: { type: string }
   *               passwd: { type: string }
   *     responses:
   *       200:
   *         description: Login result
   */
  app.post('/api/account/login', loginLimiter, async (req, res) => {
    try { res.json(await accountApi.login(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  /**
   * @openapi
   * /account/logout:
   *   get:
   *     tags: [Account]
   *     summary: User logout
   *     responses:
   *       200:
   *         description: Logout result
   */
  app.get('/api/account/logout', async (req, res) => {
    try { res.json(await accountApi.logout(req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  /**
   * @openapi
   * /account/info:
   *   get:
   *     tags: [Account]
   *     summary: Get current user info
   *     security:
   *       - sessionAuth: []
   *     responses:
   *       200:
   *         description: User info
   */
  app.get('/api/account/info', async (req, res) => {
    try { res.json(await accountApi.info(req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/account/create', loginLimiter, async (req, res) => {
    try { res.json(await accountApi.create(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/account/update', async (req, res) => {
    try { res.json(await accountApi.update(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.get('/api/account/exist/:username', async (req, res) => {
    try { res.json(await accountApi.exist(req.params.username)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/account/exists', async (req, res) => {
    try { res.json(await accountApi.exists(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/account/query', async (req, res) => {
    try { res.json(await accountApi.query(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  /**
   * @openapi
   * /book/new:
   *   post:
   *     tags: [Book]
   *     summary: Add a new book
   *     security:
   *       - sessionAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, page]
   *             properties:
   *               name: { type: string }
   *               page: { type: integer }
   *               ISBN: { type: string }
   *               author: { type: string }
   *               publisher: { type: string }
   *               img: { type: string }
   *               pubDate: { type: string }
   *     responses:
   *       200:
   *         description: Created book
   */
  app.post('/api/book/new', async (req, res) => {
    try { res.json(await bookApi.newBook(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/book/set', async (req, res) => {
    try { res.json(await bookApi.setBook(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/book/del', async (req, res) => {
    try { res.json(await bookApi.delBook(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.get('/api/book/get/:id', async (req, res) => {
    try { res.json(await bookApi.getBook(req.params.id)) }
    catch (e) { res.json(err(e)) }
  })

  /**
   * @openapi
   * /book/query:
   *   post:
   *     tags: [Book]
   *     summary: Query books with pagination
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               index: { type: integer, default: 0 }
   *               count: { type: integer, default: 10 }
   *               query:
   *                 type: object
   *                 properties:
   *                   userId: { type: string }
   *                   name: { type: string }
   *     responses:
   *       200:
   *         description: Book list with pagination
   */
  app.post('/api/book/query', async (req, res) => {
    try { res.json(await bookApi.queryBooks(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  // Note routes
  app.post('/api/note/new', async (req, res) => {
    try { res.json(await noteApi.newNote(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/note/set', async (req, res) => {
    try { res.json(await noteApi.setNote(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/note/del', async (req, res) => {
    try { res.json(await noteApi.delNote(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.get('/api/note/get/:bookId', async (req, res) => {
    try { res.json(await noteApi.getNotes(req.params.bookId)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/note/query', async (req, res) => {
    try { res.json(await noteApi.queryNotes(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  // Read routes
  app.post('/api/read/new', async (req, res) => {
    try { res.json(await readApi.newRead(req.body, req.session as unknown as Record<string, unknown>)) }
    catch (e) { res.json(err(e)) }
  })

  app.get('/api/read/get/:bookId', async (req, res) => {
    try { res.json(await readApi.getReads(req.params.bookId)) }
    catch (e) { res.json(err(e)) }
  })

  app.get('/api/read/last/:bookId', async (req, res) => {
    try { res.json(await readApi.lastRead(req.params.bookId)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/read/lasts', async (req, res) => {
    try { res.json(await readApi.lastReads(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  // Lend routes
  app.post('/api/lend/new', async (req, res) => {
    try { res.json(await lendApi.newLend(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/lend/set', async (req, res) => {
    try { res.json(await lendApi.setLend(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/lend/del', async (req, res) => {
    try { res.json(await lendApi.delLend(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  app.post('/api/lend/query', async (req, res) => {
    try { res.json(await lendApi.queryLends(req.body)) }
    catch (e) { res.json(err(e)) }
  })

  /**
   * @openapi
   * /isbn/{isbn}:
   *   get:
   *     tags: [ISBN]
   *     summary: Query book info by ISBN (uses Open Library API)
   *     parameters:
   *       - in: path
   *         name: isbn
   *         required: true
   *         schema:
   *           type: string
   *         description: ISBN-13 or ISBN-10 number
   *     responses:
   *       200:
   *         description: Book info
   */
  app.get('/api/isbn/:isbn', async (req, res) => {
    try { res.json(await isbnQuery(req.params.isbn)) }
    catch (e) { res.json(err(e)) }
  })

  /**
   * @openapi
   * /isbn/search:
   *   get:
   *     tags: [ISBN]
   *     summary: Search books by title using Open Library
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: count
   *         schema:
   *           type: integer
   *           default: 5
   *     responses:
   *       200:
   *         description: Book search results
   */
  app.get('/api/isbn/search', async (req, res) => {
    try {
      const q = (req.query.q as string | undefined)?.trim()
      const count = Math.min(Number(req.query.count ?? 5), 20)
      if (!q) { res.json(err(new Error('Missing q parameter'))); return }
      const { default: axios } = await import('axios')
      const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=${count}&fields=title,author_name,isbn,cover_i,first_publish_year`
      const resp = await axios.get(searchUrl, { timeout: 8000 })
      const docs = (resp.data as { docs?: Array<Record<string, unknown>> }).docs ?? []
      const results = docs.map((d: Record<string, unknown>) => {
        const isbn = (d.isbn as string[] | undefined)?.[0] ?? ''
        const coverId = d.cover_i as number | undefined
        return {
          ISBN: isbn,
          name: (d.title as string | undefined) ?? '',
          author: (d.author_name as string[] | undefined)?.[0] ?? '',
          pubDate: String(d.first_publish_year ?? ''),
          img: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-S.jpg` : '',
        }
      })
      res.json({ state: 0, msg: '查询成功', data: results })
    } catch (e) { res.json(err(e)) }
  })

  // ─── Vike SSR ──────────────────────────────────────────────────────────────
  if (isProduction) {
    const distDir = path.join(__dirname, '..', 'dist', 'client')
    app.use(express.static(distDir))
  }

  const { renderPage } = await import('vike/server')

  app.get('*', async (req: Request, res: Response) => {
    const userInfo = (req.session as unknown as Record<string, unknown>).account_login
    const pageContext = await renderPage({
      urlOriginal: req.originalUrl,
      userInfo: userInfo ?? null,
    })
    const { httpResponse } = pageContext
    if (!httpResponse) return res.status(404).send('Not Found')
    const { body, statusCode, headers } = httpResponse
    headers.forEach(([name, value]) => res.setHeader(name, value))
    res.status(statusCode).send(body)
  })

  app.listen(port, () => {
    console.log(`🚀 Librejo server running at http://localhost:${port}`)
    console.log(`📖 API docs at http://localhost:${port}/api/docs`)
  })
}

startServer().catch(console.error)
