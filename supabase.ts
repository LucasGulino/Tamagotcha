import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to get user session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const session = await getSession()
  if (!session?.user) return null

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  return user
}

// Helper function to check if user exists
export const getUserByWorldId = async (worldId: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('world_id', worldId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting user by World ID:', error)
    return null
  }

  return user
}

// Helper function to create or update user
export const upsertUser = async (userData: {
  id: string
  worldId: string
  username?: string
  avatar?: string
  region?: string
}) => {
  const { data: user, error } = await supabase
    .from('users')
    .upsert({
      id: userData.id,
      world_id: userData.worldId,
      username: userData.username,
      avatar: userData.avatar,
      region: userData.region || 'global'
    }, {
      onConflict: 'world_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user:', error)
    throw error
  }

  return user
}

// Helper function to upload image to Supabase Storage
export const uploadImage = async (file: File, bucket: string = 'posts'): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${bucket}/${fileName}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  return publicUrl
}

// Helper function to delete image from Supabase Storage
export const deleteImage = async (imageUrl: string) => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const path = pathParts.slice(pathParts.indexOf('images') + 1).join('/')

    const { error } = await supabase.storage
      .from('images')
      .remove([path])

    if (error) {
      console.error('Error deleting image:', error)
    }
  } catch (error) {
    console.error('Error parsing image URL:', error)
  }
}

// Real-time subscription helpers
export const subscribeToPostReactions = (postId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`post-reactions-${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `post_id=eq.${postId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToLeaderboard = (week: string, region: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`leaderboard-${week}-${region}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard_entries',
        filter: `week=eq.${week}.and.region=eq.${region}`
      },
      callback
    )
    .subscribe()
}

