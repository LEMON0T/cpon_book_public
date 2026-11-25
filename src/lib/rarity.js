// Itt állíthatod a esélyeket és a bónuszokat. Az esélyek összege legyen 1.
export const RARITY = {
  common: { name: 'Közönséges', glow: '#f4e4dc', n: 70, chance: 0.9, bonus: null },
  rare: { name: 'Ritka', glow: '#a78bfa', n: 160, chance: 0.08, bonus: 'A kupon nem fogyott el, újra beválthatod!' },
  legendary: { name: 'Legendás', glow: '#d9a441', n: 300, chance: 0.02, bonus: 'A kupon nem fogyott el, és kérhetsz mellé egy extra kívánságot!' }
}
export function rollRarity() {
  const r = Math.random()
  if (r < RARITY.legendary.chance) return 'legendary'
  if (r < RARITY.legendary.chance + RARITY.rare.chance) return 'rare'
  return 'common'
}
