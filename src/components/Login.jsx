import { useState } from 'react'
import { Heart, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import InfoModal from './InfoModal'
import InstallPrompt from './InstallPrompt'

export default function Login() {
  const [mode, setMode] = useState(() =>
    new URLSearchParams(window.location.search).get('invite') ? 'register' : 'login'
  ) // login | register | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setErr('')
    setMsg('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    setLoading(true)

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      })
      setLoading(false)
      if (error) {
        setErr(error.message)
      } else {
        setMsg('Elküldtük a jelszó-visszaállító linket az e-mail-címedre! Nézd meg a Spam mappát is.')
      }
      return
    }

    const { error } = mode === 'register'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr(error.message)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 px-8 py-10">
      <div className="text-center">
        <Heart className="mx-auto mb-4 text-berry" fill="currentColor" size={40} />
        <h1 className="font-display text-4xl font-bold">Kuponfüzet</h1>
        <p className="mt-2 text-paper/60">
          {mode === 'register'
            ? 'Új fiók létrehozása'
            : mode === 'forgot'
              ? 'Jelszó visszaállítása'
              : 'Jelentkezz be a folytatáshoz'}
        </p>
      </div>

      <form onSubmit={submit} className="w-full max-w-xs space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail cím"
          className="w-full rounded-2xl bg-white/90 p-3.5 text-ink"
        />

        {mode !== 'forgot' && (
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó (min. 6 karakter)"
            className="w-full rounded-2xl bg-white/90 p-3.5 text-ink"
          />
        )}

        {mode === 'login' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-xs text-paper/60 hover:text-paper"
            >
              Elfelejtettem a jelszavam
            </button>
          </div>
        )}

        {err && <p className="text-center text-xs text-red-400">{err}</p>}
        {msg && <p className="text-center text-xs text-gold">{msg}</p>}

        <button disabled={loading} className="w-full rounded-full bg-berry py-3.5 font-bold active:scale-95 disabled:opacity-50">
          {loading
            ? 'Folyamatban...'
            : mode === 'register'
              ? 'Regisztráció'
              : mode === 'forgot'
                ? 'Visszaállító link küldése'
                : 'Belépés'}
        </button>
      </form>

      {mode === 'forgot' ? (
        <button onClick={() => switchMode('login')} className="text-sm text-paper/70 underline">
          Vissza a belépéshez
        </button>
      ) : (
        <button onClick={() => switchMode(mode === 'register' ? 'login' : 'register')} className="text-sm text-paper/70 underline">
          {mode === 'register' ? 'Már van fiókom, belépek' : 'Nincs még fiókom, regisztrálok'}
        </button>
      )}

      <div className="w-full max-w-xs pt-2">
        <InstallPrompt />
      </div>

      <button
        type="button"
        onClick={() => setShowInfo(true)}
        className="flex items-center gap-1.5 text-xs text-paper/45 hover:text-paper/70"
      >
        <ShieldCheck size={14} /> Adatkezelés és tudnivalók
      </button>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}