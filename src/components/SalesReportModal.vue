<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllStruks } from '../utils/db'
import { formatPrice, businessDate } from '../utils/format'
import SalesReportContent from './SalesReportContent.vue'

const emit = defineEmits(['close'])

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const paymentLabels = {
  tunai: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
}

const struks = ref([])
const loading = ref(true)
const now = new Date()
const month = ref(now.getMonth())
const year = ref(now.getFullYear())

const years = computed(() => {
  const set = new Set([now.getFullYear()])
  for (const s of struks.value) set.add(businessDate(s.date).getFullYear())
  return [...set].sort((a, b) => b - a)
})

const doneStruks = computed(() => struks.value.filter((s) => s.status !== 'active'))

const filtered = computed(() =>
  doneStruks.value.filter((s) => {
    const d = businessDate(s.date)
    return d.getMonth() === month.value && d.getFullYear() === year.value
  })
)

const data = computed(() => {
  const orders = filtered.value
  const totalRevenue = orders.reduce((sum, s) => sum + (Number(s.subtotal) || 0), 0)
  const totalItems = orders.reduce(
    (sum, s) => sum + (s.items || []).reduce((a, i) => a + (i.qty || 0), 0),
    0
  )
  const paymentMap = {}
  for (const s of orders) {
    const key = s.paymentMethod || 'tunai'
    if (!paymentMap[key]) paymentMap[key] = { label: paymentLabels[key] || key, count: 0, total: 0 }
    paymentMap[key].count++
    paymentMap[key].total += Number(s.subtotal) || 0
  }
  const itemMap = {}
  for (const s of orders) {
    for (const i of s.items || []) {
      if (!itemMap[i.name]) itemMap[i.name] = { name: i.name, qty: 0, revenue: 0 }
      itemMap[i.name].qty += i.qty || 0
      itemMap[i.name].revenue += (i.qty || 0) * (i.price || 0)
    }
  }
  return {
    periodLabel: `${months[month.value]} ${year.value}`,
    totalOrders: orders.length,
    totalItems,
    totalRevenue,
    avgPerOrder: orders.length ? totalRevenue / orders.length : 0,
    paymentRows: Object.values(paymentMap),
    itemRows: Object.values(itemMap).sort((a, b) => b.qty - a.qty),
    printedAt: new Date().toLocaleString('id-ID'),
  }
})

async function load() {
  loading.value = true
  try {
    struks.value = await getAllStruks()
  } catch {
    struks.value = []
  } finally {
    loading.value = false
  }
}

function printPdf() {
  window.print()
}

onMounted(load)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-cocoa-100 shadow-2xl dark:bg-cocoa-950"
      >
        <header class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <h3 class="text-sm font-bold text-cocoa-900 dark:text-cocoa-100">
            <i class="fa-solid fa-file-invoice mr-2 text-cocoa-600"></i>Laporan Penjualan
          </h3>
          <div class="flex items-center gap-2">
            <select
              v-model="month"
              class="rounded-lg border border-cocoa-300 bg-white px-2 py-1.5 text-sm text-cocoa-900 focus:border-cocoa-600 focus:outline-none dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-100"
            >
              <option v-for="(m, i) in months" :key="m" :value="i">{{ m }}</option>
            </select>
            <select
              v-model="year"
              class="rounded-lg border border-cocoa-300 bg-white px-2 py-1.5 text-sm text-cocoa-900 focus:border-cocoa-600 focus:outline-none dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-100"
            >
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full text-cocoa-500 hover:bg-cocoa-200 dark:hover:bg-cocoa-800"
              @click="emit('close')"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        <div class="overflow-y-auto px-4 pb-4">
          <div v-if="loading" class="flex flex-col items-center gap-3 py-16 text-cocoa-500">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
            <p class="text-sm">Memuat laporan...</p>
          </div>

          <div v-else-if="!filtered.length" class="py-16 text-center text-cocoa-400 dark:text-cocoa-500">
            <i class="fa-solid fa-chart-pie mb-2 text-4xl"></i>
            <p class="text-sm">Tidak ada transaksi pada {{ data.periodLabel }}.</p>
          </div>

          <div v-else class="rounded-2xl bg-white p-6 shadow-sm dark:bg-cocoa-900">
            <SalesReportContent :data="data" />
          </div>
        </div>

        <footer class="flex gap-2 px-4 py-3">
          <button
            class="flex-1 rounded-xl border border-cocoa-300 py-2.5 text-sm font-semibold text-cocoa-700 hover:bg-cocoa-200 dark:border-cocoa-700 dark:text-cocoa-200 dark:hover:bg-cocoa-800"
            @click="emit('close')"
          >
            Tutup
          </button>
          <button
            :disabled="loading || !filtered.length"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cocoa-600 py-2.5 text-sm font-bold text-white shadow hover:bg-cocoa-500 disabled:cursor-not-allowed disabled:opacity-40"
            @click="printPdf"
          >
            <i class="fa-solid fa-file-pdf"></i>
            Export PDF
          </button>
        </footer>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div class="print-report">
      <SalesReportContent :data="data" />
    </div>
  </Teleport>
</template>