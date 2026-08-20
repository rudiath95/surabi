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