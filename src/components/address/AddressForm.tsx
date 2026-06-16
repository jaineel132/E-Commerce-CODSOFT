'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Address } from '@/types'

interface AddressFormProps {
  address?: Address | null
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Address>) => Promise<void>
}

const defaultForm = {
  label: 'Home',
  full_name: '',
  street: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'US',
  phone: '',
  is_default: false,
}

type FormData = typeof defaultForm

export function AddressForm({ address, open, onClose, onSave }: AddressFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (address) {
      setForm({
        label: address.label,
        full_name: address.full_name,
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        country: address.country,
        phone: address.phone || '',
        is_default: address.is_default,
      })
    } else {
      setForm(defaultForm)
    }
  }, [address, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        phone: form.phone || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-foreground">
            {address ? 'Edit Address' : 'Add Address'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            {['Home', 'Work'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => update('label', l)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  form.label === l
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Street Address</label>
            <input
              required
              value={form.street}
              onChange={(e) => update('street', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">State</label>
              <input
                required
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">ZIP Code</label>
              <input
                required
                value={form.zip_code}
                onChange={(e) => update('zip_code', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="10001"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Country</label>
              <input
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="US"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Phone (optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => update('is_default', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Set as default address
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {address ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
