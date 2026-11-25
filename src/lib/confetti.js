export const buzz = (pattern) => { try { navigator.vibrate?.(pattern) } catch {} }

export function confetti(count = 120, colors = ['#c2255c', '#d9a441', '#f4e4dc']) {
  const c = document.createElement('canvas')
  Object.assign(c.style, { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 70 })
  document.body.appendChild(c)
  const ctx = c.getContext('2d')
  const W = (c.width = innerWidth), H = (c.height = innerHeight)
  const ps = Array.from({ length: count }, () => {
    const a = ((-90 + (Math.random() - 0.5) * 140) * Math.PI) / 180, v = 8 + Math.random() * 12
    return { x: W / 2, y: H * 0.55, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: colors[Math.floor(Math.random() * colors.length)] }
  })
  const t0 = performance.now()
  const tick = (now) => {
    ctx.clearRect(0, 0, W, H)
    for (const p of ps) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore()
    }
    if (now - t0 < 3500) requestAnimationFrame(tick); else c.remove()
  }
  requestAnimationFrame(tick)
}