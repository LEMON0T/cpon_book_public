import { notifyDiscord } from './discord'
import { RARITY } from './rarity'

export async function notifyOwner(book, ticket, red) {
  if (book.discord_webhook) {
    notifyDiscord(book.discord_webhook, ticket, red)
  }

  if (book.notify_email) {
    const rName = RARITY[red.rarity]?.name || 'Hétköznapi'
    fetch(`https://formsubmit.co/ajax/${encodeURIComponent(book.notify_email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `🎟️ Kupon beváltva: ${ticket.title}`,
        Füzet: book.title,
        Kupon: ticket.title,
        Ritkaság: rName,
        'Kívánt dátum': red.desired_date || 'Nincs megadva',
        Megjegyzés: red.note || '-'
      })
    }).catch(() => {})
  }
}
