function escapeIcs(str = '') {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function downloadCalendarEvent({ title, desiredDate, note }) {
  const cleanTitle = `🎟️ Kupon: ${title || 'Beváltott kupon'}`
  const desc = [
    note ? `Megjegyzés: ${note}` : null,
    desiredDate ? `Kívánt időpont: ${desiredDate}` : null,
    'Kuponfüzet alkalmazásból mentve'
  ]
    .filter(Boolean)
    .join('\n')

  const now = new Date()
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  // Ha YYYY-MM-DD formátumú a dátum, egész napos (VALUE=DATE) eseményt készítünk
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec((desiredDate || '').trim())
  let dateLines = ''

  if (isoMatch) {
    const startStr = `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`
    const nextDay = new Date(Date.UTC(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3] + 1))
    const endStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '')
    dateLines = `DTSTART;VALUE=DATE:${startStr}\r\nDTEND;VALUE=DATE:${endStr}`
  } else {
    const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10).replace(/-/g, '')
    dateLines = `DTSTART;VALUE=DATE:${todayStr}\r\nDTEND;VALUE=DATE:${tomorrow}`
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kuponfuzet//HU',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@kuponfuzet`,
    `DTSTAMP:${stamp}`,
    dateLines,
    `SUMMARY:${escapeIcs(cleanTitle)}`,
    `DESCRIPTION:${escapeIcs(desc)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kupon-${(title || 'esemeny').toLowerCase().replace(/[^a-z0-9áéíóöőúüű]+/gi, '-')}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}