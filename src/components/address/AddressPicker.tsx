'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Check, Loader2 } from 'lucide-react'
import { AddressForm } from './AddressForm'
import type { Address } from '@/types'

interface AddressPickerProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function AddressPicker({ selectedId, onSelect }: AddressPickerProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    fetch('/api/addresses')
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || [])
        const defaultAddr = data.addresses?.find((a: Address) => a.is_default)
        if (defaultAddr && !selectedId) {
          onSelect(defaultAddr.id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedId, onSelect])

  const handleSaveAddress = async (data: Partial<Address>) => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    setFormOpen(false)
    const refresh = await fetch('/api/addresses')
    const refreshed = await refresh.json()
    setAddresses(refreshed.addresses || [])
    onSelect(result.address.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Shipping Address
        </h2>
        {addresses.length > 0 && (
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add new
          </button>
        )}
      </div>

      {addresses.length > 0 ? (
        <div className="space-y-2">
          {addresses.map((address) => (
            <button
              key={address.id}
              onClick={() => onSelect(address.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                selectedId === address.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 text-sm">
                  <p className="font-medium text-foreground">{address.full_name}</p>
                  <p className="text-muted-foreground">{address.street}</p>
                  <p className="text-muted-foreground">
                    {address.city}, {address.state} {address.zip_code}
                  </p>
                  {address.phone && (
                    <p className="text-xs text-muted-foreground">{address.phone}</p>
                  )}
                </div>
                {selectedId === address.id && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <MapPin className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="mb-3 text-sm text-muted-foreground">No addresses saved yet</p>
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add an address
          </button>
        </div>
      )}

      <AddressForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  )
}
