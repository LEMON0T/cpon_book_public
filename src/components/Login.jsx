import { useEffect, useState } from 'react'
import { Download, Heart, MoreVertical, PlusSquare, Share, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import InfoModal from './InfoModal'

export default function Login() {
  const [isRegister, setIsRegister] = useState(() => Boolean(new URLSearchParams(window.location.search).get('invite')))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showInfo, setShowInfo] = useState(false)

  const [promptEvent, setPromptEvent] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    setIsStandalone(standalone)

    const onBeforeInstall = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    const onInstalled = () => {
      setPromptEvent(null)
      setIsStandalone(true)
      setShowGuide(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const installApp = async () => {
    if (promptEvent) {
      promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') setPromptEvent(null)
      return
    }
    setShowGuide((v) => !v)
  }

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 px-8 py-10">
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

      {!isStandalone && (
        <div className="w-full max-w-xs space-y-2 pt-2">
          <button
            type="button"
            onClick={installApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-paper/15 bg-paper/10 py-3 text-xs font-bold text-paper active:scale-95"
          >
            <Download size={15} className="text-gold" /> Alkalmazás telepítése a telefonra
          </button>

          {showGuide && (
            <div className="space-y-1.5 rounded-2xl border border-gold/30 bg-paper/10 p-3.5 text-xs text-paper/85">
              {isIos ? (
                <>
                  <p className="font-bold text-gold">Telepítés iPhone-on (Safariban):</p>
                  <p className="flex items-center gap-1.5">1. Koppints alul a <Share size={14} className="inline text-gold" /> <strong>Megosztás</strong> ikonra.</p>
                  <p className="flex items-center gap-1.5">2. Válaszd a <PlusSquare size={14} className="inline text-gold" /> <strong>Hozzáadás a főképernyőhöz</strong> opciót.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-gold">Telepítés Androidon / böngészőből:</p>
                  <p className="flex items-center gap-1.5">1. Koppints a jobb felső <MoreVertical size={14} className="inline text-gold" /> <strong>menü</strong> ikonra.</p>
                  <p className="flex items-center gap-1.5">2. Válaszd az <strong>Alkalmazás telepítése</strong> vagy <strong>Hozzáadás a kezdőképernyőhöz</strong> opciót.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

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