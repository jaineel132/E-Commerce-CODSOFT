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
  category_id: string
  category: { name: string; slug: string } | null
  image_url: string | null
  stock_count: number
  is_active: boolean
  created_at: string
}

export interface CartItemWithProduct {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock_count'>
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export interface WishlistItemWithProduct {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock_count'>
}

export interface RecentlyViewedWithProduct {
  id: string
  user_id: string
  product_id: string
  viewed_at: string
  product: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'stock_count'>
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  product_count?: number
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

export interface ReviewWithUser {
  id: string
  product_id: string
  user_id: string
  rating: number
  title: string | null
  body: string | null
  is_verified_purchase: boolean
  created_at: string
  user: Pick<Profile, 'full_name'>
}
