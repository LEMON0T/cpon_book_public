export const PINS = { her: import.meta.env.VITE_PIN_HER, me: import.meta.env.VITE_PIN_ME }
export const getSavedRole = () => {
  try { const s = JSON.parse(localStorage.getItem('wallet_auth')); return s && PINS[s.role] === s.pin ? s.role : null }
  catch { return null }
}
