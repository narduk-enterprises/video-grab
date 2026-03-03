<script setup lang="ts">
useSeo({
  title: 'Video Grab — Download X (Twitter) videos',
  description: 'Paste an X or Twitter video link and download the video. Simple, fast, no sign-up.',
  ogImage: { title: 'Video Grab', description: 'Download X (Twitter) videos', icon: 'i-lucide-download' },
})
useWebPageSchema({
  name: 'Video Grab',
  description: 'Download videos from X (Twitter) by pasting a tweet link.',
})

const { state, schema, pending, isSuccess, data, errorMessage, urlHint, onSubmit, clearResult, isXOrTwitterLink } = useDownloadVideo()

function downloadFileUrlFor(url: string) {
  return `/api/download-file?url=${encodeURIComponent(url)}`
}

const defaultDownloadUrl = computed(() => {
  const url = data.value?.videoUrl
  return url ? downloadFileUrlFor(url) : ''
})

const variants = computed(() => data.value?.variants ?? [])

const otherSizesItems = computed(() => {
  const list = variants.value.map((v) => ({
    label: v.label,
    to: downloadFileUrlFor(v.url),
    target: '_blank' as const,
    rel: 'noopener',
  }))
  return list.length ? [list] : []
})

function triggerDownload(url: string) {
  if (!import.meta.client) return
  const href = downloadFileUrlFor(url)
  const a = document.createElement('a')
  a.href = href
  a.download = 'video.mp4'
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

watch(isSuccess, (ok) => {
  if (ok && data.value?.videoUrl) {
    triggerDownload(data.value.videoUrl)
  }
})

const canPaste = ref(false)
const pasteFeedback = ref<'idle' | 'success' | 'error'>('idle')

onMounted(() => {
  canPaste.value = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText
})

async function handlePaste() {
  pasteFeedback.value = 'idle'
  try {
    const text = await navigator.clipboard.readText()
    const trimmed = text.trim()
    if (trimmed) {
      state.url = trimmed
      pasteFeedback.value = 'success'
      setTimeout(() => { pasteFeedback.value = 'idle' }, 800)
    }
  } catch {
    pasteFeedback.value = 'error'
    setTimeout(() => { pasteFeedback.value = 'idle' }, 1500)
  }
}

const urlStatus = computed(() => {
  const u = state.url ?? ''
  if (!u.trim()) return null
  return isXOrTwitterLink(u) ? 'valid' : 'invalid'
})

const pasteButtonIcon = computed(() =>
  pasteFeedback.value === 'success'
    ? 'i-lucide-check'
    : pasteFeedback.value === 'error'
      ? 'i-lucide-alert-circle'
      : 'i-lucide-clipboard-paste',
)
const pasteButtonColor = computed(() =>
  pasteFeedback.value === 'success'
    ? 'success'
    : pasteFeedback.value === 'error'
      ? 'error'
      : 'neutral',
)
</script>

<template>
  <UPage class="min-h-screen">
    <!-- Download card first — prominent at top -->
    <div class="mx-auto max-w-2xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
      <h1 class="sr-only">
        Video Grab — Download X (Twitter) videos
      </h1>
      <ULink
        to="/"
        class="mb-6 flex justify-center text-default [&_img]:h-10 [&_img]:w-auto [&_img]:sm:h-12"
        aria-label="Video Grab — home"
      >
        <img src="/logo.svg" alt="" width="220" height="48" />
      </ULink>
      <p class="font-display mb-6 text-center text-lg font-semibold tracking-tight text-default sm:text-xl">
        Paste an X link · We grab the video · You download
      </p>
      <UCard
        :class="[
          'card-premium overflow-hidden transition-base',
          pending && 'animate-card-pulse',
        ]"
      >
        <UForm
          :schema="schema"
          :state="state"
          autocomplete="off"
          @submit="onSubmit"
        >
          <div class="flex flex-col gap-6">
            <UFormField
              label="X (Twitter) video URL"
              name="url"
              :hint="urlHint"
            >
              <div class="flex gap-2">
                <UInput
                  v-model="state.url"
                  type="url"
                  placeholder="https://x.com/username/status/..."
                  size="xl"
                  :disabled="pending"
                  autocomplete="url"
                  autocapitalize="off"
                  :spellcheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  class="flex-1 transition-base"
                  :ui="{
                    base: urlStatus === 'valid'
                      ? 'border-primary-500/50 dark:border-primary-400/50'
                      : urlStatus === 'invalid' && (state.url ?? '').trim()
                        ? 'border-red-500/50 dark:border-red-400/50'
                        : '',
                  }"
                >
                  <template #leading>
                    <UIcon
                      :name="urlStatus === 'valid' ? 'i-lucide-link' : 'i-lucide-link-2-off'"
                      class="size-5 shrink-0"
                      :class="urlStatus === 'valid' ? 'text-primary' : 'text-muted'"
                    />
                  </template>
                  <template v-if="urlStatus === 'valid'" #trailing>
                    <UIcon name="i-lucide-circle-check" class="size-5 text-primary" />
                  </template>
                </UInput>
                <ClientOnly>
                  <UButton
                    v-if="canPaste"
                    type="button"
                    variant="soft"
                    size="xl"
                    :icon="pasteButtonIcon"
                    :color="pasteButtonColor"
                    aria-label="Paste from clipboard"
                    @click="handlePaste"
                  />
                </ClientOnly>
              </div>
            </UFormField>

            <div class="flex flex-wrap items-center gap-3">
              <UButton
                type="submit"
                size="xl"
                icon="i-lucide-download"
                :loading="pending"
                :disabled="pending"
                class="min-w-[180px]"
              >
                {{ pending ? 'Grabbing video…' : 'Grab video' }}
              </UButton>
              <UButton
                v-if="isSuccess || errorMessage"
                type="button"
                color="neutral"
                variant="ghost"
                size="xl"
                @click="clearResult"
              >
                Clear
              </UButton>
            </div>
          </div>
        </UForm>

        <!-- Error state -->
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
          icon="i-lucide-alert-circle"
          class="mt-6"
        />

        <!-- Success state -->
        <div
          v-else-if="isSuccess && data?.videoUrl"
          class="animate-success-in mt-6 rounded-xl border border-primary-500/30 bg-primary-500/5 p-6 dark:border-primary-400/30 dark:bg-primary-400/10"
          role="status"
          aria-live="polite"
          aria-label="Download ready"
        >
          <div class="flex items-start gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <UIcon name="i-lucide-circle-check-big" class="size-6" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-default">
                Your video is ready
              </p>
              <p class="mt-1 text-sm text-muted">
                Download started. Use the buttons below to download again or pick a different size.
              </p>
              <div class="mt-4 flex flex-wrap items-center gap-3">
                <UButton
                  :to="defaultDownloadUrl"
                  target="_blank"
                  rel="noopener"
                  size="lg"
                  icon="i-lucide-download"
                  class="min-w-[200px]"
                >
                  Download again (best)
                </UButton>
                <UDropdownMenu
                  v-if="otherSizesItems.length > 0"
                  :items="otherSizesItems"
                >
                  <UButton
                    variant="soft"
                    color="neutral"
                    size="lg"
                    trailing-icon="i-lucide-chevron-down"
                  >
                    Other sizes
                  </UButton>
                </UDropdownMenu>
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="lg"
                  @click="clearResult"
                >
                  Grab another
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Trust line -->
      <p class="mt-6 text-center text-sm text-muted">
        No account required · No data stored · Works in your browser
      </p>
    </div>
  </UPage>
</template>
