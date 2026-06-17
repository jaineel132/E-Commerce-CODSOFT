'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { User, Camera, Loader2, Check, Shield, Calendar } from 'lucide-react'

import type { Profile } from '@/types'

function formatMemberSince(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

interface ProfileCardProps {
  profile: Profile | null
  userEmail?: string
}

export function ProfileCard({ profile, userEmail }: ProfileCardProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

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
      window.location.reload()
    } catch {
      // silently fail
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
      setEditingName(false)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in-up group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300"
    >
      <div className="h-20 bg-gradient-to-br from-primary/30 via-primary/15 to-accent/20"
      />

      <div className="relative -mt-12 flex flex-col items-center px-6 pb-6">
        <div className="relative mb-4 transition-transform duration-200 hover:scale-105 active:scale-95"
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all hover:shadow-xl hover:scale-110 active:scale-90 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            ) : (
              <Camera className="h-4 w-4 text-primary-foreground" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

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
              className="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-center text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSaveName}
              disabled={saving || fullName === (profile?.full_name || '')}
              className="rounded-lg bg-primary p-1.5 text-primary-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 0) }}
            className="group text-center transition-colors hover:text-primary"
          >
            <h2 className="font-serif text-lg font-bold text-foreground transition-colors group-hover:text-primary">
              {profile?.full_name || 'Set your name'}
            </h2>
          </button>
        )}

        <p className="mt-2 text-sm text-muted-foreground">
          {profile?.email || userEmail}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" />
            {profile?.role === 'admin' ? 'Admin' : 'Customer'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Calendar className="h-3 w-3" />
            Member since {profile?.created_at ? formatMemberSince(profile.created_at) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}