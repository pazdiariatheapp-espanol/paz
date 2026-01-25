import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers - Legacy tables
export const saveMoodEntry = async (userId, mood, note = '') => {
  const { data: legacyData, error: legacyError } = await supabase
    .from('mood_entries')
    .insert([{ user_id: userId, mood, note }])
    .select()

  // Dual sync: also save to pazhealth_messages
  if (legacyData && legacyData.length > 0) {
    const entry = legacyData[0]
    await supabase
      .from('pazhealth_messages')
      .insert([{
        user_id: userId,
        type: 'mood_entry',
        content: note,
        metadata: { mood, original_id: entry.id }
      }])
      .catch(() => {})
  }

  return { data: legacyData, error: legacyError }
}

export const getMoodEntries = async (userId, limit = 30) => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export const saveJournalEntry = async (userId, content, gratitude = []) => {
  const { data: legacyData, error: legacyError } = await supabase
    .from('journal_entries')
    .insert([{ user_id: userId, content, gratitude }])
    .select()

  // Dual sync: also save to pazhealth_messages
  if (legacyData && legacyData.length > 0) {
    const entry = legacyData[0]
    await supabase
      .from('pazhealth_messages')
      .insert([{
        user_id: userId,
        type: 'journal_entry',
        content: content,
        metadata: { gratitude, original_id: entry.id }
      }])
      .catch(() => {})
  }

  return { data: legacyData, error: legacyError }
}

export const getJournalEntries = async (userId, limit = 30) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()

  // Dual sync: also update pazhealth_user_profiles
  if (!error) {
    await supabase
      .from('pazhealth_user_profiles')
      .upsert([{
        user_id: userId,
        ...updates,
        updated_at: new Date()
      }], { onConflict: 'user_id' })
      .catch(() => {})
  }

  return { data, error }
}

// AI Chat messages - PazHealth
export const saveAIChatMessage = async (userId, conversationId, role, content) => {
  const { data, error } = await supabase
    .from('pazhealth_messages')
    .insert([{
      user_id: userId,
      conversation_id: conversationId,
      type: 'ai_chat',
      role,
      content
    }])
    .select()

  return { data, error }
}

export const getConversationHistory = async (userId, conversationId) => {
  const { data, error } = await supabase
    .from('pazhealth_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .eq('type', 'ai_chat')
    .order('created_at', { ascending: true })

  return { data, error }
}

export const createConversation = async (userId) => {
  const { data, error } = await supabase
    .from('pazhealth_conversations')
    .insert([{
      user_id: userId,
      title: `Chat ${new Date().toLocaleDateString()}`
    }])
    .select()

  return { data, error }
}