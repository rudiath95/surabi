<script setup>
import { computed } from 'vue'
import { formatPrice, formatTime } from '../utils/format'
import ReceiptContent from './ReceiptContent.vue'

const props = defineProps({
  items: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  note: { type: String, required: true },
  customer: { type: String, required: true },
  orderNo: { type: String, default: '' },
  paperWidth: { type: String, default: '58' },
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
const timeStr = computed(() => formatTime(now.value))

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildReceiptHtml() {
  const itemsHtml = props.items
    .map(
      (i) => `
      <div class="item">
        <div class="line">
          <span class="name">${escapeHtml(i.name)}</span>
          <span class="amount">${i.qty} x ${formatPrice(i.price)}</span>
        </div>
        <div class="line">
          <span class="name"></span>
          <span class="amount bold">${formatPrice(i.qty * i.price)}</span>
        </div>
      </div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Struk Pembayaran</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family:'Courier New', 'Lucida Console', monospace;
    font-size:12px;
    line-height:1.3;
    width:${props.paperWidth}mm;
    margin:0 auto;
    padding:2mm 1.5mm;
    background:#fff;
    color:#000;
  }
  .store-name { text-align:center; font-size:16px; font-weight:bold; letter-spacing:1px; border-bottom:1px dashed #000; padding-bottom:3px; margin-bottom:2px; }
  .store-sub { text-align:center; font-size:10px; color:#333; }
  .divider { border-top:1px dashed #000; margin:5px 0; }
  .row { display:flex; justify-content:space-between; }
  .meta { margin-bottom:3px; }
  .item { margin-bottom:4px; }
  .line { display:flex; justify-content:space-between; }
  .line .name { flex:1; padding-right:4px; word-break:break-word; }
  .line .amount { white-space:nowrap; }
  .bold { font-weight:bold; }
  .total { display:flex; justify-content:space-between; font-weight:bold; font-size:15px; border-top:1px dashed #000; padding-top:4px; margin-top:4px; }
  .footer { text-align:center; margin-top:6px; border-top:1px dashed #000; padding-top:4px; }
  @media print {
    @page { margin: 0; }
    body { margin:0; padding:0; }
  }
</style>
</head>
<body>
  <div class="store-name">${STORE.name}</div>
  <div class="store-sub">${STORE.address}</div>
  <div class="store-sub">${STORE.phone}</div>
  <div class="divider"></div>
  <div class="row meta"><span>No : ${orderNo.value}</span><span>${dateLine.value} ${timeStr.value}</span></div>
  ${props.customer ? `<div class="row meta"><span>Kepada</span><span>${escapeHtml(props.customer)}</span></div>` : ''}
  <div class="divider"></div>
  ${itemsHtml}
  <div class="divider"></div>
  <div class="row meta"><span>Bayar</span><span>${paymentLabels[props.paymentMethod] || props.paymentMethod}</span></div>
  <div class="row meta"><span>Catatan</span><span>${escapeHtml(props.note) || '-'}</span></div>
  <div class="divider"></div>
  <div class="total"><span>TOTAL</span><span>${formatPrice(props.subtotal)}</span></div>
  <div class="footer">Terima kasih!<br/>Selamat menikmati.</div>
  <script>window.onload=function(){window.print();setTimeout(function(){window.close();},600)};<\/script>
</body>
</html>`
}

function print() {
  const w = window.open('', '_blank', 'width=400,height=600,toolbar=no,menubar=no,scrollbars=yes')
  if (!w) {
    alert('Popup diblokir! Izinkan popup untuk situs ini agar struk bisa dicetak.')
    return
  }
  w.document.write(buildReceiptHtml())
  w.document.close()
  w.focus()
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
          <div class="mx-auto bg-white" :style="{ width: paperWidth + 'mm' }">
            <ReceiptContent
              :order-no="orderNo"
              :date-line="dateLine"
              :time-str="timeStr"
              :items="items"
              :subtotal="subtotal"
              :payment-method="paymentMethod"
              :note="note"
              :customer="customer"
            />
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