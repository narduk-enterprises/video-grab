<script setup lang="ts">
const appName = useRuntimeConfig().public.appName || 'Video Grab'
</script>

<template>
  <UApp>
    <ULink to="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">Skip to content</ULink>
    <div class="app-shell hero-mesh min-h-screen flex flex-col">
      <div id="main-content" class="flex-1" role="main">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </div>
      </div>

      <div class="shrink-0 border-t border-default bg-default/30 py-6" role="contentinfo">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-muted">
            {{ appName }} — fast X video downloads · No sign-up · <NuxtTime :datetime="new Date()" year="numeric" />
          </p>
        </div>
      </div>
    </div>
  </UApp>
</template>
