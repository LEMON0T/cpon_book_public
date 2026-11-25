import { useState } from 'react'
import { Star, Camera, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmtDate } from '../lib/utils'

const Stars = ({ value, onChange, size = 18 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)}>
        <Star size={size} className={n <= value ? 'text-gold' : 'text-paper/30'} fill={n <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
)

function ReviewForm({ r, onDone }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (!rating) return alert('Adj legalább egy csillagot!')
    setBusy(true)
    const urls = []
    for (const f of files) {
      const path = `${r.id}/${Date.now()}-${f.name.replace(/[^\w.]/g, '_')}`
      const { error } = await supabase.storage.from('memories').upload(path, f)
      if (!error) urls.push(supabase.storage.from('memories').getPublicUrl(path).data.publicUrl)
    }
    await supabase.from('redemptions').update({ rating, review: text, photos: urls, reviewed_at: new Date().toISOString() }).eq('id', r.id)
    onDone()
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-bg/40 p-3">
      <Stars value={rating} onChange={setRating} size={28} />
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Milyen volt?" className="w-full rounded-xl bg-white/90 p-3 text-ink" />
      <label className="flex items-center gap-2 text-sm text-paper/80">
        <Camera size={18} /> {files.length ? `${files.length} fotó kiválasztva` : 'Fotók hozzáadása (max. 2)'}
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles([...e.target.files].slice(0, 2))} />
      </label>
      <button disabled={busy} onClick={save} className="w-full rounded-full bg-berry py-2 font-bold disabled:opacity-50">{busy ? 'Mentés…' : 'Mentés'}</button>
    </div>
  )
}

export default function MemoryWall({ reds, onChange }) {
  const [open, setOpen] = useState(null)
  const removeReview = async (r) => {
    if (!confirm('Biztosan törlöd az értékelést és a fotókat?')) return
    const paths = (r.photos || []).map((u) => decodeURIComponent(u.split('/memories/')[1] || '')).filter(Boolean)
    if (paths.length) await supabase.storage.from('memories').remove(paths)
    await supabase.from('redemptions').update({ rating: null, review: null, photos: [], reviewed_at: null }).eq('id', r.id)
    onChange()
  }
  const done = reds.filter((r) => r.status === 'completed').sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))

  if (!done.length) return <p className="mt-16 text-center text-paper/60">Még nincs teljesített program. Az első közös emlék ide kerül.</p>

  return (
    <div className="space-y-6">
      {done.map((r) => (
        <article key={r.id} className="rounded-2xl border border-paper/15 bg-paper/5 p-4">
          <p className="text-xs text-paper/60">{fmtDate(r.completed_at)}</p>
          <h3 className="font-display text-xl font-bold">{r.ticket?.title}</h3>
          {r.note && <p className="mt-1 text-sm italic text-paper/70">„{r.note}”</p>}
          {r.rating ? (
            <div className="mt-3 space-y-3">
              <Stars value={r.rating} />
              {r.review && <p className="text-sm">{r.review}</p>}
              {r.photos?.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {r.photos.map((u, i) => (
                    <img key={u} src={u} alt="" loading="lazy" className={`aspect-square w-full bg-white object-cover p-2 pb-8 shadow-lg ${i % 2 ? 'rotate-2' : '-rotate-2'}`} />
                  ))}
                </div>
              )}
              <button onClick={() => removeReview(r)} className="flex items-center gap-1 text-xs text-paper/50"><Trash2 size={14} />Értékelés törlése</button>
            </div>
          ) : open === r.id ? (
            <ReviewForm r={r} onDone={() => { setOpen(null); onChange() }} />
          ) : (
            <button onClick={() => setOpen(r.id)} className="mt-3 rounded-full bg-berry px-5 py-2 text-sm font-bold">Értékelem</button>
          )}
        </article>
      ))}
    </div>
  )
}
