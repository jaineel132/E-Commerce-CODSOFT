'use client'

import { useEffect, useState } from 'react'
import { User, Edit3, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { QuickLinksSection } from '@/components/profile/QuickLinksSection'
import { AddressSection } from '@/components/profile/AddressSection'
import type { Profile, Address } from '@/types'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile)
        setFullName(data.profile?.full_name || '')
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))

    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      if (res.ok) setAddresses(data.addresses)
      else toast.error(data.error || 'Failed to load addresses')
    } catch {
      toast.error('Failed to load addresses')
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleSaveAddress = async (data: Partial<Address>) => {
    if (editingAddress) {
      const res = await fetch(`/api/addresses/${editingAddress.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Address updated!')
    } else {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Address added!')
    }
    setEditingAddress(null)
    loadAddresses()
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('Address deleted!')
      loadAddresses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete address')
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success('Default address updated!')
      loadAddresses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set default address')
    }
  }

  const handleSaveName = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data.profile)
      toast.success('Name updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer mb-10 h-8 w-40 rounded" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="skeleton-shimmer h-64 rounded-[20px]" />
            <div className="skeleton-shimmer h-36 rounded-[20px]" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton-shimmer h-20 rounded-[20px]" />
            <div className="skeleton-shimmer h-20 rounded-[20px]" />
            <div className="skeleton-shimmer h-20 rounded-[20px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 pb-6 border-b border-border flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="display-sm text-foreground">
            My Profile
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard profile={profile} userEmail={user?.email} />

          <QuickLinksSection />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm ring-1 ring-inset ring-border/50">
            <h3 className="mb-6 flex items-center gap-2 text-[16px] font-semibold text-foreground">
              <Edit3 className="h-5 w-5 text-primary" />
              Personal Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-[12px] font-medium uppercase tracking-wider text-foreground-muted">Email</label>
                <p className="mt-2 text-[15px] text-foreground">{profile?.email || user?.email}</p>
              </div>
              <div>
                <label className="text-[12px] font-medium uppercase tracking-wider text-foreground-muted">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-[12px] border border-border bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveName}
                  disabled={saving || fullName === (profile?.full_name || '')}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <AddressSection
            addresses={addresses}
            loadingAddresses={loadingAddresses}
            onDelete={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
            onEdit={(a) => { setEditingAddress(a); setAddressFormOpen(true) }}
            onSave={handleSaveAddress}
            formOpen={addressFormOpen}
            editingAddress={editingAddress}
            onFormClose={() => { setAddressFormOpen(false); setEditingAddress(null) }}
            onAddClick={() => { setEditingAddress(null); setAddressFormOpen(true) }}
          />
        </div>
      </div>
    </div>
  )
}