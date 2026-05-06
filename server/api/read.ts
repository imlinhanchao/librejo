import crypto from 'crypto'
import { prisma } from '../prisma.js'
import { AppErrors, ok, nowTs } from './app.js'

function getUserId(session: Record<string, unknown>): string {
  const user = session.account_login as { id: string } | undefined
  if (!user) throw AppErrors.nologin
  return user.id
}

export async function newRead(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { bookId, status, page } = data as { bookId?: string; status?: number; page?: number }
  if (!bookId || status === undefined) throw AppErrors.param
  if (status < 0 || status > 2) throw AppErrors.param

  const book = await prisma.lib_book_info.findUnique({ where: { id: bookId } })
  if (!book) throw AppErrors.existed('图书', false)
  if (book.userId !== userId) throw AppErrors.unauthorized

  const read = await prisma.lib_read_record.create({
    data: {
      id: crypto.randomUUID(),
      bookId,
      ISBN: book.ISBN,
      status,
      page: Number(page ?? 0),
      create_time: nowTs(),
      update_time: nowTs(),
    },
  })
  return ok('创建成功', read)
}

export async function getReads(bookId: string) {
  const reads = await prisma.lib_read_record.findMany({
    where: { bookId },
    orderBy: { create_time: 'desc' },
  })
  return ok('查询成功', reads)
}

export async function lastRead(bookId: string) {
  const read = await prisma.lib_read_record.findFirst({
    where: { bookId },
    orderBy: { create_time: 'desc' },
  })
  return ok('查询成功', read ?? { bookId, status: 0, page: 0 })
}

export async function lastReads(data: Record<string, unknown>) {
  const bookIds = data.bookIds as string[]
  if (!bookIds || !Array.isArray(bookIds)) throw AppErrors.param

  const reads = await prisma.lib_read_record.findMany({
    where: { bookId: { in: bookIds } },
    orderBy: { create_time: 'desc' },
  })

  const seen = new Set<string>()
  const latest: typeof reads = []
  for (const r of reads) {
    if (!seen.has(r.bookId)) {
      seen.add(r.bookId)
      latest.push(r)
    }
  }
  return ok('查询成功', latest)
}
