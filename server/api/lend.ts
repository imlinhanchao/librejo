import crypto from 'crypto'
import { prisma } from '../prisma.js'
import { AppErrors, ok, nowTs } from './app.js'

export async function newLend(data: Record<string, unknown>) {
  const { bookId, accountId, status, remark } = data as {
    bookId?: string; accountId?: string; status?: number; remark?: string
  }
  if (!bookId || !accountId || status === undefined) throw AppErrors.param
  if (status < 1 || status > 4) throw AppErrors.param

  const lend = await prisma.lib_lend_record.create({
    data: {
      id: crypto.randomUUID(),
      bookId,
      accountId,
      remark: remark ?? '',
      status,
      lend_date: nowTs(),
      back_date: null,
      create_time: nowTs(),
      update_time: nowTs(),
    },
  })
  return ok('创建成功', lend)
}

export async function setLend(data: Record<string, unknown>) {
  const { id, status, remark } = data as { id?: string; status?: number; remark?: string }
  if (!id || status === undefined) throw AppErrors.param
  if (status < 1 || status > 4) throw AppErrors.param

  const lend = await prisma.lib_lend_record.findUnique({ where: { id } })
  if (!lend) throw AppErrors.existed('借书记录', false)

  const updateData: Record<string, unknown> = { status, update_time: nowTs() }
  if (remark !== undefined) updateData.remark = remark
  if (status === 4) updateData.back_date = nowTs()

  const updated = await prisma.lib_lend_record.update({ where: { id }, data: updateData })
  return ok('更新成功', updated)
}

export async function delLend(data: Record<string, unknown>) {
  const { id } = data
  if (!id) throw AppErrors.param

  const lend = await prisma.lib_lend_record.findUnique({ where: { id: id as string } })
  if (!lend) throw AppErrors.existed('借书记录', false)

  await prisma.lib_lend_record.delete({ where: { id: id as string } })
  return ok('删除成功', id)
}

export async function queryLends(data: Record<string, unknown>) {
  const { index = 0, count = 10, query = {} } = data as {
    index?: number; count?: number; query?: Record<string, unknown>
  }
  const q = query as Record<string, unknown>
  const where: Record<string, unknown> = {}
  if (q.bookId) where.bookId = q.bookId
  if (q.accountId) where.accountId = q.accountId
  if (q.status) where.status = Number(q.status)

  const total = await prisma.lib_lend_record.count({ where })
  const lends = await prisma.lib_lend_record.findMany({
    where,
    orderBy: { create_time: 'desc' },
    skip: Number(index),
    take: count > 0 ? Number(count) : undefined,
  })
  return ok('查询成功', { data: lends, total })
}
