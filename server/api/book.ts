import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import { prisma } from '../prisma.js'
import { AppErrors, ok, nowTs, filterObj } from './app.js'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './public/upload'
const FILE_URL = process.env.FILE_URL ?? '/upload/'

const SAFE_KEYS = ['id', 'userId', 'dbId', 'img', 'name', 'author', 'publisher', 'page', 'ISBN', 'pubDate', 'status', 'create_time', 'update_time', 'read']

function getUserId(session: Record<string, unknown>): string {
  const user = session.account_login as { id: string } | undefined
  if (!user) throw AppErrors.nologin
  return user.id
}

async function downloadImg(src: string): Promise<string> {
  const { default: axios } = await import('axios')
  const ext = path.extname(new URL(src).pathname) || '.jpg'
  const tmpName = `${Date.now()}.${Math.floor(Math.random() * 100000)}${ext}`
  const tmpPath = path.join(UPLOAD_DIR, tmpName)

  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  const resp = await axios.get(src, { responseType: 'arraybuffer' })
  fs.writeFileSync(tmpPath, resp.data as Buffer)

  const hash = crypto.createHash('md5').update(resp.data as Buffer).digest('hex')
  const newName = `${hash}${ext}`
  const newPath = path.join(UPLOAD_DIR, newName)
  if (!fs.existsSync(newPath)) fs.renameSync(tmpPath, newPath)
  else fs.unlinkSync(tmpPath)
  return `${FILE_URL}${newName}`
}

export async function newBook(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { name, page } = data
  if (!name || !page) throw AppErrors.param

  let img = (data.img as string) ?? ''
  if (img.startsWith('http')) {
    try { img = await downloadImg(img) } catch { /* keep original url */ }
  }

  const book = await prisma.lib_book_info.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      dbId: (data.dbId as string) ?? '',
      img,
      name: name as string,
      author: (data.author as string) ?? '',
      publisher: (data.publisher as string) ?? '',
      page: Number(page),
      ISBN: (data.ISBN as string) ?? '',
      pub_date: (data.pubDate as string) ?? '',
      status: 0,
      create_time: nowTs(),
      update_time: nowTs(),
    },
  })
  return ok('创建成功', mapBook(book))
}

export async function setBook(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { id } = data
  if (!id) throw AppErrors.param

  const book = await prisma.lib_book_info.findUnique({ where: { id: id as string } })
  if (!book) throw AppErrors.existed('图书', false)
  if (book.userId !== userId) throw AppErrors.unauthorized

  const updateData: Record<string, unknown> = { update_time: nowTs() }
  const fields = ['img', 'name', 'author', 'publisher', 'page', 'status']
  for (const f of fields) {
    if (data[f] !== undefined) updateData[f] = f === 'page' ? Number(data[f]) : data[f]
  }
  if (data.pubDate !== undefined) updateData.pub_date = data.pubDate

  const updated = await prisma.lib_book_info.update({ where: { id: id as string }, data: updateData })
  return ok('更新成功', mapBook(updated))
}

export async function delBook(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { id } = data
  if (!id) throw AppErrors.param

  const book = await prisma.lib_book_info.findUnique({ where: { id: id as string } })
  if (!book) throw AppErrors.existed('图书', false)
  if (book.userId !== userId) throw AppErrors.unauthorized

  await prisma.lib_book_info.delete({ where: { id: id as string } })
  return ok('删除成功', id)
}

export async function getBook(id: string) {
  const book = await prisma.lib_book_info.findUnique({ where: { id } })
  if (!book) throw AppErrors.existed('图书', false)

  const read = await prisma.lib_read_record.findFirst({
    where: { bookId: id },
    orderBy: { create_time: 'desc' },
  })
  const result = { ...mapBook(book), read: read ?? { bookId: id, status: 0, page: 0 } }
  return ok('查询成功', result)
}

export async function queryBooks(data: Record<string, unknown>) {
  const { index = 0, count = 10, query = {} } = data as {
    index?: number
    count?: number
    query?: Record<string, unknown>
  }

  const where: Record<string, unknown> = {}
  const q = query as Record<string, unknown>

  if (q.userId) where.userId = q.userId
  if (q.name) where.name = { contains: (q.name as string).replace(/%/g, '') }
  if (q.create_time) where.create_time = { lt: Number(q.create_time) }

  const total = await prisma.lib_book_info.count({ where })
  const books = await prisma.lib_book_info.findMany({
    where,
    orderBy: { create_time: 'desc' },
    skip: Number(index),
    take: count > 0 ? Number(count) : undefined,
  })

  const bookIds = books.map(b => b.id)
  const reads = await prisma.lib_read_record.findMany({
    where: { bookId: { in: bookIds } },
    orderBy: { create_time: 'desc' },
  })

  // keep only the latest read per bookId
  const latestReads = new Map<string, typeof reads[0]>()
  for (const r of reads) {
    if (!latestReads.has(r.bookId)) latestReads.set(r.bookId, r)
  }

  const data2 = books.map(b => ({
    ...mapBook(b),
    read: latestReads.get(b.id) ?? { bookId: b.id, status: 0, page: 0 },
  }))

  return ok('查询成功', { data: data2, total })
}

function mapBook(b: Record<string, unknown>) {
  return {
    id: b.id,
    userId: b.userId,
    dbId: b.dbId,
    img: b.img,
    name: b.name,
    author: b.author,
    publisher: b.publisher,
    page: b.page,
    ISBN: b.ISBN,
    pubDate: b.pub_date,
    status: b.status,
    create_time: b.create_time,
    update_time: b.update_time,
  }
}
