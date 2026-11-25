import { useState } from 'react'
import { Delete, Heart } from 'lucide-react'
import { PINS } from '../lib/auth'

export default function Login({ onLogin }) {
  const [role, setRole] = useState(null)
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)

  const press = (d) => {
    if (pin.length >= 4) return
    const n = pin + d
    setErr(false); setPin(n)
    if (n.length === 4) {
      if (n === PINS[role]) { localStorage.setItem('wallet_auth', JSON.stringify({ role, pin: n })); onLogin(role) }
      else { setErr(true); setTimeout(() => setPin(''), 450) }
    }
  }

  if (!role) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-8">
      <div className="text-center">
        <Heart className="mx-auto mb-4 text-berry" fill="currentColor" size={40} />
        <h1 className="font-display text-4xl font-bold">Kuponfüzet</h1>
        <p className="mt-2 text-paper/60">Who are you?</p>
      </div>
      <div className="grid w-full max-w-xs gap-4">
        {[['her', 'She'], ['me', 'He']].map(([k, l]) => (
          <button key={k} onClick={() => setRole(k)} className="rounded-3xl bg-paper py-5 font-display text-2xl text-ink active:scale-95">{l}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-8">
      <p className="font-display text-2xl">Add meg a PIN-kódot</p>
      <div className={`flex gap-4 ${err ? 'animate-pulse' : ''}`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={`h-4 w-4 rounded-full border-2 ${err ? 'border-red-400' : 'border-paper/60'} ${i < pin.length ? (err ? 'bg-red-400' : 'bg-berry border-berry') : ''}`} />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} onClick={() => press(n)} className="h-16 w-16 rounded-full bg-paper/10 text-2xl active:bg-berry">{n}</button>)}
        <button onClick={() => { setRole(null); setPin('') }} className="text-sm text-paper/60">Vissza</button>
        <button onClick={() => press(0)} className="h-16 w-16 rounded-full bg-paper/10 text-2xl active:bg-berry">0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="grid h-16 w-16 place-items-center text-paper/60"><Delete /></button>
      </div>
    </div>
  )
}
