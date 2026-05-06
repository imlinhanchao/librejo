import crypto from 'crypto'
import { prisma } from '../prisma.js'
import { AppErrors, ok, nowTs } from './app.js'

function getUserId(session: Record<string, unknown>): string {
  const user = session.account_login as { id: string } | undefined
  if (!user) throw AppErrors.nologin
  return user.id
}

export async function newNote(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { bookId, content, page, section, ISBN, autoread } = data as {
    bookId?: string; content?: string; page?: number; section?: string; ISBN?: string; autoread?: boolean
  }
  if (!bookId || !content) throw AppErrors.param

  const book = await prisma.lib_book_info.findUnique({ where: { id: bookId } })
  if (!book) throw AppErrors.existed('图书', false)
  if (book.userId !== userId) throw AppErrors.unauthorized

  let read = null
  if (autoread && page) {
    const lastRead = await prisma.lib_read_record.findFirst({
      where: { bookId },
      orderBy: { create_time: 'desc' },
    })
    if (lastRead?.status !== 2 && (!lastRead?.page || lastRead.page < page)) {
      read = await prisma.lib_read_record.create({
        data: {
          id: crypto.randomUUID(),
          bookId,
          ISBN: book.ISBN,
          status: 1,
          page: Number(page),
          create_time: nowTs(),
          update_time: nowTs(),
        },
      })
    }
  }

  const note = await prisma.lib_book_note.create({
    data: {
      id: crypto.randomUUID(),
      bookId,
      page: Number(page ?? 0),
      ISBN: ISBN ?? book.ISBN,
      section: section ?? '',
      content: content as string,
      favcount: 0,
      create_time: nowTs(),
      update_time: nowTs(),
    },
  })

  return ok('创建成功', { ...note, read })
}

export async function setNote(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { id, content, page, section, autoread } = data as {
    id?: string; content?: string; page?: number; section?: string; autoread?: boolean
  }
  if (!id) throw AppErrors.param

  const note = await prisma.lib_book_note.findUnique({ where: { id } })
  if (!note) throw AppErrors.existed('笔记', false)

  const book = await prisma.lib_book_info.findUnique({ where: { id: note.bookId } })
  if (!book || book.userId !== userId) throw AppErrors.unauthorized

  let read = null
  if (autoread && page) {
    const lastRead = await prisma.lib_read_record.findFirst({
      where: { bookId: note.bookId },
      orderBy: { create_time: 'desc' },
    })
    if (lastRead?.status !== 2 && (!lastRead?.page || lastRead.page < page)) {
      read = await prisma.lib_read_record.create({
        data: {
          id: crypto.randomUUID(),
          bookId: note.bookId,
          ISBN: book.ISBN,
          status: 1,
          page: Number(page),
          create_time: nowTs(),
          update_time: nowTs(),
        },
      })
    }
  }

  const updateData: Record<string, unknown> = { update_time: nowTs() }
  if (content !== undefined) updateData.content = content
  if (page !== undefined) updateData.page = Number(page)
  if (section !== undefined) updateData.section = section

  const updated = await prisma.lib_book_note.update({ where: { id }, data: updateData })
  return ok('更新成功', { ...updated, read })
}

export async function delNote(data: Record<string, unknown>, session: Record<string, unknown>) {
  const userId = getUserId(session)
  const { id } = data
  if (!id) throw AppErrors.param

  const note = await prisma.lib_book_note.findUnique({ where: { id: id as string } })
  if (!note) throw AppErrors.existed('笔记', false)

  const book = await prisma.lib_book_info.findUnique({ where: { id: note.bookId } })
  if (!book || book.userId !== userId) throw AppErrors.unauthorized

  await prisma.lib_book_note.delete({ where: { id: id as string } })
  return ok('删除成功', id)
}

export async function getNotes(bookId: string) {
  const notes = await prisma.lib_book_note.findMany({
    where: { bookId },
    orderBy: { create_time: 'desc' },
  })
  return ok('查询成功', notes)
}

export async function queryNotes(data: Record<string, unknown>) {
  const { index = 0, count = 10, query = {} } = data as {
    index?: number; count?: number; query?: Record<string, unknown>
  }
  const q = query as Record<string, unknown>
  const where: Record<string, unknown> = {}
  if (q.bookId) where.bookId = q.bookId
  if (q.ISBN) where.ISBN = q.ISBN
  if (q.content) where.content = { contains: (q.content as string).replace(/%/g, '') }

  const total = await prisma.lib_book_note.count({ where })
  const notes = await prisma.lib_book_note.findMany({
    where,
    orderBy: { create_time: 'desc' },
    skip: Number(index),
    take: count > 0 ? Number(count) : undefined,
  })
  return ok('查询成功', { data: notes, total })
}
