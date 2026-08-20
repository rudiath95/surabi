export function formatPrice(v) {
  return "Rp " + Number(v).toLocaleString("id-ID")
}

export function formatDate(d) {
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(d) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export const BUSINESS_DAY_CUTOFF_HOUR = 4

export function businessDate(ts) {
  const d = new Date(ts)
  if (d.getHours() < BUSINESS_DAY_CUTOFF_HOUR) return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}