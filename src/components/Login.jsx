import { useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr(error.message)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-8">
      <div className="text-center">
        <Heart className="mx-auto mb-4 text-berry" fill="currentColor" size={40} />
        <h1 className="font-display text-4xl font-bold">Kuponfüzet</h1>
        <p className="mt-2 text-paper/60">{isRegister ? 'Új fiók létrehozása' : 'Jelentkezz be a folytatáshoz'}</p>
      </div>

      <form onSubmit={submit} className="w-full max-w-xs space-y-3">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail cím" className="w-full rounded-2xl bg-white/90 p-3.5 text-ink"
        />
        <input
          type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Jelszó (min. 6 karakter)" className="w-full rounded-2xl bg-white/90 p-3.5 text-ink"
        />
        {err && <p className="text-center text-xs text-red-400">{err}</p>}
        <button disabled={loading} className="w-full rounded-full bg-berry py-3.5 font-bold active:scale-95 disabled:opacity-50">
          {loading ? 'Folyamatban...' : isRegister ? 'Regisztráció' : 'Belépés'}
        </button>
      </form>

      <button onClick={() => { setIsRegister(!isRegister); setErr('') }} className="text-sm text-paper/70 underline">
        {isRegister ? 'Már van fiókom, belépek' : 'Nincs még fiókom, regisztrálok'}
      </button>
    </div>
  )
}