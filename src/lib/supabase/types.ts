export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  roomietab: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          household_id: string
          user_id: string | null
          display_name: string
          email: string | null
          avatar_url: string | null
          role: string
          venmo_handle: string | null
          paypal_email: string | null
          notification_prefs: Json
          is_active: boolean
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id?: string | null
          display_name: string
          email?: string | null
          avatar_url?: string | null
          role?: string
          venmo_handle?: string | null
          paypal_email?: string | null
          notification_prefs?: Json
          is_active?: boolean
          joined_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string | null
          display_name?: string
          email?: string | null
          avatar_url?: string | null
          role?: string
          venmo_handle?: string | null
          paypal_email?: string | null
          notification_prefs?: Json
          is_active?: boolean
          joined_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          household_id: string
          description: string
          amount_cents: number
          category: string
          split_type: string
          paid_by_member_id: string
          expense_date: string
          receipt_url: string | null
          is_recurring: boolean
          recurring_day: number | null
          recurring_template_id: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          description: string
          amount_cents: number
          category?: string
          split_type?: string
          paid_by_member_id: string
          expense_date?: string
          receipt_url?: string | null
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_template_id?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          description?: string
          amount_cents?: number
          category?: string
          split_type?: string
          paid_by_member_id?: string
          expense_date?: string
          receipt_url?: string | null
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_template_id?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          member_id: string
          amount_cents: number
          percentage: number | null
          shares: number | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          member_id: string
          amount_cents: number
          percentage?: number | null
          shares?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          member_id?: string
          amount_cents?: number
          percentage?: number | null
          shares?: number | null
          created_at?: string
        }
      }
      recurring_templates: {
        Row: {
          id: string
          household_id: string
          description: string
          amount_cents: number
          category: string
          split_type: string
          paid_by_member_id: string
          split_config: Json
          day_of_month: number
          is_active: boolean
          last_generated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          description: string
          amount_cents: number
          category: string
          split_type?: string
          paid_by_member_id: string
          split_config?: Json
          day_of_month: number
          is_active?: boolean
          last_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          description?: string
          amount_cents?: number
          category?: string
          split_type?: string
          paid_by_member_id?: string
          split_config?: Json
          day_of_month?: number
          is_active?: boolean
          last_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settlements: {
        Row: {
          id: string
          household_id: string
          month: string
          is_archived: boolean
          archived_at: string | null
          archived_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          month: string
          is_archived?: boolean
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          month?: string
          is_archived?: boolean
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settlement_transactions: {
        Row: {
          id: string
          settlement_id: string
          payer_member_id: string
          receiver_member_id: string
          amount_cents: number
          is_settled: boolean
          settled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          settlement_id: string
          payer_member_id: string
          receiver_member_id: string
          amount_cents: number
          is_settled?: boolean
          settled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          settlement_id?: string
          payer_member_id?: string
          receiver_member_id?: string
          amount_cents?: number
          is_settled?: boolean
          settled_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['roomietab']['Tables']> =
  Database['roomietab']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['roomietab']['Tables']> =
  Database['roomietab']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['roomietab']['Tables']> =
  Database['roomietab']['Tables'][T]['Update']
