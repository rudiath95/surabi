<script setup>
import { computed } from 'vue'
import { formatPrice } from '../utils/format'

const props = defineProps({
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  cartCount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  note: { type: String, required: true },
  customer: { type: String, required: true },
  isEditing: { type: Boolean, required: true },
  editingOrderNo: { type: String, required: true },
})

const emit = defineEmits([
  'increment',
  'decrement',
  'remove',
  'clear',
  'checkout',
  'save',
  'cancelEdit',
  'update:paymentMethod',
  'update:note',
  'update:customer',
])

const isEmpty = computed(() => props.items.length === 0)

const paymentOptions = [
  { value: 'tunai', label: 'Tunai', icon: 'fa-money-bill-wave' },
  { value: 'qris', label: 'QRIS', icon: 'fa-qrcode' },
  { value: 'transfer', label: 'Transfer', icon: 'fa-building-columns' },
]
</script>

<template>
  <aside
    class="flex h-full flex-col rounded-2xl border border-cocoa-200 bg-white shadow-sm dark:border-cocoa-800 dark:bg-cocoa-900"
  >
    <header class="flex items-center justify-between border-b border-cocoa-100 px-4 py-3 dark:border-cocoa-800">
      <h2 class="flex items-center gap-2 text-base font-bold text-cocoa-900 dark:text-cocoa-100">
        <i class="fa-solid fa-cart-shopping text-cocoa-600"></i>
        Pesanan
        <span
          v-if="cartCount"
          class="rounded-full bg-cocoa-600 px-2 py-0.5 text-xs font-bold text-white"
          >{{ cartCount }}</span
        >
      </h2>
      <button
        v-if="!isEmpty"
        class="text-xs font-medium text-cocoa-500 hover:text-red-500"
        @click="emit('clear')"
      >
        <i class="fa-solid fa-trash-can mr-1"></i>Kosongkan
      </button>
    </header>

    <div class="flex-1 overflow-y-auto px-3 py-2">
      <div
        v-if="isEmpty"
        class="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-cocoa-400 dark:text-cocoa-500"
      >
        <i class="fa-solid fa-bowl-food text-4xl"></i>
        <p class="text-sm">Belum ada item.</p>
        <p class="text-xs">Klik menu untuk menambah pesanan.</p>
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-2 rounded-xl bg-cream-50 p-2 dark:bg-cocoa-950/60"
        >
          <img
            :src="item.img"
            :alt="item.name"
            class="h-11 w-11 shrink-0 rounded-lg object-cover"
            @error="$event.target.style.display = 'none'"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-cocoa-900 dark:text-cocoa-100">{{ item.name }}</p>
            <p class="text-xs text-cocoa-500 dark:text-cocoa-400">{{ formatPrice(item.price) }}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              class="flex h-6 w-6 items-center justify-center rounded-md bg-cocoa-100 text-cocoa-700 hover:bg-cocoa-200 dark:bg-cocoa-800 dark:text-cocoa-200 dark:hover:bg-cocoa-700"
              @click="emit('decrement', item.id)"
            >
              <i class="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span class="w-5 text-center text-sm font-bold text-cocoa-900 dark:text-cocoa-100">{{ item.qty }}</span>
            <button
              class="flex h-6 w-6 items-center justify-center rounded-md bg-cocoa-100 text-cocoa-700 hover:bg-cocoa-200 dark:bg-cocoa-800 dark:text-cocoa-200 dark:hover:bg-cocoa-700"
              @click="emit('increment', item.id)"
            >
              <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>
          <button
            class="ml-1 text-cocoa-300 hover:text-red-500"
            @click="emit('remove', item.id)"
            title="Hapus"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </li>
      </ul>
    </div>

    <footer class="border-t border-cocoa-100 p-4 dark:border-cocoa-800">
      <div class="mb-3">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-500 dark:text-cocoa-400">
          Pelanggan <span class="normal-case font-normal">(opsional)</span>
        </p>
        <div class="relative">
          <i
            class="fa-solid fa-user pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cocoa-400"
          ></i>
          <input
            :value="customer"
            type="text"
            placeholder="Nama pelanggan..."
            class="w-full rounded-xl border border-cocoa-300 bg-white py-2 pl-9 pr-3 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-cocoa-600 focus:outline-none focus:ring-2 focus:ring-cocoa-500/30 dark:border-cocoa-700 dark:bg-cocoa-950 dark:text-cocoa-100 dark:placeholder:text-cocoa-500"
            @input="emit('update:customer', $event.target.value)"
          />
        </div>
      </div>

      <div class="mb-3">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-500 dark:text-cocoa-400">
          Metode Pembayaran
        </p>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in paymentOptions"
            :key="opt.value"
            class="flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold transition"
            :class="
              paymentMethod === opt.value
                ? 'border-cocoa-600 bg-cocoa-600 text-white shadow'
                : 'border-cocoa-300 bg-white text-cocoa-700 hover:bg-cocoa-100 dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-200 dark:hover:bg-cocoa-800'
            "
            @click="emit('update:paymentMethod', opt.value)"
          >
            <i :class="['fa-solid', opt.icon, 'text-sm']"></i>
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="mb-3">
        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-500 dark:text-cocoa-400">
          Catatan <span class="normal-case font-normal">(opsional)</span>
        </p>
        <textarea
          :value="note"
          rows="2"
          placeholder="Contoh: tanpa gula, tanpa es, extra pedas..."
          class="w-full resize-none rounded-xl border border-cocoa-300 bg-white px-3 py-2 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-cocoa-600 focus:outline-none focus:ring-2 focus:ring-cocoa-500/30 dark:border-cocoa-700 dark:bg-cocoa-950 dark:text-cocoa-100 dark:placeholder:text-cocoa-500"
          @input="emit('update:note', $event.target.value)"
        ></textarea>
      </div>

      <div v-if="isEditing" class="mb-3 flex items-center justify-between rounded-xl bg-cocoa-100 px-3 py-2 dark:bg-cocoa-800/60">
        <span class="flex items-center gap-1.5 text-xs font-semibold text-cocoa-700 dark:text-cocoa-200">
          <i class="fa-solid fa-pen text-[10px]"></i>
          Mengedit {{ editingOrderNo }}
        </span>
        <button
          class="text-xs font-medium text-cocoa-500 hover:text-red-500"
          @click="emit('cancelEdit')"
        >
          Batalkan
        </button>
      </div>

      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-medium text-cocoa-600 dark:text-cocoa-300">Total</span>
        <span class="text-xl font-extrabold text-cocoa-800 dark:text-cocoa-100">{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="flex gap-2">
        <button
          :disabled="isEmpty"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cocoa-300 py-3 text-sm font-bold text-cocoa-700 transition hover:bg-cocoa-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-cocoa-700 dark:text-cocoa-200 dark:hover:bg-cocoa-800"
          @click="emit('save')"
        >
          <i class="fa-solid fa-floppy-disk"></i>
          {{ isEditing ? 'Simpan Perubahan' : 'Simpan Pesanan' }}
        </button>
        <button
          :disabled="isEmpty"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cocoa-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-cocoa-500 disabled:cursor-not-allowed disabled:opacity-40"
          @click="emit('checkout')"
        >
          <i class="fa-solid fa-receipt"></i>
          Cetak Struk
        </button>
      </div>
    </footer>
  </aside>
</template>