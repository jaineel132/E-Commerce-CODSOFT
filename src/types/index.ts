export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  stock_count: number
  is_active: boolean
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
}

export interface CartItemWithProduct extends CartItem {
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock_count'>
}

export interface Order {
  id: string
  user_id: string
  stripe_session: string
  total_amount: number
  status: 'pending' | 'shipped' | 'delivered'
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface WishlistItemWithProduct extends WishlistItem {
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock_count'>
}

export interface RecentlyViewed {
  id: string
  user_id: string
  product_id: string
  viewed_at: string
}

export interface RecentlyViewedWithProduct extends RecentlyViewed {
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock_count'>
}

export interface Address {
  id: string
  user_id: string
  label: string
  full_name: string
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  phone: string | null
  is_default: boolean
  created_at: string
}
