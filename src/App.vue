<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ProductCard from './components/ProductCard.vue'
import CartPanel from './components/CartPanel.vue'
import ReceiptModal from './components/ReceiptModal.vue'
import OrdersModal from './components/OrdersModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import { formatPrice } from './utils/format'
import { saveStruk } from './utils/db'

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSCH8bzs4rFqlESBqNxebpHldEMXWQwebd5-_99BtgAW66CEKk2lx8wQP_BVHdZndY_bE5mnSDzE-gZ/pub?output=csv'

const products = ref([])
const loading = ref(true)
const error = ref('')
const activeType = ref('Semua')
const search = ref('')
const cart = ref([])
const showReceipt = ref(false)
const showHistory = ref(false)
const isDark = ref(false)
const paymentMethod = ref('tunai')
const note = ref('')
const customer = ref('')
const editingOrderNo = ref('')
const editingStrukId = ref(null)
const cartVisible = ref(false)
const showSettings = ref(false)
const paperWidth = ref(localStorage.getItem('surabi-paper-width') || '58')
let cartObserver = null

const types = computed(() => {
  const set = new Set(products.value.map((p) => p.type).filter(Boolean))
  return ['Semua', ...set]
})

const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()
  return products.value.filter((p) => {
    if (activeType.value !== 'Semua' && p.type !== activeType.value) return false
    if (q && !(p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))) return false
    return true
  })
})

const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => cart.value.reduce((s, i) => s + i.qty * i.price, 0))

function parseCSV(text) {
  const rows = []
  let row = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"'
          i++
        } else inQ = false
      } else cur += c
    } else if (c === '"') inQ = true
    else if (c === ',') {
      row.push(cur)
      cur = ''
    } else if (c === '\n') {
      row.push(cur)
      rows.push(row)
      row = []
      cur = ''
    } else if (c !== '\r') cur += c
  }
  row.push(cur)
  rows.push(row)
  return rows
}

async function loadMenu() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(SHEET_URL)
    if (!res.ok) throw new Error('Gagal memuat menu')
    const rows = parseCSV(await res.text())
    const [, ...data] = rows
    products.value = data
      .filter((r) => r[0] && r[1])
      .map((r) => ({
        id: r[0].trim(),
        name: r[1].trim(),
        type: r[2] ? r[2].trim() : '',
        price: Number(r[3]) || 0,
        img: r[4] ? r[4].trim() : '',
      }))
  } catch (e) {
    error.value = e.message || 'Terjadi kesalahan'
  } finally {
    loading.value = false
  }
}

function addToCart(p) {
  const found = cart.value.find((i) => i.id === p.id)
  if (found) found.qty++
  else cart.value.push({ ...p, qty: 1 })
}

function increment(id) {
  const item = cart.value.find((i) => i.id === id)
  if (item) item.qty++
}

function decrement(id) {
  const item = cart.value.find((i) => i.id === id)
  if (!item) return
  if (item.qty > 1) item.qty--
  else cart.value = cart.value.filter((i) => i.id !== id)
}

function removeItem(id) {
  cart.value = cart.value.filter((i) => i.id !== id)
}

function clearCart() {
  resetOrderState()
}

function resetOrderState() {
  cart.value = []
  customer.value = ''
  note.value = ''
  paymentMethod.value = 'tunai'
  editingOrderNo.value = ''
  editingStrukId.value = null
}

function buildStruk(status) {
  return {
    orderNo: editingOrderNo.value || 'ORD-' + Date.now().toString().slice(-6),
    date: Date.now(),
    items: cart.value.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, img: i.img })),
    subtotal: subtotal.value,
    paymentMethod: paymentMethod.value,
    note: note.value,
    customer: customer.value,
    status,
    ...(editingStrukId.value ? { id: editingStrukId.value } : {}),
  }
}

function saveOrder() {
  if (!cart.value.length) return
  const struk = buildStruk('active')
  saveStruk(struk)
    .then((id) => {
      editingStrukId.value = editingStrukId.value || id
      editingOrderNo.value = struk.orderNo
    })
    .catch((e) => console.error('Gagal menyimpan pesanan', e))
}

function checkout() {
  if (!cart.value.length) return
  showReceipt.value = true
}

function onPrinted(payload) {
  const struk = { ...payload, status: 'done' }
  if (editingStrukId.value) struk.id = editingStrukId.value
  saveStruk(struk).catch((e) => console.error('Gagal menyimpan struk', e))
  resetOrderState()
  showReceipt.value = false
}

function loadStrukToCart(s) {
  cart.value = s.items.map((i) => ({ ...i }))
  customer.value = s.customer || ''
  note.value = s.note || ''
  paymentMethod.value = s.paymentMethod || 'tunai'
  editingOrderNo.value = s.orderNo
  editingStrukId.value = s.id
}

function editStruk(s) {
  loadStrukToCart(s)
  showHistory.value = false
}

function printStruk(s) {
  loadStrukToCart(s)
  showHistory.value = false
  showReceipt.value = true
}

function cancelEdit() {
  editingOrderNo.value = ''
  editingStrukId.value = null
}

function setPaperWidth(v) {
  paperWidth.value = v
  localStorage.setItem('surabi-paper-width', v)
}

function scrollToCart() {
  document.getElementById('cart-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function setupCartObserver() {
  const el = document.getElementById('cart-area')
  if (!el) return
  cartObserver = new IntersectionObserver(
    (entries) => {
      cartVisible.value = entries[0].isIntersecting
    },
    { threshold: 0.15 }
  )
  cartObserver.observe(el)
}

function setTheme(dark) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('surabi-theme', dark ? 'dark' : 'light')
}

onMounted(() => {
  setTheme(localStorage.getItem('surabi-theme') === 'dark')
  loadMenu()
  nextTick(setupCartObserver)
})

onBeforeUnmount(() => {
  cartObserver?.disconnect()
})
</script>

<template>
  <div
    class="min-h-screen bg-cream-50 text-cocoa-900 transition-colors dark:bg-cocoa-950 dark:text-cocoa-100"
  >
    <header
      class="sticky top-0 z-40 border-b border-cocoa-200 bg-cocoa-700 shadow-md dark:border-cocoa-800 dark:bg-cocoa-950/90"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-cocoa-500 text-lg text-white shadow-inner"
          >
            <i class="fa-solid fa-mug-saucer"></i>
          </span>
          <div>
            <h1 class="text-lg font-extrabold leading-tight text-cream-50">SURABI</h1>
            <p class="text-[11px] text-cocoa-200">Sistem Kasir &amp; Struk</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="flex h-10 items-center gap-2 rounded-full bg-cocoa-800/60 px-4 text-sm font-semibold text-cocoa-100 transition hover:bg-cocoa-800"
            title="Riwayat struk"
            @click="showHistory = true"
          >
            <i class="fa-solid fa-bell-concierge"></i>
            <span class="hidden sm:inline">Pesanan</span>
          </button>
          <div
            class="hidden items-center gap-2 rounded-full bg-cocoa-800/60 px-3 py-1.5 text-sm font-semibold text-cream-50 sm:flex"
          >
            <i class="fa-solid fa-wallet text-cocoa-300"></i>
            {{ formatPrice(subtotal) }}
          </div>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full bg-cocoa-800/60 text-cocoa-100 transition hover:bg-cocoa-800"
            title="Pengaturan"
            @click="showSettings = true"
          >
            <i class="fa-solid fa-gear"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <section class="flex-1">
        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-24 text-cocoa-500">
          <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
          <p>Memuat menu...</p>
        </div>

        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-16 text-red-600 dark:border-red-900 dark:bg-red-950/40"
        >
          <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
          <p class="font-semibold">{{ error }}</p>
          <button
            class="rounded-lg bg-cocoa-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cocoa-500"
            @click="loadMenu"
          >
            Coba lagi
          </button>
        </div>

        <template v-else>
          <div class="relative mb-4">
            <i
              class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cocoa-400"
            ></i>
            <input
              v-model="search"
              type="search"
              placeholder="Cari produk..."
              class="w-full rounded-xl border border-cocoa-300 bg-white py-2.5 pl-9 pr-9 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-cocoa-600 focus:outline-none focus:ring-2 focus:ring-cocoa-500/30 dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-100 dark:placeholder:text-cocoa-500"
            />
            <button
              v-if="search"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-600"
              @click="search = ''"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="mb-4 flex flex-wrap gap-2">
            <button
              v-for="t in types"
              :key="t"
              class="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
              :class="
                activeType === t
                  ? 'border-cocoa-600 bg-cocoa-600 text-white shadow'
                  : 'border-cocoa-300 bg-white text-cocoa-700 hover:bg-cocoa-100 dark:border-cocoa-700 dark:bg-cocoa-900 dark:text-cocoa-200 dark:hover:bg-cocoa-800'
              "
              @click="activeType = t"
            >
              {{ t }}
            </button>
          </div>

          <div
            v-if="filteredProducts.length"
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
          >
            <ProductCard
              v-for="p in filteredProducts"
              :key="p.id"
              :product="p"
              @add="addToCart"
            />
          </div>
          <p v-else class="py-16 text-center text-cocoa-500">Tidak ada menu pada kategori ini.</p>
        </template>
      </section>

      <div id="cart-area" class="w-full scroll-mt-24 lg:w-[360px] lg:shrink-0">
        <div class="lg:sticky lg:top-[76px] lg:h-[calc(100vh-100px)]">
          <CartPanel
            :items="cart"
            :subtotal="subtotal"
            :cart-count="cartCount"
            v-model:payment-method="paymentMethod"
            v-model:note="note"
            v-model:customer="customer"
            :is-editing="!!editingStrukId"
            :editing-order-no="editingOrderNo"
            @increment="increment"
            @decrement="decrement"
            @remove="removeItem"
            @clear="clearCart"
            @checkout="checkout"
            @save="saveOrder"
            @cancel-edit="cancelEdit"
          />
        </div>
      </div>
    </main>

    <ReceiptModal
      v-if="showReceipt"
      :items="cart"
      :subtotal="subtotal"
      :payment-method="paymentMethod"
      :note="note"
      :customer="customer"
      :order-no="editingOrderNo"
      :paper-width="paperWidth"
      @close="showReceipt = false"
      @printed="onPrinted"
    />

    <SettingsModal
      v-if="showSettings"
      :paper-width="paperWidth"
      :dark="isDark"
      @close="showSettings = false"
      @update:paper-width="setPaperWidth"
      @update:dark="setTheme"
    />

    <button
      v-if="cartCount && !cartVisible && !showReceipt"
      class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-cocoa-600 text-xl text-white shadow-lg transition hover:bg-cocoa-500 active:scale-95"
      title="Ke keranjang"
      @click="scrollToCart"
    >
      <i class="fa-solid fa-cart-shopping"></i>
      <span
        class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold"
      >
        {{ cartCount }}
      </span>
    </button>

    <OrdersModal
      v-if="showHistory"
      @close="showHistory = false"
      @edit="editStruk"
      @print="printStruk"
    />
  </div>
</template>