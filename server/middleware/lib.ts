import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import svgCaptcha from 'svg-captcha'
import multer from 'multer'
import { Router } from 'express'
import { ok, AppErrors, err } from '../api/app.js'
import type { Request, Response } from 'express'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './public/upload'
const FILE_URL = process.env.FILE_URL ?? '/upload/'
const MAX_SIZE = Number(process.env.MAX_FILE_MB ?? 2) * 1024 * 1024

const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: MAX_SIZE } })

export function libRouter() {
  const router = Router()

  router.get('/captcha', (req: Request, res: Response) => {
    const code = svgCaptcha.create({ noise: 2, color: true })
    req.session.captcha = code.text.toLowerCase()
    res.header('Content-Type', 'image/svg+xml')
    res.end(code.data)
  })

  router.post('/upload', upload.array('file'), (req: Request, res: Response) => {
    ;(async () => {
      try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          return res.json(AppErrors.param.toJSON())
        }

        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
        const names: string[] = []

        for (const file of req.files) {
          const ext = path.extname(file.originalname)
          const hash = crypto.createHash('md5').update(file.buffer).digest('hex')
          const filename = `${hash}${ext}`
          const filepath = path.join(UPLOAD_DIR, filename)
          if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, file.buffer)
          }
          names.push(`${FILE_URL}${filename}`)
        }

        res.json(ok('上传成功', names))
      } catch (e) {
        res.json(err(e))
      }
    })()
  })

  return router
}
