<script setup>
defineProps({
  paperWidth: { type: String, required: true },
})

const emit = defineEmits(['close', 'update:paperWidth'])

const options = [
  { value: '58', label: '58 mm', desc: 'Printer thermal kecil (standar)' },
  { value: '80', label: '80 mm', desc: 'Printer thermal lebar' },
]
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-sm overflow-hidden rounded-2xl bg-cocoa-100 shadow-2xl dark:bg-cocoa-950">
        <header class="flex items-center justify-between px-4 py-3">
          <h3 class="text-sm font-bold text-cocoa-900 dark:text-cocoa-100">
            <i class="fa-solid fa-gear mr-2 text-cocoa-600"></i>Pengaturan
          </h3>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full text-cocoa-500 hover:bg-cocoa-200 dark:hover:bg-cocoa-800"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="px-4 pb-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-500 dark:text-cocoa-400">
            Lebar Kertas Printer Thermal
          </p>
          <div class="space-y-2">
            <button
              v-for="opt in options"
              :key="opt.value"
              class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition"
              :class="
                paperWidth === opt.value
                  ? 'border-cocoa-600 bg-cocoa-600 text-white shadow'
                  : 'border-cocoa-300 bg-white text-cocoa-700 hover:bg-cocoa-100 dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-200 dark:hover:bg-cocoa-800'
              "
              @click="emit('update:paperWidth', opt.value)"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-receipt"></i>
                <span>
                  <span class="block text-sm font-bold">{{ opt.label }}</span>
                  <span class="block text-xs opacity-70">{{ opt.desc }}</span>
                </span>
              </span>
              <i
                v-if="paperWidth === opt.value"
                class="fa-solid fa-circle-check"
              ></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>