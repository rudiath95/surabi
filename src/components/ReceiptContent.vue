<script setup>
import { formatPrice } from '../utils/format'

defineProps({
  orderNo: { type: String, required: true },
  dateLine: { type: String, required: true },
  timeStr: { type: String, required: true },
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  note: { type: String, required: true },
  customer: { type: String, required: true },
})

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
</script>

<template>
  <div class="font-mono text-[12px] leading-snug text-black">
    <div class="text-center">
      <p class="text-lg font-bold tracking-widest">{{ STORE.name }}</p>
      <p>{{ STORE.address }}</p>
      <p>{{ STORE.phone }}</p>
    </div>

    <div class="my-1 border-t border-dashed border-black"></div>

    <div class="flex justify-between">
      <span>No : {{ orderNo }}</span>
      <span>{{ dateLine }} {{ timeStr }}</span>
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
</template>