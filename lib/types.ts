export type UserRole = 'rabbi' | 'beauty_pro' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due'
export type AppointmentStatus = 'pending' | 'provider_confirmed' | 'user_confirmed' | 'cancelled'

export interface BackofficeUser {
  id: string
  role: UserRole
  linked_entity_id: string
  subscription_status: SubscriptionStatus | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface Appointment {
  id: string
  provider_id: string
  user_id: string
  slot_start: string
  slot_end: string
  status: AppointmentStatus
  provider_confirmed_at: string | null
  user_confirmed_at: string | null
  note: string
  service_name: string | null
  service_price: number | null
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  provider_id: string
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
  start_time: string
  end_time: string
}

export interface BlockedDate {
  id: string
  provider_id: string
  blocked_date: string
  reason: string | null
}

export interface ServiceProvider {
  id: string
  user_id: string | null
  name: string
  specialty: string
  city: string
  phone: string | null
  bio: string | null
  portfolio_paths: string[]
  is_available: boolean
}

export interface Rabbi {
  id: string
  user_id: string | null
  name: string
  specialty: string | null
  is_available: boolean
}

export interface Conversation {
  id: string
  user_id: string
  rabbi_id: string
  created_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_type: 'user' | 'rabbi'
  content: string
  created_at: string
}
