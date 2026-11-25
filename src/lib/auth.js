import { supabase } from './supabase'

export async function getUserBook(userId) {
  const { data } = await supabase
    .from('books')
    .select('*')
    .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
    .maybeSingle()
  return data
}

export async function createBook(userId, title) {
  const code = 'KUPON-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  const { data, error } = await supabase
    .from('books')
    .insert({ title: title.trim() || 'Kuponfüzet', invite_code: code, owner_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinBook(userId, inviteCode) {
  const clean = inviteCode.trim().toUpperCase()
  const { data: book, error: findErr } = await supabase
    .from('books')
    .select('*')
    .eq('invite_code', clean)
    .maybeSingle()

  if (findErr || !book) throw new Error('Érvénytelen meghívókód.')
  if (book.owner_id === userId) return book
  if (book.partner_id && book.partner_id !== userId) throw new Error('Ehhez a füzethez már csatlakoztak.')

  const { data, error } = await supabase
    .from('books')
    .update({ partner_id: userId })
    .eq('id', book.id)
    .select()
    .single()
  if (error) throw error
  return data
}