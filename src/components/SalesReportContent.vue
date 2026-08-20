<script setup>
import { formatPrice } from '../utils/format'

defineProps({
  data: { type: Object, required: true },
})
</script>

<template>
  <div class="font-sans text-cocoa-950">
    <div class="text-center">
      <p class="text-2xl font-extrabold tracking-widest">SURABI</p>
      <p class="text-lg font-bold">Laporan Penjualan</p>
      <p>Periode: {{ data.periodLabel }}</p>
      <p class="text-xs">Periode operasional 15.00 - 04.00, pesanan setelah tengah malam dihitung sebagai hari sebelumnya</p>
    </div>

    <div class="my-3 border-t-2 border-cocoa-950"></div>

    <p class="mb-1 text-sm font-bold uppercase tracking-wide">Ringkasan</p>
    <table class="w-full border-collapse text-sm">
      <tbody>
        <tr>
          <td class="border border-cocoa-950 p-1.5 font-semibold">Total Pesanan</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ data.totalOrders }}</td>
        </tr>
        <tr>
          <td class="border border-cocoa-950 p-1.5 font-semibold">Total Item Terjual</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ data.totalItems }}</td>
        </tr>
        <tr>
          <td class="border border-cocoa-950 p-1.5 font-semibold">Total Pendapatan</td>
          <td class="border border-cocoa-950 p-1.5 text-right font-bold">{{ formatPrice(data.totalRevenue) }}</td>
        </tr>
        <tr>
          <td class="border border-cocoa-950 p-1.5 font-semibold">Rata-rata per Pesanan</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ formatPrice(data.avgPerOrder) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="my-3 border-t border-cocoa-950"></div>

    <p class="mb-1 text-sm font-bold uppercase tracking-wide">Metode Pembayaran</p>
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th class="border border-cocoa-950 p-1.5 text-left">Metode</th>
          <th class="border border-cocoa-950 p-1.5 text-right">Jumlah</th>
          <th class="border border-cocoa-950 p-1.5 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data.paymentRows" :key="row.label">
          <td class="border border-cocoa-950 p-1.5">{{ row.label }}</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ row.count }}</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ formatPrice(row.total) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="my-3 border-t border-cocoa-950"></div>

    <p class="mb-1 text-sm font-bold uppercase tracking-wide">Produk Terjual</p>
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th class="border border-cocoa-950 p-1.5 text-left">No</th>
          <th class="border border-cocoa-950 p-1.5 text-left">Produk</th>
          <th class="border border-cocoa-950 p-1.5 text-right">Qty</th>
          <th class="border border-cocoa-950 p-1.5 text-right">Pendapatan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in data.itemRows" :key="row.name">
          <td class="border border-cocoa-950 p-1.5">{{ i + 1 }}</td>
          <td class="border border-cocoa-950 p-1.5">{{ row.name }}</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ row.qty }}</td>
          <td class="border border-cocoa-950 p-1.5 text-right">{{ formatPrice(row.revenue) }}</td>
        </tr>
        <tr v-if="!data.itemRows.length">
          <td class="border border-cocoa-950 p-1.5" colspan="4">Tidak ada data</td>
        </tr>
      </tbody>
    </table>

    <div class="my-3 border-t border-cocoa-950"></div>

    <p class="text-right text-xs">Dicetak: {{ data.printedAt }}</p>
  </div>
</template>