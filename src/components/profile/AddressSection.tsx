'use client'

import { MapPin, Plus } from 'lucide-react'
import { AddressCard } from '@/components/address/AddressCard'
import { AddressForm } from '@/components/address/AddressForm'
import type { Address } from '@/types'

interface AddressSectionProps {
  addresses: Address[]
  loadingAddresses: boolean
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  onEdit: (address: Address) => void
  onSave: (data: Partial<Address>) => Promise<void>
  formOpen: boolean
  editingAddress: Address | null
  onFormClose: () => void
  onAddClick: () => void
}

export function AddressSection({
  addresses,
  loadingAddresses,
  onDelete,
  onSetDefault,
  onEdit,
  onSave,
  formOpen,
  editingAddress,
  onFormClose,
  onAddClick,
}: AddressSectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-serif text-base font-bold text-foreground">My Addresses</h2>
          {addresses.length > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {addresses.length}
            </span>
          )}
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {loadingAddresses ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-44 rounded-2xl" />
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id}>
              <AddressCard
                address={address}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-2 text-base font-medium text-foreground">
            No addresses yet
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Add a shipping address for faster checkout
          </p>
          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      )}

      <AddressForm
        address={editingAddress}
        open={formOpen}
        onClose={onFormClose}
        onSave={onSave}
      />
    </div>
  )
}