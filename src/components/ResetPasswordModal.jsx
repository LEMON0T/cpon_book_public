import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ResetPasswordModal({ onDone }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) {
      setErr(error.message)
      return
    }
    alert('Az új jelszavad sikeresen elmentve!')
    onDone()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-xs space-y-4 rounded-3xl bg-paper p-6 text-ink shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="text-berry" size={22} />
          <h2 className="font-display text-2xl font-bold">Új jelszó beállítása</h2>
        </div>
        <p className="text-xs text-ink/70">Add meg az új jelszavadat (legalább 6 karakter).</p>

        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Új jelszó"
          className="w-full rounded-xl border border-ink/20 bg-white/80 p-3 text-ink"
        />

        {err && <p className="text-center text-xs text-red-600">{err}</p>}

        <button
          disabled={busy}
          className="w-full rounded-full bg-berry py-3 font-bold text-paper active:scale-95 disabled:opacity-50"
        >
          {busy ? 'Mentés…' : 'Új jelszó mentése'}
        </button>
      </form>
    </div>
  )
}