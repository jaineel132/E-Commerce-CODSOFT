'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

import { X, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/types'

interface ProductFormProps {
  product?: Product
  onClose: () => void
  onSaved: () => void
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const isEdit = !!product
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {})
  }, [])

  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(String(product?.price || ''))
  const [categoryId, setCategoryId] = useState(product?.category_id || '')
  const [imageUrl, setImageUrl] = useState(product?.image_url || '')
  const [stockCount, setStockCount] = useState(String(product?.stock_count ?? 0))
  const [isActive, setIsActive] = useState(product?.is_active ?? true)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
    } catch {
      setError('Failed to upload image. Make sure the storage bucket is set up.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !price) {
      setError('Name and price are required')
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    setSaving(true)

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        category_id: categoryId,
        image_url: imageUrl || null,
        stock_count: parseInt(stockCount, 10) || 0,
        is_active: isActive,
      }

      if (isEdit) {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update product')
        }

        const nameChanged = name.trim() !== product.name
        const descChanged = (description.trim() || null) !== (product.description || null)

        if (nameChanged || descChanged) {
          await fetch(`/api/products/${product.id}/embedding`, {
            method: 'POST',
          })
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create product')
        }
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-2xl rounded-[24px] border border-border/50 bg-card p-6 sm:p-8 shadow-2xl ring-1 ring-inset ring-border/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground tracking-tight">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-foreground-muted mt-1">
              {isEdit ? 'Update product details and inventory.' : 'Create a new product listing in your store.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-foreground-muted hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
            {/* Left Column: Image */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Product Image
              </label>
              <div 
                className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${imageUrl ? 'border-border/0' : 'border-border hover:border-primary hover:bg-primary/5'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <>
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <span className="text-sm font-medium text-white">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-foreground-muted">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 opacity-50" />
                        <span className="text-xs font-medium">Upload Image</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border-0 bg-secondary/50 px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all placeholder:text-foreground-muted/50"
                  placeholder="e.g. Minimalist Keyboard"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border-0 bg-secondary/50 px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all resize-none placeholder:text-foreground-muted/50"
                  placeholder="Describe the product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full rounded-xl border-0 bg-secondary/50 pl-8 pr-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all tabular-nums"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    min="0"
                    className="w-full rounded-xl border-0 bg-secondary/50 px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all tabular-nums"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border-0 bg-secondary/50 px-4 py-2.5 text-sm text-foreground ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-inset focus:ring-primary outline-none transition-all appearance-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${isActive ? 'bg-primary' : 'bg-secondary'}`}
                >
                  <span className="sr-only">Active Status</span>
                  <span aria-hidden="true" className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-border/10 bg-white shadow ring-0 transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm font-medium text-foreground">
                  Active <span className="text-foreground-muted font-normal">(visible in store)</span>
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border/50 pt-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-foreground-muted hover:bg-secondary hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
