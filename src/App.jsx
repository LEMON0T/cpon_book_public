import { useCallback, useEffect, useState } from 'react'
import { Ticket, BookHeart, Settings, LogOut, Hourglass } from 'lucide-react'
import { supabase } from './lib/supabase'
import { getSavedRole } from './lib/auth'
import { ICONS } from './lib/utils'
import Login from './components/Login'
import TicketCard from './components/TicketCard'
import RedeemModal from './components/RedeemModal'
import MemoryWall from './components/MemoryWall'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [role, setRole] = useState(getSavedRole())
  const [tab, setTab] = useState('tickets')
  const [tickets, setTickets] = useState([])
  const [reds, setReds] = useState([])
  const [redeeming, setRedeeming] = useState(null)

  const load = useCallback(async () => {
    const [t, r] = await Promise.all([
      supabase.from('tickets').select('*').eq('is_active', true).order('created_at'),
      supabase.from('redemptions').select('*, ticket:tickets(title, icon)').order('redeemed_at', { ascending: false })
    ])
    setTickets(t.data || []); setReds(r.data || [])
  }, [])
  useEffect(() => { if (role) load() }, [role, load])

  if (!role) return <Login onLogin={setRole} />

  const logout = () => { localStorage.removeItem('wallet_auth'); setRole(null) }
  const pending = reds.filter((r) => r.status === 'pending')
  const tabs = [['tickets', Ticket, 'Kuponok'], ['memories', BookHeart, 'Napló'], ...(role === 'me' ? [['admin', Settings, 'Admin']] : [])]

  return (
    <div className="mx-auto min-h-screen max-w-md pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <h1 className="font-display text-3xl font-bold">{tab === 'tickets' ? 'Kuponfüzet' : tab === 'memories' ? 'Közös napló' : 'Admin'}</h1>
        <button onClick={logout} aria-label="Kilépés" className="text-paper/50"><LogOut size={20} /></button>
      </header>

      <main className="space-y-5 px-5 pb-32 pt-3">
        {tab === 'tickets' && <>
          {tickets.map((t) => <TicketCard key={t.id} ticket={t} onRedeem={() => setRedeeming(t)} />)}
          {!tickets.length && <p className="mt-16 text-center text-paper/60">Még nincs kupon a füzetben.</p>}
          {pending.length > 0 && (
            <section className="space-y-2 pt-4">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Hourglass size={18} className="text-gold" />Függőben</h2>
              {pending.map((r) => {
                const I = ICONS[r.ticket?.icon] || Hourglass
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
                    <I className="shrink-0 text-gold" />
                    <div><p className="font-bold">{r.ticket?.title}</p><p className="text-xs text-paper/70">{r.desired_date || 'Nincs dátum'}{r.note && ` · ${r.note}`}</p></div>
                  </div>
                )
              })}
            </section>
          )}
        </>}
        {tab === 'memories' && <MemoryWall reds={reds} onChange={load} />}
        {tab === 'admin' && <AdminPanel tickets={tickets} reds={reds} onChange={load} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md justify-around border-t border-paper/10 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {tabs.map(([k, I, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${tab === k ? 'text-berry' : 'text-paper/50'}`}>
            <I size={22} />{label}
          </button>
        ))}
      </nav>

      {redeeming && <RedeemModal ticket={redeeming} onClose={() => setRedeeming(null)} onDone={() => { setRedeeming(null); load() }} />}
    </div>
  )
}
