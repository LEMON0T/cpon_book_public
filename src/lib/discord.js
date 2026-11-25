import { RARITY } from './rarity'

export async function notifyDiscord(ticket, { desired_date, note, rarity = 'common' }) {
  const url = import.meta.env.VITE_DISCORD_WEBHOOK_URL
  if (!url) return
  const R = RARITY[rarity] || RARITY.common
  const fields = [{ name: 'Kívánt dátum', value: desired_date || 'nincs megadva' }, { name: 'Megjegyzés', value: note || 'nincs' }]
  if (R.bonus) fields.push({ name: `🎁 ${R.name} bónusz`, value: R.bonus })
  try {
    await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{
        title: `🎟️ Beváltott kupon: ${ticket.title}`, color: parseInt(R.glow.slice(1), 16),
        fields, timestamp: new Date().toISOString()
      }] })
    })
  } catch (e) { console.error('Discord hiba', e) }
}
