<script setup>
import { formatPrice } from '../utils/format'

defineProps({
  product: { type: Object, required: true },
})

defineEmits(['add'])
</script>

<template>
  <button
    class="group flex flex-col overflow-hidden rounded-2xl border border-cocoa-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-cocoa-800 dark:bg-cocoa-900"
    @click="$emit('add', product)"
  >
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-cocoa-100 dark:bg-cocoa-800">
      <img
        v-if="product.img"
        :src="product.img"
        :alt="product.name"
        loading="lazy"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        @error="$event.target.style.display = 'none'"
      />
      <div
        v-if="!product.img"
        class="flex h-full w-full items-center justify-center text-4xl text-cocoa-400"
      >
        <i class="fa-solid fa-mug-hot"></i>
      </div>
    </div>
    <div class="flex flex-1 flex-col gap-1 p-3">
      <p class="line-clamp-2 text-sm font-semibold text-cocoa-900 dark:text-cocoa-100">{{ product.name }}</p>
      <p class="text-[11px] uppercase tracking-wide text-cocoa-500 dark:text-cocoa-400">{{ product.type }}</p>
      <div class="mt-1 flex items-center justify-between">
        <span class="text-sm font-bold text-cocoa-700 dark:text-cocoa-200">{{ formatPrice(product.price) }}</span>
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-cocoa-600 text-white shadow transition group-hover:scale-110 group-hover:bg-cocoa-500"
        >
          <i class="fa-solid fa-plus"></i>
        </span>
      </div>
    </div>
  </button>
</template>