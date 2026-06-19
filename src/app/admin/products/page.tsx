'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Package as PackageIcon } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { ProductForm } from '@/components/admin/ProductForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/products/Pagination'
import type { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback((p: number) => {
    setLoading(true)
    fetch(`/api/products?page=${p}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 0)
        setPage(data.page ?? p)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleSaved = () => {
    setModalOpen(false)
    setEditingProduct(null)
    fetchProducts(page > 1 && products.length <= 1 ? page - 1 : page)
  }

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage)
  }

  return (
    <Skeleton name="admin-products" loading={loading}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-foreground">Products</h1>
            <p className="mt-1 text-sm text-foreground-muted">{total} products total</p>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setModalOpen(true) }}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[0.98] hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/50 bg-card shadow-sm ring-1 ring-inset ring-border/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Product</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Category</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Price</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Stock</th>
                <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Status</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/50 ring-1 ring-inset ring-border/20">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <PackageIcon className="h-4 w-4 text-foreground-muted" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground-muted">{product.category?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-foreground">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-foreground">{product.stock_count}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/20' : 'bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/20'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        onClick={() => { setEditingProduct(product); setModalOpen(true) }}
                        className="rounded-md p-2 text-foreground-muted hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-md p-2 text-foreground-muted hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-foreground-muted">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <ProductForm
            product={editingProduct || undefined}
            onClose={() => { setModalOpen(false); setEditingProduct(null) }}
            onSaved={handleSaved}
          />
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </Skeleton>
  )
}
