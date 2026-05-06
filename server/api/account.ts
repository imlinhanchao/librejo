import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { prisma } from '../prisma.js'
import { AppErrors, ok, nowTs, filterObj } from './app.js'

const SALT_ROUNDS = 12

async function hashPasswd(passwd: string): Promise<string> {
  return bcrypt.hash(passwd, SALT_ROUNDS)
}

async function verifyPasswd(passwd: string, hash: string): Promise<boolean> {
  return bcrypt.compare(passwd, hash)
}

const SAFE_KEYS = ['id', 'username', 'nickname', 'email', 'phone', 'motto', 'avatar', 'lastlogin', 'create_time', 'update_time']

export async function login(data: Record<string, string>, session: Record<string, unknown>) {
  const { username, passwd } = data
  if (!username || !passwd) throw AppErrors.param
  if (username.length < 5) throw AppErrors.reg('用户名太短！')
  if (passwd.length < 5) throw AppErrors.reg('密码太短！')

  const account = await prisma.lib_account.findUnique({ where: { username } })
  if (!account) throw AppErrors.reg('帐号或密码错误！')

  const valid = await verifyPasswd(passwd, account.passwd)
  if (!valid) throw AppErrors.reg('帐号或密码错误！')

  await prisma.lib_account.update({ where: { id: account.id }, data: { lastlogin: nowTs() } })
  session.account_login = account
  return ok('登录成功', filterObj(account as Record<string, unknown>, SAFE_KEYS))
}

export async function logout(session: Record<string, unknown>) {
  if (!session.account_login) throw AppErrors.nologin
  session.account_login = undefined
  return ok('登出成功')
}

export async function info(session: Record<string, unknown>) {
  const loginUser = session.account_login as { username: string } | undefined
  if (!loginUser) throw AppErrors.nologin
  const account = await prisma.lib_account.findUnique({ where: { username: loginUser.username } })
  if (!account) throw AppErrors.nologin
  await prisma.lib_account.update({ where: { id: account.id }, data: { lastlogin: nowTs() } })
  return ok('获取成功', filterObj(account as Record<string, unknown>, SAFE_KEYS))
}

export async function create(data: Record<string, string>, session: Record<string, unknown>) {
  const { username, passwd, email, phone, captcha } = data
  if (!username || !passwd) throw AppErrors.param
  if (username.length < 5) throw AppErrors.reg('用户名太短！')
  if (passwd.length < 5) throw AppErrors.reg('密码太短！')

  if ((session.captcha as string)?.toLowerCase() !== captcha?.toLowerCase())
    throw AppErrors.reg('验证码错误！')

  if (email) {
    const existing = await prisma.lib_account.findFirst({ where: { email } })
    if (existing) throw AppErrors.existed('邮箱')
  }
  if (phone) {
    const existing = await prisma.lib_account.findFirst({ where: { phone } })
    if (existing) throw AppErrors.existed('电话')
  }

  const existing = await prisma.lib_account.findUnique({ where: { username } })
  if (existing) throw AppErrors.existed('帐号')

  const account = await prisma.lib_account.create({
    data: {
      id: crypto.randomUUID(),
      username,
      nickname: username,
      passwd: await hashPasswd(passwd),
      email: email ?? '',
      phone: phone ?? '',
      motto: data.motto ?? '',
      avatar: data.avatar ?? '',
      lastlogin: nowTs(),
      create_time: nowTs(),
      update_time: nowTs(),
    },
  })
  return ok('创建成功', filterObj(account as Record<string, unknown>, SAFE_KEYS))
}

export async function update(data: Record<string, string>, session: Record<string, unknown>) {
  const loginUser = session.account_login as { username: string } | undefined
  if (!loginUser) throw AppErrors.nologin
  if (data.username !== loginUser.username) throw AppErrors.limited

  const account = await prisma.lib_account.findUnique({ where: { username: loginUser.username } })
  if (!account) throw AppErrors.nologin

  if (data.oldpasswd) {
    const valid = await verifyPasswd(data.oldpasswd, account.passwd)
    if (!valid) throw AppErrors.reg('帐号或密码错误！')
  }

  if (data.email && data.email !== account.email) {
    const existing = await prisma.lib_account.findFirst({ where: { email: data.email } })
    if (existing) throw AppErrors.existed('邮箱')
  }

  if (data.phone && data.phone !== account.phone) {
    const existing = await prisma.lib_account.findFirst({ where: { phone: data.phone } })
    if (existing) throw AppErrors.existed('电话')
  }

  const updateData: Record<string, unknown> = { update_time: nowTs() }
  const allowedFields = ['nickname', 'email', 'phone', 'motto', 'avatar']
  for (const f of allowedFields) {
    if (data[f] !== undefined) updateData[f] = data[f]
  }
  if (data.passwd && data.oldpasswd) updateData.passwd = await hashPasswd(data.passwd)

  const updated = await prisma.lib_account.update({ where: { id: account.id }, data: updateData })
  session.account_login = updated
  return ok('更新成功', filterObj(updated as Record<string, unknown>, SAFE_KEYS))
}

export async function exist(username: string) {
  const account = await prisma.lib_account.findUnique({ where: { username } })
  return ok('查询成功', !!account)
}

export async function exists(data: Record<string, string>) {
  const { email, phone } = data
  if (!email && !phone) throw AppErrors.param
  const where: Record<string, string> = {}
  if (email) where.email = email
  if (phone) where.phone = phone
  const account = await prisma.lib_account.findFirst({ where })
  return ok('查询成功', !!account)
}

export async function query(data: Record<string, unknown>) {
  const { username, id } = data as { username?: string; id?: string | string[] }
  const where: Record<string, unknown> = {}
  if (username) where.username = username
  if (id) where.id = Array.isArray(id) ? { in: id } : id

  const accounts = await prisma.lib_account.findMany({
    where,
    select: {
      id: true, username: true, nickname: true, avatar: true,
      motto: true, lastlogin: true, create_time: true, update_time: true,
    },
  })
  return ok('查询成功', { data: accounts, total: accounts.length })
}
