import { useState } from 'react'
import { Heart } from 'lucide-react'
import { ICONS, TYPE_LABEL } from '../lib/utils'
import { confetti, buzz } from '../lib/confetti'
import { RARITY } from '../lib/rarity'

const hide = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

export default function CardReveal({ ticket: t, rarity = 'common', onClose }) {
  const [phase, setPhase] = useState('sealed') // sealed -> opening -> open
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50 })
  const R = RARITY[rarity] || RARITY.common
  const Icon = ICONS[t.icon] || Heart
  const open = phase === 'open'

  const start = () => {
    if (phase !== 'sealed') return
    setPhase('opening')
    buzz([30, 40, 30, 40, 60, 40, 90])
    setTimeout(() => {
      setPhase('open')
      buzz(rarity === 'legendary' ? [200, 60, 200, 60, 400] : rarity === 'rare' ? [150, 50, 250, 50, 150] : [150, 50, 250])
      confetti(R.n, [R.glow, '#f4e4dc', '#c2255c', '#d9a441'])
    }, 900)
  }
  const move = (e) => {
    if (!open) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
    const py = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))
    setTilt({ x: (50 - py) / 4, y: (px - 50) / 4, px, py })
  }
  const reset = () => setTilt({ x: 0, y: 0, px: 50, py: 50 })

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-8" style={{ background: `radial-gradient(circle at 50% 40%, ${R.glow}40, #1d1226 70%)` }}>
      {open && <div key="flash" className="flash pointer-events-none fixed inset-0 bg-white" />}
      <p className="font-display text-2xl">{open ? 'Beváltva ❤️' : 'Kinyitod?'}</p>

      <div style={{ perspective: 1000 }}>
        <div onClick={start} onPointerMove={move} onPointerLeave={reset} onPointerUp={reset}
          className={`relative h-[26rem] w-72 ${phase === 'opening' ? 'card-shake' : ''}`}
          style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, touchAction: 'none' }}>
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transition: 'transform .9s cubic-bezier(.2,.8,.2,1)', transform: open ? 'rotateY(180deg)' : 'none' }}>
            {/* lezárt hátoldal */}
            <div style={{ ...hide, '--g': R.glow }} className={`absolute inset-0 grid place-items-center rounded-3xl border-4 border-paper/80 bg-gradient-to-br from-berry via-[#7a1740] to-bg ${phase === 'sealed' ? 'card-idle' : ''}`}>
              <div className="text-center">
                <Heart size={72} fill="currentColor" className="mx-auto text-paper" />
                <p className="mt-4 font-display text-xl">Érintsd meg</p>
              </div>
            </div>
            {/* felfedett előlap */}
            <div style={{ ...hide, transform: 'rotateY(180deg)', boxShadow: `0 0 60px 8px ${R.glow}aa` }} className="absolute inset-0 overflow-hidden rounded-3xl bg-paper p-6 text-ink">
              <div className="flex h-full flex-col items-center justify-between text-center">
                <p className="text-sm font-semibold text-ink/60">{R.name} · {TYPE_LABEL[t.type]}</p>
                <div>
                  <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-berry text-paper"><Icon size={46} /></div>
                  <h3 className="font-display text-2xl font-bold leading-tight">{t.title}</h3>
                  {t.description && <p className="mt-2 text-sm text-ink/70">{t.description}</p>}
                </div>
                <p className="text-xs text-ink/50">{t.category}</p>
              </div>
              <div className="pointer-events-none absolute inset-0" style={{
                background: 'linear-gradient(115deg, transparent 20%, rgba(255,0,150,.4) 35%, rgba(0,220,255,.4) 50%, rgba(255,230,0,.4) 65%, transparent 80%)',
                backgroundSize: '220% 220%', backgroundPosition: `${tilt.px}% ${tilt.py}%`, mixBlendMode: 'color-dodge', opacity: { common: 0.35, rare: 0.65, legendary: 0.85 }[rarity] }} />
              <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, rgba(255,255,255,.55), transparent 45%)`, mixBlendMode: 'overlay' }} />
            </div>
          </div>
        </div>
      </div>

      {open && R.bonus && <p className="max-w-xs text-center font-semibold" style={{ color: R.glow }}>{R.bonus}</p>}
      {open ? <button onClick={onClose} className="rounded-full bg-paper px-8 py-3 font-bold text-ink active:scale-95">Tovább</button>
        : <p className="h-12 text-sm text-paper/60">{phase === 'sealed' ? 'Érintsd meg a kártyát a kinyitáshoz' : '…'}</p>}
    </div>
  )
}
