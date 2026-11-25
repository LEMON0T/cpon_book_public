import { RARITY } from './rarity'

export async function notifyDiscord(webhookUrl, ticket, { desired_date, note, rarity = 'common' }) {
  if (!webhookUrl) return
  const R = RARITY[rarity] || RARITY.common
  const fields = [{ name: 'Kívánt dátum', value: desired_date || 'nincs megadva' }, { name: 'Megjegyzés', value: note || 'nincs' }]
  if (R.bonus) fields.push({ name: `🎁 ${R.name} bónusz`, value: R.bonus })
  try {
    await fetch(webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{
        title: `🎟️ Beváltott kupon: ${ticket.title}`, color: parseInt(R.glow.slice(1), 16),
        fields, timestamp: new Date().toISOString()
      }] })
    })
  } catch (e) { console.error('Discord hiba', e) }
}