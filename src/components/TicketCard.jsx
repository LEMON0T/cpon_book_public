import { Heart } from 'lucide-react'
import { ICONS, TYPE_LABEL, getAvailability } from '../lib/utils'

export default function TicketCard({ ticket: t, onRedeem }) {
  const Icon = ICONS[t.icon] || Heart
  const a = getAvailability(t)
  const vip = t.type === 'vip'
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-paper text-ink shadow-xl ${a.ok ? '' : 'opacity-50'} ${vip ? 'ring-2 ring-gold' : ''}`}>
      <div className="flex gap-4 p-5">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${vip ? 'bg-gold text-ink' : 'bg-berry text-paper'}`}><Icon size={26} /></div>
        <div className="min-w-0">
          <p className="text-xs text-ink/60">{t.category}</p>
          <h3 className="font-display text-xl font-bold leading-tight">{t.title}</h3>
          {t.description && <p className="mt-1 text-sm text-ink/70">{t.description}</p>}
        </div>
      </div>
      <div className="relative border-t-2 border-dashed border-ink/25">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bg" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-bg" />
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="text-xs text-ink/70">
          <span className="rounded-full bg-ink/10 px-2 py-1 font-semibold">{TYPE_LABEL[t.type]}</span>
          {t.type === 'limited' && <span className="ml-2 font-semibold">{t.remaining}/{t.total_count} maradt</span>}
          {t.type === 'cooldown' && <span className="ml-2">{t.cooldown_days} naponta</span>}
          {a.label && <p className="mt-1 font-semibold">{a.label}</p>}
        </div>
        <button disabled={!a.ok} onClick={onRedeem} className="shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-bold text-paper active:scale-95 disabled:bg-ink/30">Beváltom</button>
      </div>
    </div>
  )
}
