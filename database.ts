export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          world_id: string
          username: string | null
          avatar: string | null
          region: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          world_id: string
          username?: string | null
          avatar?: string | null
          region?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          world_id?: string
          username?: string | null
          avatar?: string | null
          region?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          content: string
          image_url: string | null
          region: string | null
          is_boosted: boolean
          boosted_until: string | null
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          image_url?: string | null
          region?: string | null
          is_boosted?: boolean
          boosted_until?: string | null
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          image_url?: string | null
          region?: string | null
          is_boosted?: boolean
          boosted_until?: string | null
          author_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reactions: {
        Row: {
          id: string
          type: ReactionType
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: ReactionType
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: ReactionType
          user_id?: string
          post_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          amount: number
          currency: string
          status: PaymentStatus
          worldcoin_tx_hash: string | null
          user_id: string
          post_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          currency?: string
          status?: PaymentStatus
          worldcoin_tx_hash?: string | null
          user_id: string
          post_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          currency?: string
          status?: PaymentStatus
          worldcoin_tx_hash?: string | null
          user_id?: string
          post_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      leaderboard_entries: {
        Row: {
          id: string
          week: string
          score: number
          region: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          week: string
          score?: number
          region?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          week?: string
          score?: number
          region?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_weekly_score: {
        Args: {
          user_id_param: string
          week_param: string
          region_param?: string
        }
        Returns: number
      }
      update_weekly_leaderboard: {
        Args: {
          week_param: string
          region_param?: string
        }
        Returns: undefined
      }
      get_current_week: {
        Args: {}
        Returns: string
      }
      get_leaderboard: {
        Args: {
          week_param?: string
          region_param?: string
          limit_param?: number
        }
        Returns: {
          rank: number
          user_id: string
          username: string | null
          avatar: string | null
          score: number
          week: string
        }[]
      }
    }
    Enums: {
      reaction_type: 'LIKE' | 'LOL' | 'FACEPALM'
      payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type ReactionType = Database['public']['Enums']['reaction_type']
export type PaymentStatus = Database['public']['Enums']['payment_status']

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type LeaderboardEntry = Database['public']['Tables']['leaderboard_entries']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertPost = Database['public']['Tables']['posts']['Insert']
export type InsertReaction = Database['public']['Tables']['reactions']['Insert']
export type InsertPayment = Database['public']['Tables']['payments']['Insert']
export type InsertLeaderboardEntry = Database['public']['Tables']['leaderboard_entries']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdatePost = Database['public']['Tables']['posts']['Update']
export type UpdateReaction = Database['public']['Tables']['reactions']['Update']
export type UpdatePayment = Database['public']['Tables']['payments']['Update']
export type UpdateLeaderboardEntry = Database['public']['Tables']['leaderboard_entries']['Update']

// Extended types with relations
export interface PostWithAuthor extends Post {
  author: User
  reactions: Reaction[]
  _count: {
    reactions: number
  }
}

export interface LeaderboardUser {
  rank: number
  user_id: string
  username: string | null
  avatar: string | null
  score: number
  week: string
}

