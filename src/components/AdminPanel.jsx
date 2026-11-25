import { useState } from 'react'
import { Check, Copy, Trash2, Undo2, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ICONS, TYPE_LABEL } from '../lib/utils'
import { RARITY } from '../lib/rarity'

const empty = { title: '', description: '', category: '', type: 'unlimited', count: 3, cooldown: 30, icon: 'Heart' }
const input = 'w-full rounded-xl bg-white/90 p-3 text-ink'

export default function AdminPanel({ book, onBookChange, tickets, reds, onChange }) {
  const [f, setF] = useState(empty)
  const [webhook, setWebhook] = useState(book.discord_webhook || '')
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const pending = reds.filter((r) => r.status === 'pending')

  const copyCode = () => {
    navigator.clipboard.writeText(book.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const saveWebhook = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('books')
      .update({ discord_webhook: webhook.trim() || null })
      .eq('id', book.id)
      .select()
      .single()
    if (error) return alert(error.message)
    onBookChange(data)
    alert('Beállítások mentve!')
  }

  const create = async (e) => {
    e.preventDefault()
    const n = f.type === 'limited' ? +f.count : f.type === 'vip' ? 1 : null
    const { error } = await supabase.from('tickets').insert({
      book_id: book.id,
      title: f.title, description: f.description, category: f.category || 'Általános', type: f.type, icon: f.icon,
      total_count: n, remaining: n, cooldown_days: f.type === 'cooldown' ? +f.cooldown : null
    })
    if (error) return alert(error.message)
    setF(empty); onChange()
  }

  const complete = async (id) => { await supabase.from('redemptions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id); onChange() }
  const undo = async (r, restore) => {
    const msg = restore ? 'Visszavonod a beváltást? A kupon újra felhasználható lesz.' : 'Véglegesen törlöd ezt a bejegyzést? A kupon felhasználva marad.'
    if (!confirm(msg)) return
    const paths = (r.photos || []).map((u) => decodeURIComponent(u.split('/memories/')[1] || '')).filter(Boolean)
    if (paths.length) await supabase.storage.from('memories').remove(paths)
    await supabase.from('redemptions').delete().eq('id', r.id)
    const t = tickets.find((x) => x.id === r.ticket_id)
    if (restore && t && (!r.rarity || r.rarity === 'common')) {
      const patch = {}
      if (t.type === 'limited' || t.type === 'vip') patch.remaining = Math.min(t.remaining + 1, t.total_count)
      if (t.type === 'cooldown') patch.last_redeemed_at = reds.find((x) => x.ticket_id === t.id && x.id !== r.id)?.redeemed_at || null
      if (Object.keys(patch).length) await supabase.from('tickets').update(patch).eq('id', t.id)
    }
    onChange()
  }
  const remove = async (t) => { if (confirm(`Törlöd: ${t.title}?`)) { await supabase.from('tickets').delete().eq('id', t.id); onChange() } }

  const deleteAccount = async () => {
    if (!confirm('Biztosan véglegesen törlöd a fiókodat, a kuponfüzetet, minden kupont és feltöltött fotót? Ez nem visszavonható!')) return
    setDeleting(true)
    try {
      const allPaths = reds.flatMap((r) => (r.photos || []).map((u) => decodeURIComponent(u.split('/memories/')[1] || '')).filter(Boolean))
      if (allPaths.length) await supabase.storage.from('memories').remove(allPaths)
      const { error } = await supabase.rpc('delete_own_account')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (err) {
      alert(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-2xl bg-paper/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-paper/60">Meghívókód a párodnak</p>
            <p className="font-mono text-xl font-bold tracking-wider text-gold">{book.invite_code}</p>
          </div>
          <button type="button" onClick={copyCode} className="flex items-center gap-1.5 rounded-full bg-paper/15 px-3 py-2 text-xs font-bold">
            <Copy size={14} /> {copied ? 'Másolva!' : 'Másolás'}
          </button>
        </div>
        <form onSubmit={saveWebhook} className="flex gap-2 pt-1">
          <input value={webhook} onChange={(e) => setWebhook(e.target.value)} placeholder="Opcionális Discord Webhook URL" className="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-ink" />
          <button className="shrink-0 rounded-xl bg-berry px-3 py-2 text-xs font-bold">Mentés</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Függő beváltások</h2>
        {!pending.length && <p className="text-sm text-paper/60">Nincs függő beváltás.</p>}
        {pending.map((r) => (
          <div key={r.id} className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-paper/10 p-3">
            <div className="text-sm"><p className="font-bold">{r.ticket?.title}</p><p className="text-paper/70">{r.desired_date ||