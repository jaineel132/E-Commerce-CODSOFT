'use client'

import { Home, MapPin, Pencil, Trash2, Star } from 'lucide-react'
import type { Address } from '@/types'

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

const labelIcons: Record<string, typeof Home> = {
  Home,
  Work: MapPin,
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const LabelIcon = labelIcons[address.label] || Home

  return (
    <div className="relative rounded-xl border border-border bg-card p-5">
      {address.is_default && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <Star className="h-3 w-3 fill-primary" />
          Default
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
          <LabelIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{address.label}</span>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{address.full_name}</p>
        <p>{address.street}</p>
        <p>{address.city}, {address.state} {address.zip_code}</p>
        <p>{address.country}</p>
        {address.phone && <p className="pt-1 text-xs">{address.phone}</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Star className="h-3.5 w-3.5" />
            Set Default
          </button>
        )}
      </div>
    </div>
  )
}
