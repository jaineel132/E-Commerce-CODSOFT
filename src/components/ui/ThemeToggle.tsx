'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-5 w-5" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative text-muted-foreground hover:text-foreground transition-colors duration-200 active:scale-90"
      aria-label="Toggle theme"
    >
      <div className="transition-transform duration-200" key={isDark ? 'moon' : 'sun'}>
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </div>
    </button>
  )
}
