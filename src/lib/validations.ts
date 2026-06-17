import { z } from 'zod'
import type { NextRequest } from 'next/server'

export async function parseBody<T>(request: NextRequest, schema: z.ZodSchema<T>): Promise<{ data: T; error: Response | null }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { data: null as unknown as T, error: Response.json({ error: messages }, { status: 400 }) }
    }
    return { data: null as unknown as T, error: Response.json({ error: 'Invalid request body' }, { status: 400 }) }
  }
}

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional().default(''),
  price: z.number().min(0, 'Price must be non-negative'),
  category_id: z.string().uuid('Invalid category'),
  image_url: z.string().url().optional().default(''),
  stock_count: z.number().int().min(0).optional().default(0),
  is_active: z.boolean().optional(),
})

export const productPatchSchema = productSchema.partial()

export const cartAddSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

export const cartUpdateSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const addressSchema = z.object({
  label: z.string().min(1).max(50).optional().default('Home'),
  full_name: z.string().min(1, 'Full name is required').max(255),
  street: z.string().min(1, 'Street is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  zip_code: z.string().min(1, 'ZIP code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().max(20).optional().default(''),
  is_default: z.boolean().optional(),
})

export const addressPatchSchema = addressSchema.partial()

export const profileUpdateSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(255),
})

export const checkoutSchema = z.object({
  address_id: z.string().uuid('Invalid address ID'),
})

export const adminOrderUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  tracking_number: z.string().max(100).optional(),
  tracking_carrier: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(255).optional().default(''),
  body: z.string().max(5000).optional().default(''),
})

export const wishlistSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

export const recentlyViewedSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

export const searchSchema = z.object({
  query: z.string().min(1, 'Query is required').max(500),
})