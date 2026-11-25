export const PACKS = [
  {
    id: 'romantic',
    name: 'Romantikus csomag',
    desc: '6 klasszikus randi és kényeztető kupon',
    tickets: [
      { title: 'Gyertyafényes vacsora', description: 'Én főzök vagy rendelek, te csak élvezed', category: 'Randi', type: 'limited', total_count: 2, remaining: 2, icon: 'Utensils' },
      { title: '20 perces hátmasszázs', description: 'Illóolajjal, telefonmentesen', category: 'Kényeztetés', type: 'cooldown', cooldown_days: 14, icon: 'Sparkles' },
      { title: 'Közös naplemente-nézés', description: 'Válassz egy kilátópontot vagy parkot', category: 'Randi', type: 'unlimited', icon: 'Heart' },
      { title: 'Reggeli az ágyba', description: 'Kávéval és a kedvenc péksütiddel', category: 'Otthon', type: 'limited', total_count: 3, remaining: 3, icon: 'Coffee' },
      { title: 'Filmest – Te választasz', description: 'Vétójog nélkül, popcornnal', category: 'Otthon', type: 'cooldown', cooldown_days: 7, icon: 'Film' },
      { title: 'Meglepetés kirándulás', description: 'Egy egész napos közös program', category: 'Különleges', type: 'vip', total_count: 1, remaining: 1, icon: 'Star' }
    ]
  },
  {
    id: 'lazy',
    name: 'Lusta hétvége',
    desc: '6 pihenős, házimunka-mentesítő kupon',
    tickets: [
      { title: 'Mosogatás-mentesség', description: 'Ma minden edény az enyém', category: 'Otthon', type: 'limited', total_count: 3, remaining: 3, icon: 'Sparkles' },
      { title: 'Délutánig alvás', description: 'Ébresztő és programok nélkül', category: 'Otthon', type: 'cooldown', cooldown_days: 14, icon: 'Heart' },
      { title: 'Közös társasjáték / gaming este', description: 'Te választod a játékot', category: 'Otthon', type: 'unlimited', icon: 'Music' },
      { title: 'Sütizés a kedvenc helyeden', description: 'Meghívlak egy kávéra és sütire', category: 'Randi', type: 'limited', total_count: 2, remaining: 2, icon: 'Coffee' },
      { title: 'Késő esti séta', description: 'Csak mi ketten, zene és beszélgetés', category: 'Randi', type: 'unlimited', icon: 'Heart' },
      { title: 'Teljes szabadnap', description: 'Semmi kötelező program egész nap', category: 'Különleges', type: 'vip', total_count: 1, remaining: 1, icon: 'Gift' }
    ]
  },
  {
    id: 'birthday',
    name: 'Szülinapi kiadás',
    desc: '6 ünnepi és különleges kupon',
    tickets: [
      { title: 'Szülinapi kívánság', description: 'Bármi, amit ma szeretnél', category: 'Különleges', type: 'vip', total_count: 1, remaining: 1, icon: 'Gift' },
      { title: 'Vacsora a kedvenc éttermedben', description: 'Minden fogás az én számlámra', category: 'Randi', type: 'vip', total_count: 1, remaining: 1, icon: 'Utensils' },
      { title: 'Közös fotózás / emlékgyűjtés', description: 'Készítünk pár szuper közös képet', category: 'Randi', type: 'unlimited', icon: 'Heart' },
      { title: 'Koktélozás vagy fagyizás', description: 'Egy spontán délutáni kitérő', category: 'Randi', type: 'limited', total_count: 2, remaining: 2, icon: 'Coffee' },
      { title: 'Sofőrszolgálat egy estére', description: 'Én vezetek, bárhová megyünk', category: 'Különleges', type: 'limited', total_count: 2, remaining: 2, icon: 'Star' },
      { title: 'Közös piknik', description: 'Pléddel, finomságokkal a szabadban', category: 'Randi', type: 'limited', total_count: 1, remaining: 1, icon: 'Heart' }
    ]
  }
]