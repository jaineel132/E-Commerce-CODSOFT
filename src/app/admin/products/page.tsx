'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ProductForm } from '@/components/admin/ProductForm'
import { Skeleton } from 'boneyard-js/react'
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
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} products total</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setModalOpen(true) }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Active</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? ''}</td>
                <td className="px-4 py-3 text-right text-foreground">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-right text-foreground">{product.stock_count}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex h-2 w-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditingProduct(product); setModalOpen(true) }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
