import { ok, AppErrors } from './app.js'

interface IsbnBookData {
  name: string
  author: string
  publisher: string
  page: number
  ISBN: string
  pubDate: string
  img: string
  dbId: string
}

/**
 * Query book info by ISBN using Open Library API (free, supports international books).
 * Falls back gracefully when data is missing.
 */
export async function isbnQuery(isbn: string): Promise<ReturnType<typeof ok>> {
  if (!isbn) throw AppErrors.param

  const { default: axios } = await import('axios')

  try {
    // Open Library Works API
    const olUrl = `https://openlibrary.org/isbn/${isbn}.json`
    const resp = await axios.get(olUrl, { timeout: 8000 })
    const d = resp.data as Record<string, unknown>

    // Resolve cover image
    const coverId = (d.covers as number[] | undefined)?.[0]
    const img = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : ''

    // Resolve author names via author keys
    let author = ''
    const authorKeys = (d.authors as Array<{ key: string }> | undefined) ?? []
    if (authorKeys.length > 0) {
      try {
        const aResp = await axios.get(
          `https://openlibrary.org${authorKeys[0].key}.json`,
          { timeout: 5000 }
        )
        author = (aResp.data as { name?: string }).name ?? ''
      } catch {
        // ignore, leave author empty
      }
    }

    // Try to get additional details from works
    const workKeys = (d.works as Array<{ key: string }> | undefined) ?? []
    let description = ''
    if (workKeys.length > 0) {
      try {
        const wResp = await axios.get(
          `https://openlibrary.org${workKeys[0].key}.json`,
          { timeout: 5000 }
        )
        const wData = wResp.data as Record<string, unknown>
        const desc = wData.description
        if (typeof desc === 'string') description = desc
        else if (desc && typeof desc === 'object') description = (desc as { value: string }).value ?? ''
      } catch {
        // ignore
      }
    }

    const publishers = (d.publishers as string[] | undefined) ?? []
    const publishDate = (d.publish_date as string | undefined) ?? ''

    const book: IsbnBookData = {
      name: (d.title as string) ?? '',
      author,
      publisher: publishers[0] ?? '',
      page: (d.number_of_pages as number | undefined) ?? 0,
      ISBN: isbn,
      pubDate: publishDate.slice(0, 7),
      img,
      dbId: (d.key as string | undefined) ?? '',
    }

    return ok('查询成功', book)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status
    if (status === 404) {
      throw AppErrors.existed('图书', false)
    }
    throw AppErrors.network(err instanceof Error ? err.message : String(err))
  }
}
