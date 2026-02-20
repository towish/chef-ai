// ChefAI Supabase Types
// Generated for ChefAI database

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
      recipes: {
        Row: {
          id: string
          title: string
          ingredients: string[]
          instructions: string
          image_url: string | null
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          ingredients: string[]
          instructions: string
          image_url?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          ingredients?: string[]
          instructions?: string
          image_url?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type Favorite = Database['public']['Tables']['favorites']['Row']
