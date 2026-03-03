import { z } from 'zod'

const X_HOSTS = ['x.com', 'twitter.com', 'www.x.com', 'www.twitter.com', 'mobile.twitter.com', 'mobile.x.com']

function isXOrTwitterUrl(value: string): boolean {
  if (!value.trim()) return false
  try {
    const u = new URL(value.trim())
    return X_HOSTS.includes(u.hostname.toLowerCase())
  } catch {
    return false
  }
}

export const downloadVideoSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine((val) => isXOrTwitterUrl(val), {
      message: 'Only X (Twitter) links are supported. Paste an x.com or twitter.com link.',
    }),
})

export type DownloadVideoSchema = z.infer<typeof downloadVideoSchema>

export interface VideoVariant {
  url: string
  bitrate?: number
  label: string
}

export interface DownloadResult {
  success: boolean
  videoUrl: string
  tweetId: string
  variants?: VideoVariant[]
}

export function useDownloadVideo() {
  const state = reactive<Partial<DownloadVideoSchema>>({
    url: '',
  })

  const body = computed(() => ({ url: String(state.url ?? '').trim() }))

  const { execute, status, data, error, clear } = useFetch<DownloadResult>('/api/download', {
    method: 'POST',
    body,
    immediate: false,
  })

  const pending = computed(() => status.value === 'pending')
  const isSuccess = computed(() => status.value === 'success' && data.value?.success === true)
  const errorMessage = computed(() => {
    if (error.value) {
      const e = error.value as { data?: { message?: string }; message?: string }
      return e.data?.message ?? e.message ?? 'Something went wrong.'
    }
    return null
  })

  function onSubmit() {
    clear()
    execute()
  }

  function clearResult() {
    clear()
  }

  const urlHint = computed(() => {
    const u = state.url ?? ''
    if (!u.trim()) return 'Paste a link from x.com or twitter.com'
    return isXOrTwitterUrl(u) ? 'X/Twitter link detected.' : 'Paste a link from x.com or twitter.com'
  })

  const canSubmit = computed(() => {
    const u = state.url ?? ''
    return u.trim() !== '' && isXOrTwitterUrl(u)
  })

  return {
    state,
    schema: downloadVideoSchema,
    pending,
    isSuccess,
    data,
    errorMessage,
    urlHint,
    canSubmit,
    isXOrTwitterLink: isXOrTwitterUrl,
    onSubmit,
    clearResult,
  }
}
