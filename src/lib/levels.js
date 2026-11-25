export const LEVELS = [
  { level: 1, minXp: 0, title: 'Újonc páros', unlockTheme: 'midnight' },
  { level: 2, minXp: 100, title: 'Élménykeresők', unlockTheme: 'rose' },
  { level: 3, minXp: 250, title: 'Kalandgyűjtők', unlockTheme: 'emerald' },
  { level: 4, minXp: 450, title: 'Összeszokott csapat', unlockTheme: 'golden' },
  { level: 5, minXp: 700, title: 'Legendás duó', unlockTheme: 'crimson' }
]

export const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Éjféli lila',
    minLevel: 1,
    bg: '#1d1226',
    paper: '#f4e4dc',
    ink: '#1d1226',
    berry: '#c2255c',
    gold: '#d9a441'
  },
  rose: {
    id: 'rose',
    name: 'Rózsakvarc',
    minLevel: 2,
    bg: '#2a1320',
    paper: '#ffeaf2',
    ink: '#2a1320',
    berry: '#e64980',
    gold: '#f59f00'
  },
  emerald: {
    id: 'emerald',
    name: 'Smaragd erdő',
    minLevel: 3,
    bg: '#0f241d',
    paper: '#e6f4ee',
    ink: '#0f241d',
    berry: '#12b886',
    gold: '#e0a82e'
  },
  golden: {
    id: 'golden',
    name: 'Aranyóra',
    minLevel: 4,
    bg: '#261a10',
    paper: '#fdf3e7',
    ink: '#261a10',
    berry: '#d9480f',
    gold: '#f59f00'
  },
  crimson: {
    id: 'crimson',
    name: 'Királyi rubin',
    minLevel: 5,
    bg: '#210d14',
    paper: '#faecee',
    ink: '#210d14',
    berry: '#c92a2a',
    gold: '#fcc419'
  }
}

export function calcProgress(reds = []) {
  let xp = 0
  for (const r of reds) {
    xp += 25
    if (r.status === 'completed') xp += 15
    xp += (r.photos?.length || 0) * 20
  }

  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l
  }
  const next = LEVELS.find((l) => l.level === current.level + 1) || null
  const pct = next
    ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100

  return { xp, current, next, pct }
}