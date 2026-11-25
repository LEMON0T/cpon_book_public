import { useCallback, useEffect, useMemo, useState } from 'react'
import { Ticket, BookHeart, Settings, LogOut, Hourglass, Search, Sparkles, Trophy } from 'lucide-react'
import { supabase } from './lib/supabase'
import { getUserBook } from './lib/auth'
import { ICONS } from './lib/utils'
import { THEMES, calcProgress } from './lib/levels'
import Login from './components/Login'
import BookSetup from './components/BookSetup'
import TicketCard from './components/TicketCard'
import RedeemModal from './components/RedeemModal'
import WishModal from './components/WishModal'
import MemoryWall from './components/MemoryWall'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [book, setBook] = useState(undefined)
  const [tab, setTab] = useState('tickets')
  const [tickets, setTickets] = useState([])
  const [reds, setReds] = useState([])
  const [wishes, setWishes] = useState([])
  const [redeeming, setRedeeming] = useState(null)
  const [wishing, setWishing] = useState(false)
  const [cat, setCat] = useState('Összes')
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setBook(undefined); return }
    getUserBook(user.id).then((b) => setBook(b ?? null))
  }, [user])

  // Aktív színséma alkalmazása
  useEffect(() => {
    const t = THEMES[book?.theme] || THEMES.midnight
    const root = document.documentElement.style
    root.setProperty('--c-bg', t.bg)
    root.setProperty('--c-paper', t.paper)
    root.setProperty('--c-ink', t.ink)
    root.setProperty('--c-berry', t.berry)
    root.setProperty('--c-gold', t.gold)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg)
  }, [book?.theme])

  const load = useCallback(async () => {
    if (!book) return
    const [t, r, w] = await Promise.all([
      supabase.from('tickets').select('*').eq('book_id', book.id).eq('is_active', true).order('created_at'),
      supabase.from('redemptions').select('*, ticket:tickets(title, icon)').eq('book_id', book.id).order('redeemed_at', { ascending: false }),
      supabase.from('wishes').select('*').eq('book_id', book.id).eq('status', 'pending').order('created_at', { ascending: false })
    ])
    setTickets(t.data || [])
    setReds(r.data || [])
    setWishes(w.data || [])
  }, [book])

  useEffect(() => { if (book) load() }, [book, load])

  const progress = useMemo(() => calcProgress(reds), [reds])

  const categories = useMemo(() => {
    const unique = [...new Set(tickets.map((t) => t.category).filter(Boolean))]
    return ['Összes', ...unique]
  }, [tickets])

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchCat = cat === 'Összes' || t.category === cat
      const q = query.trim().toLowerCase()
      const matchQ = !q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [tickets, cat, query])

  if (user === undefined || (user && book === undefined)) return null
  if (!user) return <Login />
  if (!book) return <BookSetup user={user} onDone={setBook} />

  const isOwner = book.owner_id === user.id
  const pending = reds.filter((r) => r.status === 'pending')
  const tabs = [
    ['tickets', Ticket, 'Kuponok'],
    ['memories', BookHeart, 'Napló'],
    ...(isOwner ? [['admin', Settings, 'Admin', wishes.length + pending.length]] : [])
  ]

  return (
    <div className="mx-auto min-h-screen max-w-md pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <h1 className="font-display text-3xl font-bold">{tab === 'tickets' ? book.title : tab === 'memories' ? 'Közös napló' : 'Admin'}</h1>
        <button onClick={() => supabase.auth.signOut()} aria-label="Kilépés" className="text-paper/50"><LogOut size={20} /></button>
      </header>

      <main className="space-y-5 px-5 pb-32 pt-3">
        {tab === 'tickets' && <>
          {/* Közös szint és XP sáv */}
          <div className="rounded-2xl bg-paper/10 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-gold">
                <Trophy size={14} /> {progress.current.level}. szint · {progress.current.title}
              </span>
              <span className="text-paper/60">
                {progress.next ? `${progress.xp} / ${progress.next.minXp} XP` : `${progress.xp} XP (Max)`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper/10">
              <div className="h-full rounded-full bg-gradient-to-r from-berry to-gold transition-all duration-500" style={{ width: `${progress.pct}%` }} />
            </div>
          </div>

          {/* Partner kívánság gomb */}
          {!isOwner && (
            <button
              onClick={() => setWishing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 py-3 text-sm font-bold text-gold active:scale-95"
            >
              <Sparkles size={16} /> Kívánok egy kupont
            </button>
          )}

          {tickets.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Keresés a kuponok között..."
                  className="w-full rounded-2xl bg-paper/10 py-2.5 pl-10 pr-4 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:ring-1 focus:ring-berry"
                />
              </div>
              {categories.length > 2 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${cat === c ? 'bg-berry text-paper' : 'bg-paper/10 text-paper/70'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredTickets.map((t) => <TicketCard key={t.id} ticket={t} onRedeem={() => setRedeeming(t)} />)}
          {!tickets.length && <p className="mt-16 text-center text-paper/60">Még nincs kupon a füzetben.</p>}
          {tickets.length > 0 && !filteredTickets.length && <p className="mt-8 text-center text-sm text-paper/60">Nincs találat a szűrésre.</p>}

          {/* Beküldött, jóváhagyásra váró kívánságok */}
          {wishes.length > 0 && (
            <section className="space-y-2 pt-2">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-paper/80"><Sparkles size={16} className="text-gold" />Jóváhagyásra váró kívánságok</h2>
              {wishes.map((w) => (
                <div key={w.id} className="rounded-xl border border-paper/15 bg-paper/5 p-3 text-sm">
                  <p className="font-bold">{w.title}</p>
                  {w.note && <p className="text-xs text-paper/60">{w.note}</p>}
                </div>
              ))}
            </section>
          )}

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
        {tab === 'admin' && <AdminPanel book={book} onBookChange={setBook} tickets={tickets} reds={reds} wishes={wishes} progress={progress} onChange={load} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md justify-around border-t border-paper/10 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {tabs.map(([k, I, label, badge]) => (
          <button key={k} onClick={() => setTab(k)} className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-xs ${tab === k ? 'text-berry' : 'text-paper/50'}`}>
            <div className="relative">
              <I size={22} />
              {badge > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">{badge}</span>}
            </div>
            {label}
          </button>
        ))}
      </nav>

      {redeeming && <RedeemModal book={book} ticket={redeeming} onClose={() => setRedeeming(null)} onDone={() => { setRedeeming(null); load() }} />}
      {wishing && <WishModal book={book} userId={user.id} onClose={() => setWishing(false)} onSent={() => { setWishing(false); load() }} />}
    </div>
  )
}