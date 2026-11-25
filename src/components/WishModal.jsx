import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { notifyOwner } from '../lib/notify'

export default function WishModal({ book, userId, onClose, onSent }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    const { error } = await supabase.from('wishes').insert({
      book_id: book.id,
      created_by: userId,
      title: title.trim(),
      note: note.trim() || null
    })
    if (error) {
      alert(error.message)
      setBusy(false)
      return
    }
    notifyOwner(book, { title: `✨ Új kívánság: ${title.trim()}` }, { desired_date: 'Kuponkérés', note })
    onSent()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full space-y-4 rounded-t-3xl bg-paper p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] text-ink"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="text-berry" size={22} />
          <h2 className="font-display text-2xl font-bold">Kívánok egy kupont</h2>
        </div>
        <p className="text-xs text-ink/70">Írd le az ötletedet, és ha a párod jóváhagyja, megjelenik a kuponjaid között!</p>

        <label className="block text-sm font-semibold">
          Mi legyen a kupon címe?
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="pl. Egy közös reggeli a kedvenc helyünkön"
            className="mt-1 w-full rounded-xl border border-ink/20 bg-white/70 p-3"
          />
        </label>

        <label className="block text-sm font-semibold">
          Részletek (opcionális)
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="pl. Hétvégén, palacsintával és kávéval"
            className="mt-1 w-full rounded-xl border border-ink/20 bg-white/70 p-3"
          />
        </label>

        <button disabled={busy} className="w-full rounded-full bg-berry py-3 font-bold text-paper active:scale-95 disabled:opacity-50">
          {busy ? 'Küldés…' : 'Kívánság elküldése'}
        </button>
        <button type="button" onClick={onClose} className="w-full text-sm text-ink/60">Mégsem</button>
      </form>
    </div>
  )
}