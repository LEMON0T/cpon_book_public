import { useState } from 'react'
import { Check, Copy, Link2, Lock, Palette, QrCode, Sparkles, Trash2, Undo2, UserX, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ICONS, TYPE_LABEL } from '../lib/utils'
import { RARITY } from '../lib/rarity'
import { PACKS } from '../lib/templates'
import { THEMES } from '../lib/levels'

const empty = { title: '', description: '', category: '', type: 'unlimited', count: 3, cooldown: 30, icon: 'Heart' }
const input = 'w-full rounded-xl bg-white/90 p-3 text-ink'

export default function AdminPanel({ book, onBookChange, tickets, reds, wishes = [], progress, onChange }) {
  const [f, setF] = useState(empty)
  const [webhook, setWebhook] = useState(book.discord_webhook || '')
  const [notifyEmail, setNotifyEmail] = useState(book.notify_email || '')
  const [copied, setCopied] = useState('')
  const [showQr, setShowQr] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addingPack, setAddingPack] = useState(false)
  const [wishTypes, setWishTypes] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const pending = reds.filter((r) => r.status === 'pending')

  const inviteUrl = `${window.location.origin}/?invite=${encodeURIComponent(book.invite_code)}`

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 1500)
  }

  const selectTheme = async (themeId) => {
    const { data, error } = await supabase
      .from('books')
      .update({ theme: themeId })
      .eq('id', book.id)
      .select()
      .single()
    if (error) return alert(error.message)
    onBookChange(data)
  }

  const approveWish = async (w) => {
    const mode = wishTypes[w.id] || 'vip'
    const payload = {
      book_id: book.id,
      title: w.title,
      description: w.note || '',
      category: 'Kívánság',
      icon: 'Sparkles',
      type: mode === 'limited2' ? 'limited' : mode,
      total_count: mode === 'vip' ? 1 : mode === 'limited2' ? 2 : null,
      remaining: mode === 'vip' ? 1 : mode === 'limited2' ? 2 : null,
      cooldown_days: mode === 'cooldown' ? 7 : null
    }
    const { error: tErr } = await supabase.from('tickets').insert(payload)
    if (tErr) return alert(tErr.message)
    await supabase.from('wishes').update({ status: 'approved' }).eq('id', w.id)
    onChange()
  }

  const rejectWish = async (id) => {
    await supabase.from('wishes').update({ status: 'rejected' }).eq('id', id)
    onChange()
  }

  const saveNotifications = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('books')
      .update({
        discord_webhook: webhook.trim() || null,
        notify_email: notifyEmail.trim() || null
      })
      .eq('id', book.id)
      .select()
      .single()
    if (error) return alert(error.message)
    onBookChange(data)
    alert('Értesítési beállítások mentve!')
  }

  const addPack = async (pack) => {
    if (!confirm(`Hozzáadod a „${pack.name}” (${pack.tickets.length} kupon) sablonjait a füzethez?`)) return
    setAddingPack(true)
    const { error } = await supabase.from('tickets').insert(pack.tickets.map((t) => ({ ...t, book_id: book.id })))
    setAddingPack(false)
    if (error) return alert(error.message)
    onChange()
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

  const currentLevel = progress?.current?.level || 1
  const activeTheme = book.theme || 'midnight'

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-2xl bg-paper/10 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-paper/60">Meghívókód a párodnak</p>
            <p className="font-mono text-xl font-bold tracking-wider text-gold">{book.invite_code}</p>
          </div>
          <div className="flex gap-1.5">
            <button type="button" onClick={() => copyText(book.invite_code, 'code')} className="flex items-center gap-1 rounded-full bg-paper/15 px-3 py-2 text-xs font-bold">
              <Copy size={13} /> {copied === 'code' ? 'Másolva!' : 'Kód'}
            </button>
            <button type="button" onClick={() => copyText(inviteUrl, 'link')} className="flex items-center gap-1 rounded-full bg-paper/15 px-3 py-2 text-xs font-bold">
              <Link2 size={13} /> {copied === 'link' ? 'Link kész!' : 'Link'}
            </button>
            <button type="button" onClick={() => setShowQr(!showQr)} aria-label="QR-kód" className={`grid place-items-center rounded-full p-2 ${showQr ? 'bg-gold text-ink' : 'bg-paper/15'}`}>
              <QrCode size={15} />
            </button>
          </div>
        </div>

        {showQr && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-ink">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`}
              alt="Meghívó QR-kód"
              className="h-44 w-44"
            />
            <p className="text-center text-xs text-ink/70">Olvasd be a párod telefonjával a csatlakozáshoz</p>
          </div>
        )}

        <form onSubmit={saveNotifications} className="space-y-2 border-t border-paper/10 pt-3">
          <p className="text-xs font-semibold text-paper/70">Értesítés beváltáskor (opcionális)</p>
          <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="Értesítési e-mail-cím (pl. te@gmail.com)" className="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-ink" />
          <div className="flex gap-2">
            <input value={webhook} onChange={(e) => setWebhook(e.target.value)} placeholder="Discord Webhook URL" className="w-full rounded-xl bg-white/90 px-3 py-2 text-xs text-ink" />
            <button className="shrink-0 rounded-xl bg-berry px-4 py-2 text-xs font-bold">Mentés</button>
          </div>
        </form>
      </section>

      {/* Szintjutalmak: feloldható színsémák */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Palette size={18} className="text-gold" />Füzet témája</h2>
          <span className="text-xs text-paper/60">{currentLevel}. szint</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(THEMES).map((t) => {
            const unlocked = currentLevel >= t.minLevel
            const selected = activeTheme === t.id
            return (
              <button
                key={t.id}
                type="button"
                disabled={!unlocked}
                onClick={() => selectTheme(t.id)}
                className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition ${
                  selected ? 'border-gold bg-paper/15 font-bold' : unlocked ? 'border-paper/10 bg-paper/5' : 'border-paper/5 bg-paper/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 rounded-full border border-white/30" style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.berry} 50%)` }} />
                  <span>{t.name}</span>
                </div>
                {!unlocked && <span className="flex items-center gap-0.5 text-[10px] text-gold"><Lock size={11} /> {t.minLevel}. sz.</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* Beérkező kívánságok a partnertől */}
      {wishes.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Sparkles size={18} className="text-gold" />Beérkező kívánságok ({wishes.length})</h2>
          {wishes.map((w) => (
            <div key={w.id} className="space-y-2.5 rounded-xl border border-gold/40 bg-gold/10 p-3.5 text-sm">
              <div>
                <p className="font-bold">{w.title}</p>
                {w.note && <p className="text-xs text-paper/75">{w.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={wishTypes[w.id] || 'vip'}
                  onChange={(e) => setWishTypes({ ...wishTypes, [w.id]: e.target.value })}
                  className="rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-ink"
                >
                  <option value="vip">Egyszeri (VIP)</option>
                  <option value="limited2">2 alkalmas</option>
                  <option value="unlimited">Korlátlan</option>
                  <option value="cooldown">Heti cooldown</option>
                </select>
                <button
                  type="button"
                  onClick={() => approveWish(w)}
                  className="flex items-center gap-1 rounded-full bg-berry px-3 py-1.5 text-xs font-bold text-paper"
                >
                  <Check size={14} /> Jóváhagyás
                </button>
                <button
                  type="button"
                  onClick={() => rejectWish(w.id)}
                  aria-label="Elutasítás"
                  className="ml-auto rounded-full bg-paper/10 p-1.5 text-paper/60"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Függő beváltások</h2>
        {!pending.length && <p className="text-sm text-paper/60">Nincs függő beváltás.</p>}
        {pending.map((r) => (
          <div key={r.id} className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-paper/10 p-3">
            <div className="text-sm"><p className="font-bold">{r.ticket?.title}</p><p className="text-paper/70">{r.desired_date || 'nincs dátum'}{r.note && ` · ${r.note}`}</p></div>
            <button onClick={() => complete(r.id)} className="flex shrink-0 items-center gap-1 rounded-full bg-berry px-3 py-2 text-sm font-bold"><Check size={16} />Teljesítve</button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Összes beváltás</h2>
        {!reds.length && <p className="text-sm text-paper/60">Még nincs beváltás.</p>}
        {reds.map((r) => (
          <div key={r.id} className="mb-2 rounded-xl bg-paper/10 p-3 text-sm">
            <p className="font-bold">{r.ticket?.title} <span className="font-normal text-paper/60">· {r.status === 'pending' ? 'függőben' : 'teljesítve'}</span>{r.rarity && r.rarity !== 'common' && <span className="font-normal text-gold"> · {RARITY[r.rarity]?.name} (nem fogyott el)</span>}</p>
            <p className="text-paper/70">{r.desired_date || 'nincs dátum'}{r.note && ` · ${r.note}`}</p>
            <div className="mt-2 flex gap-4 text-xs">
              <button onClick={() => undo(r, true)} className="flex items-center gap-1 text-gold"><Undo2 size={14} />Visszavonás</button>
              <button onClick={() => undo(r, false)} className="flex items-center gap-1 text-paper/60"><Trash2 size={14} />Törlés</button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2.5">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Sparkles size={18} className="text-gold" />Sablon csomagok</h2>
        <div className="grid gap-2">
          {PACKS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={addingPack}
              onClick={() => addPack(p)}
              className="flex items-center justify-between rounded-xl border border-paper/10 bg-paper/5 p-3 text-left text-xs active:scale-95 disabled:opacity-50"
            >
              <div>
                <p className="font-bold text-paper">{p.name}</p>
                <p className="text-paper/60">{p.desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-gold/20 px-2.5 py-1 font-bold text-gold">+ Beszúrás</span>
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={create} className="space-y-3">
        <h2 className="font-display text-xl font-bold">Új kupon</h2>
        <input required value={f.title} onChange={set('title')} placeholder="Cím" className={input} />
        <textarea rows={2} value={f.description} onChange={set('description')} placeholder="Leírás" className={input} />
        <input value={f.category} onChange={set('category')} placeholder="Kategória (pl. Randi)" className={input} />
        <select value={f.type} onChange={set('type')} className={input}>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        {f.type === 'limited' && <input type="number" min="1" value={f.count} onChange={set('count')} placeholder="Darabszám" className={input} />}
        {f.type === 'cooldown' && <input type="number" min="1" value={f.cooldown} onChange={set('cooldown')} placeholder="Cooldown (nap)" className={input} />}
        <div className="flex flex-wrap gap-2">
          {Object.entries(ICONS).map(([k, I]) => (
            <button type="button" key={k} onClick={() => setF({ ...f, icon: k })} className={`grid h-11 w-11 place-items-center rounded-full ${f.icon === k ? 'bg-berry' : 'bg-paper/10'}`}><I size={20} /></button>
          ))}
        </div>
        <button className="w-full rounded-full bg-berry py-3 font-bold active:scale-95">Kupon létrehozása</button>
      </form>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Kuponok</h2>
        {tickets.map((t) => (
          <div key={t.id} className="mb-2 flex items-center justify-between rounded-xl bg-paper/10 p-3 text-sm">
            <span>{t.title} <span className="text-paper/60">({TYPE_LABEL[t.type]})</span></span>
            <button onClick={() => remove(t)} className="text-paper/60"><Trash2 size={18} /></button>
          </div>
        ))}
      </section>

      <section className="border-t border-paper/15 pt-6">
        <button
          type="button"
          disabled={deleting}
          onClick={deleteAccount}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/40 py-2.5 text-xs font-bold text-red-400 active:scale-95 disabled:opacity-50"
        >
          <UserX size={15} /> {deleting ? 'Fiók törlése...' : 'Fiók és füzet végleges törlése'}
        </button>
      </section>
    </div>
  )
}