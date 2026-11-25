import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { notifyDiscord } from '../lib/discord'
import { rollRarity } from '../lib/rarity'
import CardReveal from './CardReveal'

export default function RedeemModal({ ticket, onClose, onDone }) {
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [rarity, setRarity] = useState(null)

  const submit = async () => {
    setBusy(true)
    const rolled = rollRarity()
    const { error } = await supabase.from('redemptions').insert({ ticket_id: ticket.id, desired_date: date || null, note, rarity: rolled })
    if (error) { alert(error.message); setBusy(false); return }
    if (rolled === 'common') {
      const patch = {}
      if (ticket.type === 'limited' || ticket.type === 'vip') patch.remaining = ticket.remaining - 1
      if (ticket.type === 'cooldown') patch.last_redeemed_at = new Date().toISOString()
      if (Object.keys(patch).length) await supabase.from('tickets').update(patch).eq('id', ticket.id)
    }
    notifyDiscord(ticket, { desired_date: date, note, rarity: rolled })
    setRarity(rolled)
  }

  if (rarity) return <CardReveal ticket={ticket} rarity={rarity} onClose={onDone} />

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full space-y-4 rounded-t-3xl bg-paper p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] text-ink">
        <h2 className="font-display text-2xl font-bold">{ticket.title}</h2>
        <label className="block text-sm font-semibold">Mikorra szeretnéd?
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-ink/20 bg-white/60 p-3" />
        </label>
        <label className="block text-sm font-semibold">Megjegyzés
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pl. péntek este, olasz kaja legyen" className="mt-1 w-full rounded-xl border border-ink/20 bg-white/60 p-3" />
        </label>
        <button disabled={busy} onClick={submit} className="w-full rounded-full bg-berry py-3 font-bold text-paper active:scale-95 disabled:opacity-50">{busy ? 'Küldés…' : 'Beváltom a kupont'}</button>
        <button onClick={onClose} className="w-full text-sm text-ink/60">Mégsem</button>
      </div>
    </div>
  )
}
