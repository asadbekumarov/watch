export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "manager" | "staff";
export type MovementType = "automatic" | "quartz";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";
export type PaymentMethod = "cash_on_delivery" | "payme" | "click";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";
export type DeliveryType = "pickup" | "delivery";
export type DiscountType = "percent" | "fixed";
export type SmsStatus = "pending" | "sent" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          is_active: boolean;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          is_active?: boolean;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          is_active?: boolean;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          brand: string;
          model: string;
          name_uz: string;
          name_ru: string;
          price_usd: number | null;
          currency: string;
          images: string[];
          description_uz: string;
          description_ru: string;
          movement_type: MovementType;
          movement_text: string;
          case_diameter: string;
          case_diameter_val: number;
          dial_color: string | null;
          water_resistance: string | null;
          glass: string | null;
          features: string[];
          notes: string[];
          tags: string[];
          in_stock: boolean;
          is_bestseller: boolean;
          is_active: boolean;
          stock_quantity: number;
          prep_days: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          brand: string;
          model: string;
          name_uz: string;
          name_ru: string;
          price_usd?: number | null;
          currency?: string;
          images?: string[];
          description_uz?: string;
          description_ru?: string;
          movement_type?: MovementType;
          movement_text?: string;
          case_diameter?: string;
          case_diameter_val?: number;
          dial_color?: string | null;
          water_resistance?: string | null;
          glass?: string | null;
          features?: string[];
          notes?: string[];
          tags?: string[];
          in_stock?: boolean;
          is_bestseller?: boolean;
          is_active?: boolean;
          stock_quantity?: number;
          prep_days?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          store_name: string;
          display_name: string;
          tagline_uz: string;
          tagline_ru: string;
          about_uz: string;
          about_ru: string;
          phone: string;
          phone_clean: string;
          telegram_channel: string;
          telegram_manager: string;
          telegram_manager_url: string;
          instagram_handle: string | null;
          working_hours_uz: string;
          working_hours_ru: string;
          usd_to_uzs_rate: number | null;
          default_prep_days: number;
          delivery_info_uz: string;
          delivery_info_ru: string;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["site_settings"]["Row"];
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          city_uz: string;
          city_ru: string;
          address_uz: string;
          address_ru: string;
          landmark_uz: string;
          landmark_ru: string;
          note_uz: string | null;
          note_ru: string | null;
          phone: string | null;
          working_hours_uz: string | null;
          working_hours_ru: string | null;
          map_link: string | null;
          pickup_enabled: boolean;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Database["public"]["Tables"]["branches"]["Row"];
        Update: Partial<Database["public"]["Tables"]["branches"]["Row"]>;
        Relationships: [];
      };
      faqs: {
        Row: {
          id: number;
          question_uz: string;
          question_ru: string;
          answer_uz: string;
          answer_ru: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["faqs"]["Row"], "id"> & { id?: number };
        Update: Partial<Database["public"]["Tables"]["faqs"]["Row"]>;
        Relationships: [];
      };
      hero_banners: {
        Row: {
          id: number;
          title_line1_uz: string;
          title_line2_uz: string;
          title_line1_ru: string;
          title_line2_ru: string;
          subtitle_uz: string;
          subtitle_ru: string;
          is_active: boolean;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["hero_banners"]["Row"], "id"> & { id?: number };
        Update: Partial<Database["public"]["Tables"]["hero_banners"]["Row"]>;
        Relationships: [];
      };
      delivery_methods: {
        Row: {
          id: string;
          name_uz: string;
          name_ru: string;
          delivery_type: DeliveryType;
          branch_id: string | null;
          price_usd: number;
          free_above_usd: number | null;
          is_enabled: boolean;
          sort_order: number;
        };
        Insert: Database["public"]["Tables"]["delivery_methods"]["Row"];
        Update: Partial<Database["public"]["Tables"]["delivery_methods"]["Row"]>;
        Relationships: [];
      };
      promo_codes: {
        Row: {
          id: number;
          code: string;
          type: DiscountType;
          value: number;
          min_order_usd: number;
          max_discount_usd: number | null;
          valid_from: string | null;
          valid_to: string | null;
          total_usage_limit: number | null;
          per_customer_limit: number;
          usage_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["promo_codes"]["Row"], "id" | "usage_count" | "created_at"> & {
          id?: number;
          usage_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Row"]>;
        Relationships: [];
      };
      promo_redemptions: {
        Row: {
          id: number;
          promo_code_id: number;
          order_id: string;
          customer_phone: string;
          discount_usd: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["promo_redemptions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["promo_redemptions"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          lang: string;
          status: OrderStatus;
          delivery_type: DeliveryType;
          branch_id: string | null;
          delivery_method_id: string | null;
          delivery_address: string | null;
          comment: string | null;
          internal_notes: string | null;
          promo_code_id: number | null;
          promo_code: string | null;
          discount_usd: number;
          subtotal_usd: number;
          delivery_fee_usd: number;
          total_usd: number;
          usd_to_uzs_rate: number | null;
          total_uzs: number | null;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          estimated_ready_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "order_number" | "created_at" | "updated_at"> & {
          id?: string;
          order_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: string | null;
          product_slug: string;
          product_name_uz: string;
          product_name_ru: string;
          brand: string;
          image_url: string | null;
          unit_price_usd: number;
          quantity: number;
          total_price_usd: number;
          prep_days: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: number;
          order_id: string;
          previous_status: OrderStatus | null;
          new_status: OrderStatus;
          changed_by_profile_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["order_status_history"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["order_status_history"]["Row"]>;
        Relationships: [];
      };
      payment_transactions: {
        Row: {
          id: number;
          order_id: string;
          provider: "payme" | "click";
          payme_trans_id: string | null;
          payme_state: number | null;
          payme_create_time: number | null;
          payme_perform_time: number | null;
          payme_cancel_time: number | null;
          payme_reason: number | null;
          click_trans_id: number | null;
          click_paydoc_id: number | null;
          click_state: number | null;
          amount: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_id: string;
          provider: "payme" | "click";
          payme_trans_id?: string | null;
          payme_state?: number | null;
          payme_create_time?: number | null;
          payme_perform_time?: number | null;
          payme_cancel_time?: number | null;
          payme_reason?: number | null;
          click_trans_id?: number | null;
          click_paydoc_id?: number | null;
          click_state?: number | null;
          amount: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          user_id: string | null;
          user_email: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Json;
          new_values: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
        Relationships: [];
      };
      payments_log: {
        Row: {
          id: number;
          order_id: string | null;
          provider: string;
          method: string;
          request_payload: Json;
          response_payload: Json;
          status: string;
          transaction_id: string | null;
          amount: number | null;
          error_code: number | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id?: string | null;
          provider: string;
          method: string;
          request_payload?: Json;
          response_payload?: Json;
          status: string;
          transaction_id?: string | null;
          amount?: number | null;
          error_code?: number | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments_log"]["Row"]>;
        Relationships: [];
      };
      sms_log: {
        Row: {
          id: number;
          order_id: string | null;
          phone: string;
          message: string;
          provider: string;
          status: SmsStatus;
          attempt_count: number;
          external_id: string | null;
          error_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sms_log"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sms_log"]["Row"]>;
        Relationships: [];
      };
      sms_templates: {
        Row: {
          id: string;
          template_uz: string;
          template_ru: string;
          is_enabled: boolean;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["sms_templates"]["Row"];
        Update: Partial<Database["public"]["Tables"]["sms_templates"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      check_rate_limit: {
        Args: {
          p_ip: string;
          p_action: string;
          p_max_count: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      create_order_rpc: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_email?: string | null;
          p_lang?: string;
          p_delivery_type?: DeliveryType;
          p_branch_id?: string | null;
          p_delivery_method_id?: string | null;
          p_delivery_address?: string | null;
          p_comment?: string | null;
          p_payment_method?: PaymentMethod;
          p_promo_code?: string | null;
          p_items?: Json;
        };
        Returns: Json;
      };
      update_order_status_secure: {
        Args: {
          p_order_id: string;
          p_new_status: OrderStatus;
          p_reason?: string | null;
          p_internal_notes?: string | null;
          p_estimated_ready_date?: string | null;
        };
        Returns: Json;
      };
      validate_promo_code_rpc: {
        Args: {
          p_code: string;
          p_subtotal_usd: number;
          p_customer_phone?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      movement_type: MovementType;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      delivery_type: DeliveryType;
      discount_type: DiscountType;
      sms_status: SmsStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
