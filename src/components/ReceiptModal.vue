<script setup>
import { computed } from 'vue'
import { formatPrice, formatTime } from '../utils/format'

const props = defineProps({
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  note: { type: String, required: true },
  customer: { type: String, required: true },
  orderNo: { type: String, default: '' },
})

const emit = defineEmits(['close', 'printed'])

const STORE = {
  name: 'SURABI',
  address: 'Jl. Raya Contoh No. 123, Bandung',
  phone: 'Telp: 0812-3456-7890',
}

const paymentLabels = {
  tunai: 'TUNAI',
  qris: 'QRIS',
  transfer: 'TRANSFER',
}

const now = computed(() => new Date())
const orderNo = computed(() => props.orderNo || 'ORD-' + Date.now().toString().slice(-6))
const dateLine = computed(() =>
  now.value.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
)

function print() {
  window.print()
  emit('printed', {
    orderNo: orderNo.value,
    date: now.value.getTime(),
    items: props.items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, img: i.img })),
    subtotal: props.subtotal,
    paymentMethod: props.paymentMethod,
    note: props.note,
    customer: props.customer,
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      class="receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-cocoa-100 shadow-2xl dark:bg-cocoa-950">
        <header class="flex items-center justify-between px-4 py-3">
          <h3 class="text-sm font-bold text-cocoa-900 dark:text-cocoa-100">
            <i class="fa-solid fa-receipt mr-2 text-cocoa-600"></i>Struk Pembayaran
          </h3>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full text-cocoa-500 hover:bg-cocoa-200 dark:hover:bg-cocoa-800"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="overflow-y-auto bg-white p-4 dark:bg-cocoa-900">
          <div class="print-receipt mx-auto bg-white font-mono text-[12px] leading-snug text-black">
            <div class="text-center">
              <p class="text-lg font-bold tracking-widest">{{ STORE.name }}</p>
              <p>{{ STORE.address }}</p>
              <p>{{ STORE.phone }}</p>
            </div>

            <div class="my-1 border-t border-dashed border-black"></div>

            <div class="flex justify-between">
              <span>No : {{ orderNo }}</span>
              <span>{{ dateLine }} {{ formatTime(now) }}</span>
            </div>

            <div v-if="customer" class="flex justify-between">
              <span>Kepada</span>
              <span>{{ customer }}</span>
            </div>

            <div class="my-1 border-t border-dashed border-black"></div>

            <div v-for="item in items" :key="item.id" class="mb-1">
              <p>{{ item.name }}</p>
              <div class="flex justify-between">
                <span>{{ item.qty }} x {{ formatPrice(item.price) }}</span>
                <span>{{ formatPrice(item.qty * item.price) }}</span>
              </div>
            </div>

            <div class="my-1 border-t border-dashed border-black"></div>

            <div class="flex justify-between">
              <span>Bayar</span>
              <span>{{ paymentLabels[paymentMethod] || paymentMethod }}</span>
            </div>

            <div class="mt-1 flex justify-between">
              <span>Catatan</span>
              <span>{{ note || '-' }}</span>
            </div>

            <div class="my-1 border-t border-dashed border-black"></div>

            <div class="flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="my-1 border-t border-dashed border-black"></div>

            <div class="text-center">
              <p>Terima kasih!</p>
              <p>Selamat menikmati.</p>
            </div>
          </div>
        </div>

        <footer class="flex gap-2 px-4 py-3">
          <button
            class="flex-1 rounded-xl border border-cocoa-300 py-2.5 text-sm font-semibold text-cocoa-700 hover:bg-cocoa-200 dark:border-cocoa-700 dark:text-cocoa-200 dark:hover:bg-cocoa-800"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cocoa-600 py-2.5 text-sm font-bold text-white shadow hover:bg-cocoa-500"
            @click="print"
          >
            <i class="fa-solid fa-print"></i>
            Print
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>