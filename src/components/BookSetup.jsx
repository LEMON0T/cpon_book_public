import { useEffect, useState } from 'react'
import { Gift, KeyRound, LogOut, Sparkles, UserX } from 'lucide-react'
import { createBook, joinBook } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { PACKS } from '../lib/templates'

export default function BookSetup({ user, onDone }) {
  const [mode, setMode] = useState(null)
  const [val, setVal] = useState('')
  const [packId, setPackId] = useState('romantic')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('invite')
    if (code) {
      setMode('join')
      setVal(code.trim().toUpperCase())
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      if (mode === 'create') {
        const book = await createBook(user.id, val)
        const pack = PACKS.find((p) => p.id === packId)
        if (pack) {
          await supabase.from('tickets').insert(pack.tickets.map((t) => ({ ...t, book_id: book.id })))
        }
        onDone(book)
      } else {
        const book = await joinBook(user.id, val)
        onDone(book)
      }
    } catch (error) {
      setErr(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Biztosan véglegesen törlöd a fiókodat?')) return
    setLoading(true)
    const { error } = await supabase.rpc('delete_own_account')
    if (error) {
      setErr(error.message)
      setLoading(false)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-8 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">Kezdjük el!</h1>
        <p className="mt-2 text-sm text-paper/60">{user.email}</p>
      </div>

      {!mode ? (
        <div className="grid w-full max-w-xs gap-4">
          <button onClick={() => setMode('create')} className="flex items-center gap-4 rounded-3xl bg-paper p-5 text-left text-ink active:scale-95">
            <Gift className="shrink-0 text-berry" size={28} />
            <div><p className="font-display text-xl font-bold">Új füzetet készítek</p><p className="text-xs text-ink/70">Én adom a kuponokat</p></div>
          </button>
          <button onClick={() => setMode('join')} className="flex items-center gap-4 rounded-3xl bg-paper/10 p-5 text-left active:scale-95">
            <KeyRound className="shrink-0 text-gold" size={28} />
            <div><p className="font-display text-xl font-bold">Van meghívókódom</p><p className="text-xs text-paper/70">Kuponokat kaptam</p></div>
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="w-full max-w-xs space-y-4">
          <p className="text-center font-display text-xl">{mode === 'create' ? 'Mi legyen a füzet címe?' : 'Add meg a meghívókódot'}</p>
          <input
            required value={val} onChange={(e) => setVal(e.target.value)}
            placeholder={mode === 'create' ? 'pl. Boldog szülinapot!' : 'pl. KUPON-84X2'}
            className="w-full rounded-2xl bg-white/90 p-3.5 text-center text-ink"
          />

          {mode === 'create' && (
            <div className="space-y-2 pt-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-paper/70"><Sparkles size={14} className="text-gold" /> Kezdő kuponcsomag (opcionális)</p>
              <div className="space-y-1.5">
                {PACKS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPackId(p.id)}
                    className={`w-full rounded-xl border p-2.5 text-left text-xs transition ${packId === p.id ? 'border-gold bg-gold/15 text-paper' : 'border-paper/10 bg-paper/5 text-paper/70'}`}
                  >
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[11px] opacity-75">{p.desc}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPackId('none')}
                  className={`w-full rounded-xl border p-2 text-center text-xs ${packId === 'none' ? 'border-gold bg-gold/15 text-paper' : 'border-paper/10 bg-paper/5 text-paper/60'}`}
                >
                  Üres füzettel indulok
                </button>
              </div>
            </div>
          )}

          {err && <p className="text-center text-xs text-red-400">{err}</p>}
          <button disabled={loading} className="w-full rounded-full bg-berry py-3.5 font-bold active:scale-95">
            {loading ? 'Betöltés...' : mode === 'create' ? 'Füzet létrehozása' : 'Csatlakozás'}
          </button>
          <button type="button" onClick={() => { setMode(null); setVal(''); setErr('') }} className="w-full text-sm text-paper/60">Vissza</button>
        </form>
      )}

      <div className="flex items-center gap-6 text-xs">
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 text-paper/50">
          <LogOut size={14} /> Kilépés
        </button>
        <button disabled={loading} onClick={deleteAccount} className="flex items-center gap-1.5 text-red-400/70">
          <UserX size={14} /> Fiók törlése
        </button>
      </div>
    </div>
  )
}