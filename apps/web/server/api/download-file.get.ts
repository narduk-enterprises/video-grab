/**
 * Proxies an X/Twitter video URL and returns it with Content-Disposition: attachment
 * so the browser triggers a download instead of opening/playing in a new tab.
 * Only allows URLs from Twitter's video CDN.
 */
import { z } from 'zod'

const ALLOWED_HOSTS = ['video.twimg.com', 'pbs.twimg.com']

const querySchema = z.object({
  url: z.string().min(1, 'Missing url query parameter.'),
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'download-file', 15, 60_000)

  const queryResult = querySchema.safeParse(getQuery(event))
  if (!queryResult.success) {
    const firstMessage = queryResult.error.issues[0]?.message
    throw createError({
      statusCode: 400,
      message: typeof firstMessage === 'string' ? firstMessage : 'Missing url query parameter.',
    })
  }

  let videoUrl: string
  try {
    videoUrl = decodeURIComponent(queryResult.data.url.trim())
  } catch {
    throw createError({
      statusCode: 400,
      message: 'Invalid url parameter.',
    })
  }

  let urlObj: URL
  try {
    urlObj = new URL(videoUrl)
  } catch {
    throw createError({
      statusCode: 400,
      message: 'Invalid video URL.',
    })
  }

  if (!ALLOWED_HOSTS.includes(urlObj.hostname.toLowerCase())) {
    throw createError({
      statusCode: 400,
      message: 'Only X (Twitter) video URLs are allowed.',
    })
  }

  const res = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })

  if (!res.ok) {
    throw createError({
      statusCode: res.status === 404 ? 404 : 502,
      message: res.status === 404 ? 'Video no longer available.' : 'Could not fetch video.',
    })
  }

  const contentType = res.headers.get('content-type') ?? 'video/mp4'
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="video.mp4"')
  setResponseHeader(event, 'Content-Type', contentType)

  return res.body
})
