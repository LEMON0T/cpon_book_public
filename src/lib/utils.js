import { Heart, Utensils, Hand, Film, Coffee, Plane, Gift, Sparkles, Music, Wine } from 'lucide-react'
export const ICONS = { Heart, Utensils, Hand, Film, Coffee, Plane, Gift, Sparkles, Music, Wine }
export const TYPE_LABEL = { unlimited: 'Korlátlan', limited: 'Limitált', vip: 'Egyszeri VIP', cooldown: 'Újraaktiválódó' }
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }) : '')

export function getAvailability(t) {
  if (t.type === 'limited' || t.type === 'vip') return t.remaining > 0 ? { ok: true } : { ok: false, label: 'Felhasználva' }
  if (t.type === 'cooldown' && t.last_redeemed_at) {
    const next = new Date(t.last_redeemed_at).getTime() + (t.cooldown_days || 0) * 864e5
    if (Date.now() < next) return { ok: false, label: `Még ${Math.ceil((next - Date.now()) / 864e5)} napig pihen` }
  }
  return { ok: true }
}
