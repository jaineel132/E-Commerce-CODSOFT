'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Camera, Loader2, Check, MapPin, Plus, Package, Heart, Clock, Shield, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { AddressCard } from '@/components/address/AddressCard'
import { AddressForm } from '@/components/address/AddressForm'
import type { Profile, Address } from '@/types'

function formatMemberSince(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const quickLinks = [
  { href: '/orders', label: 'Orders', icon: Package, description: 'Track your purchases' },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, description: 'Saved for later' },
  { href: '/recently-viewed', label: 'Recently Viewed', icon: Clock, description: 'Continue browsing' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

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
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      toast.success('Address updated!')
    } else {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
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
      setEditingName(false)
      toast.success('Name updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile((prev) => prev ? { ...prev, avatar_url: data.avatar_url } : prev)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer mb-10 h-8 w-40 rounded" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="skeleton-shimmer h-64 rounded-2xl" />
            <div className="skeleton-shimmer h-36 rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton-shimmer h-20 rounded-xl" />
            <div className="skeleton-shimmer h-20 rounded-xl" />
            <div className="skeleton-shimmer h-20 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 font-serif text-2xl font-bold tracking-tight text-foreground"
      >
        My Profile
      </motion.h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — Profile card + quick links */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {/* Decorative gradient strip */}
            <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10" />

            <div className="-mt-12 flex flex-col items-center px-6 pb-6">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Avatar"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Name */}
              {editingName ? (
                <div className="flex w-full items-center gap-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') { setFullName(profile?.full_name || ''); setEditingName(false) }
                    }}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-center text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving || fullName === (profile?.full_name || '')}
                    className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="group text-center transition-colors hover:text-primary"
                >
                  <h2 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {profile?.full_name || 'Set your name'}
                  </h2>
                </button>
              )}

              {/* Email */}
              <p className="mt-1 text-sm text-muted-foreground">{profile?.email || user?.email}</p>

              {/* Meta chips */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  {profile?.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Member since {profile?.created_at ? formatMemberSince(profile.created_at) : '—'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <h3 className="mb-3 px-2 font-serif text-sm font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group"
                >
                  <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1">
                    <span className="block text-foreground">{link.label}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{link.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column — Edit form + addresses */}
        <div className="lg:col-span-2 space-y-8">
          {/* Name & email info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-5 font-serif text-base font-bold text-foreground">Personal Information</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="email-readonly" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                <p id="email-readonly" className="mt-1 text-sm text-foreground">{profile?.email || user?.email}</p>
              </div>

              <div>
                <label htmlFor="fullName-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  id="fullName-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveName}
                  disabled={saving || fullName === (profile?.full_name || '')}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Addresses section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-serif text-base font-bold text-foreground">My Addresses</h2>
                {addresses.length > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {addresses.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null)
                  setAddressFormOpen(true)
                }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                {addresses.map((address, i) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                  >
                    <AddressCard
                      address={address}
                      onEdit={(a) => {
                        setEditingAddress(a)
                        setAddressFormOpen(true)
                      }}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefaultAddress}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border py-14">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mb-1 text-sm font-medium text-foreground">No addresses yet</p>
                <p className="mb-4 text-xs text-muted-foreground">Add a shipping address for faster checkout</p>
                <button
                  onClick={() => { setEditingAddress(null); setAddressFormOpen(true) }}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AddressForm
        address={editingAddress}
        open={addressFormOpen}
        onClose={() => {
          setAddressFormOpen(false)
          setEditingAddress(null)
        }}
        onSave={handleSaveAddress}
      />
    </div>
  )
}
