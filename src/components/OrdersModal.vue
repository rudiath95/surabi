<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllStruks, deleteStruk } from '../utils/db'
import { formatPrice } from '../utils/format'
import SalesReportModal from './SalesReportModal.vue'

const emit = defineEmits(['close', 'edit', 'print'])

const paymentLabels = {
  tunai: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
}

const struks = ref([])
const loading = ref(true)
const error = ref('')
const tab = ref('active')
const showReport = ref(false)

const activeStruks = computed(() => struks.value.filter((s) => s.status === 'active'))
const doneStruks = computed(() => struks.value.filter((s) => s.status !== 'active'))

function formatDate(ts) {
  return new Date(ts).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    struks.value = await getAllStruks()
  } catch {
    error.value = 'Gagal memuat pesanan'
  } finally {
    loading.value = false
  }
}

async function remove(s) {
  if (!confirm(`Hapus pesanan ${s.orderNo}?`)) return
  try {
    await deleteStruk(s.id)
    await load()
  } catch {
    alert('Gagal menghapus pesanan')
  }
}

onMounted(load)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-cocoa-100 shadow-2xl dark:bg-cocoa-950"
      >
        <header class="flex items-center justify-between px-4 py-3">
          <h3 class="text-sm font-bold text-cocoa-900 dark:text-cocoa-100">
            <i class="fa-solid fa-bell-concierge mr-2 text-cocoa-600"></i>Pesanan
          </h3>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full text-cocoa-500 hover:bg-cocoa-200 dark:hover:bg-cocoa-800"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="flex gap-2 px-4 pb-3">
          <button
            class="flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition"
            :class="
              tab === 'active'
                ? 'border-cocoa-600 bg-cocoa-600 text-white shadow'
                : 'border-cocoa-300 bg-white text-cocoa-700 hover:bg-cocoa-100 dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-200 dark:hover:bg-cocoa-800'
            "
            @click="tab = 'active'"
          >
            Aktif
            <span
              class="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              :class="tab === 'active' ? 'bg-white/20' : 'bg-cocoa-600 text-white'"
            >
              {{ activeStruks.length }}
            </span>
          </button>
          <button
            class="flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition"
            :class="
              tab === 'done'
                ? 'border-cocoa-600 bg-cocoa-600 text-white shadow'
                : 'border-cocoa-300 bg-white text-cocoa-700 hover:bg-cocoa-100 dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-200 dark:hover:bg-cocoa-800'
            "
            @click="tab = 'done'"
          >
            Selesai
            <span
              class="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              :class="tab === 'done' ? 'bg-white/20' : 'bg-cocoa-600 text-white'"
            >
              {{ doneStruks.length }}
            </span>
          </button>
        </div>

        <div v-if="tab === 'done'" class="flex items-center justify-between gap-2 px-4 pb-3">
          <p class="text-xs text-cocoa-500 dark:text-cocoa-400">
            Cetak ulang struk atau ekspor laporan bulanan.
          </p>
          <button
            class="flex items-center gap-2 rounded-xl bg-cocoa-600 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-cocoa-500"
            @click="showReport = true"
          >
            <i class="fa-solid fa-file-invoice"></i>
            Export PDF
          </button>
        </div>

        <div class="overflow-y-auto px-4 pb-4">
          <div v-if="loading" class="flex flex-col items-center gap-3 py-16 text-cocoa-500">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
            <p class="text-sm">Memuat pesanan...</p>
          </div>

          <div
            v-else-if="error"
            class="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-12 text-red-600 dark:border-red-900 dark:bg-red-950/40"
          >
            <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
            <p class="text-sm font-semibold">{{ error }}</p>
            <button
              class="rounded-lg bg-cocoa-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cocoa-500"
              @click="load"
            >
              Coba lagi
            </button>
          </div>

          <div
            v-else-if="(tab === 'active' ? activeStruks : doneStruks).length === 0"
            class="flex flex-col items-center gap-2 py-16 text-center text-cocoa-400 dark:text-cocoa-500"
          >
            <i class="fa-solid fa-receipt text-4xl"></i>
            <p class="text-sm">
              {{ tab === 'active' ? 'Tidak ada pesanan aktif.' : 'Belum ada pesanan selesai.' }}
            </p>
            <p class="text-xs">
              {{
                tab === 'active'
                  ? 'Simpan pesanan dari keranjang untuk memulai.'
                  : 'Pesanan menjadi selesai setelah struk dicetak.'
              }}
            </p>
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="s in tab === 'active' ? activeStruks : doneStruks"
              :key="s.id"
              class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-cocoa-900"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cocoa-100 text-cocoa-600 dark:bg-cocoa-800 dark:text-cocoa-300"
              >
                <i class="fa-solid fa-receipt"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-bold text-cocoa-900 dark:text-cocoa-100">{{ s.orderNo }}</p>
                  <span
                    class="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cocoa-600 dark:bg-cocoa-800 dark:text-cocoa-300"
                  >
                    {{ paymentLabels[s.paymentMethod] || s.paymentMethod }}
                  </span>
                </div>
                <p class="truncate text-xs text-cocoa-500 dark:text-cocoa-400">
                  {{ formatDate(s.date) }}
                  <template v-if="s.customer"> • {{ s.customer }}</template>
                  <template v-if="s.note"> • {{ s.note }}</template>
                </p>
                <p class="text-sm font-bold text-cocoa-700 dark:text-cocoa-200">
                  {{ s.items.length }} item • {{ formatPrice(s.subtotal) }}
                </p>
              </div>
              <div class="flex shrink-0 flex-col gap-1.5">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-cocoa-600 text-white shadow hover:bg-cocoa-500"
                  :title="tab === 'active' ? 'Tambah item / cetak' : 'Cetak ulang'"
                  @click="emit('print', s)"
                >
                  <i class="fa-solid fa-print text-xs"></i>
                </button>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-cocoa-100 text-cocoa-700 hover:bg-cocoa-200 dark:bg-cocoa-800 dark:text-cocoa-200 dark:hover:bg-cocoa-700"
                  title="Edit pesanan"
                  @click="emit('edit', s)"
                >
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-950"
                  title="Hapus"
                  @click="remove(s)"
                >
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>

  <SalesReportModal v-if="showReport" @close="showReport = false" />
</template>