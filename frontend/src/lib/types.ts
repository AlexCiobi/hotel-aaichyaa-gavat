export type Language = 'mr' | 'en'

export type MenuCategory =
  | 'VEG'
  | 'NON_VEG_PLATTER'
  | 'CHICKEN_HANDI'
  | 'MUTTON_HANDI'
  | 'MUTTON_PLATE'
  | 'EGG'
  | 'RICE'
  | 'BREAD'
  | 'OTHERS'

export interface MenuItem {
  id: string
  category: MenuCategory
  price: number
  is_veg: boolean
  is_available: boolean
  image_url: string
  name_mr: string
  name_en: string
  description_mr: string
  description_en: string
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
}

export type TableZone = 'Main' | 'Window' | 'Private' | 'Outdoor'
export type TableStatus = 'available' | 'occupied' | 'reserved'

export interface RestaurantTable {
  id: string
  number: number
  zone: TableZone
  capacity: number
  status: TableStatus
}

export type OrderType = 'dine-in' | 'takeaway'

export interface Order {
  id?: string
  order_number?: string
  customer_name: string
  whatsapp_number: string
  order_type: OrderType
  table_number?: number
  items: OrderItem[]
  subtotal: number
  special_instructions?: string
  payment_method: 'cod' | 'online'
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered'
  created_at?: string
}

export type OccasionType = 'none' | 'birthday' | 'anniversary' | 'business' | 'other'

export interface Reservation {
  id?: string
  booking_ref?: string
  customer_name: string
  whatsapp_number: string
  date: string
  time: string
  guest_count: number
  occasion: OccasionType
  preferred_table?: number
  special_requests?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
  created_at?: string
}

export interface Offer {
  id: string
  title_mr: string
  title_hi: string
  title_en: string
  title_kn: string
  description_mr: string
  description_hi: string
  description_en: string
  description_kn: string
  discount_pct?: number
  discount_flat?: number
  valid_until?: string
  is_active: boolean
  image_url?: string
  applicable_to?: string
}
