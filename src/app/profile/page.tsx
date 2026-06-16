'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Camera, Loader2, Check, MapPin, Plus, Package, Heart, Clock, Shield, Calendar, Edit3, ChevronRight, Award, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { AddressCard } from '@/components/address/AddressCard'
import { AddressForm } from '@/components/address/AddressForm'
import type { Profile, Address } from '@/types'

function formatMemberSince(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const quickLinks = [
  { href: '/orders', label: 'Orders', icon: Package, description: 'Track your purchases', color: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { href: '/wishlist', label: 'Wishlist', icon: Heart, description: 'Saved for later', color: 'from-rose-50 to-pink-50', iconColor: 'text-rose-600', borderColor: 'border-rose-200' },
  { href: '/recently-viewed', label: 'Recently Viewed', icon: Clock, description: 'Continue browsing', color: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600', borderColor: 'border-amber-200' },
]

function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([])

  useEffect(() => {
    if (trigger) {
      const colors = ['#2D5A4A', '#D97757', '#FAFAF8', '#10B981', '#F59E0B']
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 2000)
    }
  }, [trigger])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: `${p.x}%`, y: `${p.y}%` }}
          animate={{ opacity: 0, scale: 1, x: `${p.x + (Math.random() - 0.5) * 40}%`, y: `${p.y + 50 + Math.random() * 50}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute rounded-full"
          style={{ backgroundColor: p.color, width: p.size, height: p.size }}
        />
      ))}
    </div>
  )
}

function SuccessAnimation({ trigger }: { trigger: boolean }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      setTimeout(() => setShow(false), 2000)
    }
  }, [trigger])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-accent/90 p-8 shadow-2xl backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Success!</h3>
              <p className="text-sm text-white/90">Your changes have been saved</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

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
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const profileCardRef = useRef<HTMLDivElement>(null)

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
      setShowSuccess(true)
      setShowConfetti(true)
      toast.success('Address updated!')
    } else {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setShowSuccess(true)
      setShowConfetti(true)
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
      setShowSuccess(true)
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
      setShowSuccess(true)
      setShowConfetti(true)
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
      setShowSuccess(true)
      setShowConfetti(true)
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
      setShowSuccess(true)
      setShowConfetti(true)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleMouseEnter = () => {
    if (profileCardRef.current) {
      profileCardRef.current.style.transform = 'translateY(-4px) scale(1.02)'
    }
  }

  const handleMouseLeave = () => {
    if (profileCardRef.current) {
      profileCardRef.current.style.transform = 'translateY(0) scale(1)'
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
      <Confetti trigger={showConfetti} />
      <SuccessAnimation trigger={showSuccess} />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-foreground"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
          <User className="h-5 w-5 text-primary-foreground" />
        </div>
        My Profile
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="ml-2"
        >
          <Sparkles className="h-6 w-6 text-primary" />
        </motion.div>
      </motion.h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column — Profile card + quick links */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile hero card with enhanced interactions */}
          <motion.div
            ref={profileCardRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: 'spring', damping: 20 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300"
          >
            {/* Decorative gradient strip with animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="h-20 bg-gradient-to-br from-primary/30 via-primary/15 to-accent/20"
            />

            <div className="relative -mt-12 flex flex-col items-center px-6 pb-6">
              {/* Avatar with glow effect */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative mb-4"
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-lg transition-shadow group-hover:shadow-xl">
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
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {uploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
                      <Camera className="h-4 w-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </motion.div>

              {/* Name with edit animation */}
              {editingName ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex w-full items-center gap-2"
                >
                  <motion.input
                    ref={nameInputRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') { setFullName(profile?.full_name || ''); setEditingName(false) }
                    }}
                    className="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-center text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                    whileTap={{ scale: 0.98 }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#2D5A4A' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSaveName}
                    disabled={saving || fullName === (profile?.full_name || '')}
                    className="rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
                  >
                    <motion.div whileHover={{ rotate: 360 }} whileTap={{ rotate: -360 }} transition={{ duration: 0.3 }}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </motion.div>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, color: '#2D5A4A' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingName(true)}
                  className="group text-center transition-colors hover:text-primary"
                >
                  <motion.h2
                    whileHover={{ textShadow: '0 0 8px rgba(45, 90, 74, 0.3)' }}
                    className="font-serif text-lg font-bold text-foreground transition-colors group-hover:text-primary"
                  >
                    {profile?.full_name || 'Set your name'}
                  </motion.h2>
                  <motion.div
                    whileHover={{ width: '100%' }}
                    className="mx-auto mt-1 h-0.5 w-0 bg-primary/30 transition-all duration-300"
                  />
                </motion.button>
              )}

              {/* Email with subtle animation */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-sm text-muted-foreground"
              >
                {profile?.email || user?.email}
              </motion.p>

              {/* Meta chips with hover effects */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 flex flex-wrap items-center justify-center gap-2"
              >
                <motion.span
                  whileHover={{ scale: 1.05, backgroundColor: '#2D5A4A', color: 'white' }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Shield className="h-3 w-3" />
                  </motion.div>
                  {profile?.role === 'admin' ? 'Admin' : 'Customer'}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, backgroundColor: '#D97757', color: 'white' }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Calendar className="h-3 w-3" />
                  </motion.div>
                  Member since {profile?.created_at ? formatMemberSince(profile.created_at) : '—'}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick links with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, type: 'spring', damping: 20 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h3 className="mb-4 px-2 font-serif text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Quick Links
            </h3>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30"
                  >
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      whileTap={{ rotate: -5, scale: 0.9 }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.color} ${link.iconColor} shadow-sm group-hover:shadow-md transition-shadow ${link.borderColor} border`}
                    >
                      <link.icon className="h-5 w-5" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                      <span className="block text-xs font-normal text-muted-foreground">{link.description}</span>
                    </div>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column — Edit form + addresses */}
        <div className="lg:col-span-2 space-y-8">
          {/* Name & email info card with enhanced interactions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, type: 'spring', damping: 20 }}
            whileHover={{ y: -2, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300"
          >
            <h3 className="mb-6 font-serif text-base font-bold text-foreground flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Edit3 className="h-5 w-5 text-primary" />
              </motion.div>
              Personal Information
            </h3>

            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label htmlFor="email-readonly" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                <p id="email-readonly" className="mt-1.5 text-sm text-foreground">{profile?.email || user?.email}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label htmlFor="fullName-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</label>
                <motion.input
                  id="fullName-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                  whileFocus={{ scale: 1.01, borderColor: '#2D5A4A' }}
                  whileTap={{ scale: 0.99 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-end pt-2"
              >
                <motion.button
                  onClick={handleSaveName}
                  disabled={saving || fullName === (profile?.full_name || '')}
                  whileHover={{ scale: 1.02, backgroundColor: '#2D5A4A' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      whileTap={{ rotate: -360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  )}
                  Save Changes
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Addresses section with enhanced animations */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, type: 'spring', damping: 20 }}
          >
            <motion.div
              className="mb-4 flex items-center justify-between"
              whileHover={{ x: 2 }}
            >
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ gap: 5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  whileTap={{ rotate: -5, scale: 0.9 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                </motion.div>
                <h2 className="font-serif text-base font-bold text-foreground">My Addresses</h2>
                {addresses.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1, backgroundColor: '#2D5A4A', color: 'white' }}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-all duration-200"
                  >
                    {addresses.length}
                  </motion.span>
                )}
              </motion.div>
              <motion.button
                onClick={() => {
                  setEditingAddress(null)
                  setAddressFormOpen(true)
                }}
                whileHover={{ scale: 1.05, backgroundColor: '#2D5A4A' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="h-4 w-4" />
                </motion.div>
                Add
              </motion.button>
            </motion.div>

            {loadingAddresses ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="skeleton-shimmer h-44 rounded-2xl"
                  />
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((address, i) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.05 * i, type: 'spring', damping: 20 }}
                    whileHover={{ y: -4, scale: 1.02, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      whileHover={{ backgroundColor: 'rgba(45, 90, 74, 0.02)' }}
                      transition={{ duration: 0.2 }}
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
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 py-16"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50"
                >
                  <MapPin className="h-6 w-6 text-muted-foreground" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 text-base font-medium text-foreground"
                >
                  No addresses yet
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 text-sm text-muted-foreground"
                >
                  Add a shipping address for faster checkout
                </motion.p>
                <motion.button
                  onClick={() => { setEditingAddress(null); setAddressFormOpen(true) }}
                  whileHover={{ scale: 1.05, backgroundColor: '#2D5A4A' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.div>
                  Add Address
                </motion.button>
              </motion.div>
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
