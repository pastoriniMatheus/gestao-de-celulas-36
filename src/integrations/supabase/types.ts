export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendances: {
        Row: {
          attendance_date: string
          cell_id: string
          contact_id: string
          created_at: string
          id: string
          present: boolean
          visitor: boolean
        }
        Insert: {
          attendance_date: string
          cell_id: string
          contact_id: string
          created_at?: string
          id?: string
          present?: boolean
          visitor?: boolean
        }
        Update: {
          attendance_date?: string
          cell_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          present?: boolean
          visitor?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "attendances_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      birthday_webhooks: {
        Row: {
          active: boolean
          created_at: string
          id: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
      cells: {
        Row: {
          active: boolean
          address: string
          created_at: string
          id: string
          leader_id: string | null
          meeting_day: number
          meeting_time: string
          name: string
          neighborhood_id: string | null
          qr_code_token: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address: string
          created_at?: string
          id?: string
          leader_id?: string | null
          meeting_day: number
          meeting_time: string
          name: string
          neighborhood_id?: string | null
          qr_code_token?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          created_at?: string
          id?: string
          leader_id?: string | null
          meeting_day?: number
          meeting_time?: string
          name?: string
          neighborhood_id?: string | null
          qr_code_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cells_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cells_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cells_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          state: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          age: number | null
          attendance_code: string | null
          birth_date: string | null
          cell_id: string | null
          city_id: string | null
          created_at: string
          encounter_with_god: boolean
          id: string
          name: string
          neighborhood: string
          pipeline_stage_id: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          attendance_code?: string | null
          birth_date?: string | null
          cell_id?: string | null
          city_id?: string | null
          created_at?: string
          encounter_with_god?: boolean
          id?: string
          name: string
          neighborhood: string
          pipeline_stage_id?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          attendance_code?: string | null
          birth_date?: string | null
          cell_id?: string | null
          city_id?: string | null
          created_at?: string
          encounter_with_god?: boolean
          id?: string
          name?: string
          neighborhood?: string
          pipeline_stage_id?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          active: boolean
          created_at: string
          date: string
          id: string
          keyword: string
          name: string
          qr_code: string
          qr_url: string
          scan_count: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          date: string
          id?: string
          keyword: string
          name: string
          qr_code: string
          qr_url: string
          scan_count?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          date?: string
          id?: string
          keyword?: string
          name?: string
          qr_code?: string
          qr_url?: string
          scan_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          active: boolean
          created_at: string
          id: string
          message: string
          name: string
          subject: string | null
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          message: string
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          active: boolean
          city_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          active: boolean
          color: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          photo_url: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          photo_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          keyword: string
          qr_code_data: string
          scan_count: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          keyword: string
          qr_code_data: string
          scan_count?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          keyword?: string
          qr_code_data?: string
          scan_count?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          qr_code_id: string
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          qr_code_id: string
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          qr_code_id?: string
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          active: boolean
          created_at: string
          event_type: string
          headers: Json | null
          id: string
          name: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          event_type: string
          headers?: Json | null
          id?: string
          name: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          event_type?: string
          headers?: Json | null
          id?: string
          name?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      neighborhood_stats: {
        Row: {
          city_name: string | null
          id: string | null
          neighborhood_name: string | null
          total_cells: number | null
          total_contacts: number | null
          total_leaders: number | null
          total_people: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_delete_city: {
        Args: { city_uuid: string }
        Returns: boolean
      }
      can_delete_neighborhood: {
        Args: { neighborhood_name: string }
        Returns: boolean
      }
      check_birthdays_and_trigger_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_qr_scan_count: {
        Args: { qr_id: string; user_ip?: unknown; user_agent_string?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
