# Design System — E-Commerce Website
## "Kinetic Minimal" — Unique Visual Identity for Level 3, Task 1

> Design philosophy: a calm, minimal base layer with **purposeful kinetic moments** — every interaction has a tiny payoff. Built entirely with **Tailwind CSS + Framer Motion** (no extra design tools needed).

---

## 1. Design Concept

Most student e-commerce projects copy the generic "Amazon clone" look — white background, blue navbar, default fonts. To stand out, this project uses a concept called **"Kinetic Minimal"**:

- **90% of the UI is calm, clean, and spacious** (soft neutral palette, generous whitespace) — following the 2026 trend toward minimalism and "transparent experiences"
- **10% of the UI has a signature animated moment** that becomes the project's identity — the "fly to cart" animation, the magnetic search bar, and the scroll-reveal product story section

This combination is rare in student projects: most either go fully flashy (overwhelming, looks like a template) or fully plain (boring, looks unfinished). Kinetic Minimal gives reviewers something memorable without sacrificing usability.

---

## 2. Color Palette

Following the 2026 trend toward **soft, muted tones** that build trust and let products stand out:

```css
:root {
  /* Base */
  --color-bg: #FAFAF8;          /* warm off-white, not stark white */
  --color-surface: #FFFFFF;     /* cards, modals */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B6B6B;

  /* Brand - sage + terracotta (calm but distinctive) */
  --color-brand: #2D5A4A;       /* deep sage green - primary actions */
  --color-brand-light: #E8F0EC; /* sage tint - hover states, badges */
  --color-accent: #D97757;      /* warm terracotta - CTAs, sale tags, highlights */
  --color-accent-light: #FBE9E1;

  /* Status */
  --color-success: #4A7C59;
  --color-warning: #D9A05B;     /* "low stock" badge */
  --color-error: #C0564A;

  /* Borders */
  --color-border: #E5E3DE;
}

/* Dark mode */
.dark {
  --color-bg: #15181C;
  --color-surface: #1E2227;
  --color-text-primary: #F2F1ED;
  --color-text-secondary: #9A9A95;
  --color-brand: #6FA98C;
  --color-brand-light: #243530;
  --color-accent: #E89478;
  --color-accent-light: #3A2A24;
  --color-border: #2D3137;
}
```

**Why this palette is unique:** Sage green + terracotta is an unusual but harmonious pairing - it reads as organic/premium (think modern furniture or skincare brands) rather than the generic blue/white that 90% of student e-commerce sites use.

---

## 3. Typography

```css
/* Headings - distinctive serif for premium feel */
font-family: 'Fraunces', serif;       /* Google Font - variable weight 300-900 */

/* Body + UI - clean, highly legible */
font-family: 'Inter', sans-serif;     /* Google Font */
```

| Element | Font | Size (desktop) | Weight |
|---|---|---|---|
| Hero heading | Fraunces | 56px | 600, slight negative letter-spacing |
| Section headings | Fraunces | 32px | 500 |
| Product name (card) | Inter | 16px | 600 |
| Product price | Inter | 18px | 700 |
| Body text | Inter | 15px | 400 |
| Small/labels | Inter | 13px | 500, uppercase, letter-spacing 0.05em |

**Why this is unique:** Pairing a serif display font (Fraunces - has a "soft" optical quality) with Inter creates an editorial, magazine-like feel rather than the typical all-sans-serif "tech startup" look every clone uses.

---

## 4. Signature Animations (The Unique Part)

### 4.1 Star Feature - "Fly to Cart" Add-to-Cart Animation
**The hero animation of this project.**

When a user clicks "Add to Cart":
1. A small clone of the product image **scales down and flies** in a curved arc from the product card to the cart icon in the navbar
2. The cart icon does a quick **bounce + scale pulse** (1 -> 1.3 -> 1) on landing
3. The cart count badge **flips** (3D rotateX) to the new number
4. A subtle **toast notification** slides up from the bottom: "Added to cart"

```tsx
// Using Framer Motion
import { motion, AnimatePresence } from "framer-motion"

const flyToCartVariants = {
  initial: { opacity: 1, scale: 1, x: 0, y: 0 },
  fly: (target: { x: number; y: number }) => ({
    opacity: [1, 1, 0],
    scale: [1, 0.3],
    x: target.x,
    y: target.y,
    transition: { duration: 0.6, ease: [0.45, 0, 0.55, 1] }
  })
}

const cartBounce = {
  bounce: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    transition: { duration: 0.5, ease: "easeOut" }
  }
}
```

**Implementation note:** Calculate the cart icon's screen position with `getBoundingClientRect()`, clone the product image into a `position: fixed` element, animate it to that position, then unmount it.

---

### 4.2 Star Feature - Magnetic AI Search Bar
Ties directly into the **pgvector semantic search** feature.

- The search bar sits centered in the navbar with a **soft glowing border** (animated gradient using `background-position` keyframes - sage to terracotta)
- On focus, the search bar **expands width** (300px -> 480px) with a spring animation
- While the AI is processing the semantic search, show **3 pulsing dots** inside the bar (not a spinner - feels more "AI thinking")
- Results appear in a **dropdown panel that scales in from the top** (`scale: 0.95 -> 1`, `opacity: 0 -> 1`, origin top-center) - staggered entrance for each result row (each row delayed by 40ms)

```tsx
const searchPanelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
}

const resultRowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.2 }
  })
}
```

**Glowing border CSS:**
```css
.ai-search-glow {
  background: linear-gradient(90deg, var(--color-brand), var(--color-accent), var(--color-brand));
  background-size: 200% 100%;
  animation: glow-shift 3s linear infinite;
}
@keyframes glow-shift {
  to { background-position: 200% 0; }
}
```

---

### 4.3 Star Feature - Scroll-Reveal Product Story (Homepage)
Following the **scrollytelling** trend - but lightweight, only on the homepage hero section.

- As the user scrolls past the hero, **3 featured products slide in from alternating sides** (left, right, left) with a fade + slight rotation correction (`rotate: -3deg -> 0deg`)
- Each product image has a subtle **parallax effect** - moves slower than scroll speed (`y: scrollY * 0.3`)
- Use `framer-motion`'s `useScroll` + `useTransform` - no extra library needed

```tsx
import { useScroll, useTransform, motion } from "framer-motion"

const { scrollYProgress } = useScroll({ target: sectionRef })
const y = useTransform(scrollYProgress, [0, 1], [0, -80])  // parallax

<motion.div
  initial={{ opacity: 0, x: -60, rotate: -3 }}
  whileInView={{ opacity: 1, x: 0, rotate: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  style={{ y }}
/>
```

---

### 4.4 Live Stock Pulse (Realtime Feature Tie-in)
Ties into the **Supabase Realtime stock updates** feature.

- When stock count changes in real-time, the `StockBadge` does a **quick yellow flash + scale pulse** to draw attention
- If stock drops to <=3, the badge gets a **subtle continuous pulse animation** (opacity 1 -> 0.6 -> 1, 2s loop) - creates urgency without being annoying

```tsx
const stockUpdateFlash = {
  flash: {
    scale: [1, 1.15, 1],
    backgroundColor: ["var(--color-warning)", "var(--color-accent)", "var(--color-warning)"],
    transition: { duration: 0.6 }
  }
}

const lowStockPulse = {
  pulse: {
    opacity: [1, 0.6, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
}
```

---

### 4.5 Micro-Interactions (Throughout)
Following the **micro-interactions boost conversion** trend:

| Element | Animation | Trigger |
|---|---|---|
| Product card | Lift + shadow grow (`y: -4px`, `shadow: sm -> lg`) | Hover |
| Product image (card) | Slow zoom (`scale: 1 -> 1.05`) | Hover |
| Buttons (primary) | Slight scale down (`scale: 0.97`) | Click/tap |
| Wishlist heart | Pop scale + color fill (`scale: 1 -> 1.3 -> 1`, fill animates) | Click |
| Category filter chip | Background color morph | Hover/select |
| Page transitions | Fade + slight scale (`opacity 0->1`, `scale 0.98->1`) | Route change |
| Quantity stepper | Number flip (rotateX 90deg out/in) | +/- click |
| Theme toggle | Sun/moon icon morph (rotate + scale crossfade) | Click |

---

## 5. Layout & Components

### 5.1 Navbar
- Sticky, `backdrop-blur` glass effect (`bg-white/70 dark:bg-zinc-900/70`)
- Logo (left) - wordmark in Fraunces
- AI Search bar (center, magnetic - see 4.2)
- Right: theme toggle, wishlist icon, cart icon (with animated badge), user avatar/login

### 5.2 Homepage
1. **Hero section** - large Fraunces headline, soft gradient background blob (animated, slow drift using `motion.div` with infinite x/y keyframes), CTA button
2. **Scroll-reveal featured products** (see 4.3) - 3 products, alternating layout
3. **Category showcase** - horizontal scroll row of category cards with hover-zoom images
4. **"Recently Viewed"** section (logged-in users) - horizontal scroll
5. Footer

### 5.3 Product Listing Page
- Left sidebar: filters (category checkboxes with morph animation, price range slider with custom-styled thumb)
- Right: responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
- Each card: image (hover zoom), name, price, stock badge (with pulse if low), wishlist heart (top-right corner, pop animation), "Add to Cart" button (fly animation on click)
- **Skeleton loaders**: animated shimmer (gradient sweep) while loading - not plain gray boxes

### 5.4 Product Detail Page
- Left: large image with **subtle hover-zoom on cursor position** (image pans slightly based on mouse position - `framer-motion` `useMotionValue`)
- Right: name (Fraunces), price (large, Inter bold), stock badge (realtime), description, quantity stepper (animated flip), Add to Cart (fly animation), Add to Wishlist
- Below: "You might also like" - AI-powered similar products using pgvector similarity to current product

### 5.5 Cart Page
- Each cart item **slides out to the left and fades** when removed (`exit: { x: -100, opacity: 0 }` with `AnimatePresence`)
- Quantity changes animate the subtotal number with a **count-up/count-down** effect
- Empty cart state: simple line-art illustration (SVG) with gentle floating animation (`y: [0, -8, 0]`, infinite loop, 3s)

### 5.6 Checkout Success Page
- Animated **checkmark draw-in** (SVG path animation - `pathLength: 0 -> 1`)
- Confetti burst (lightweight, CSS-only - small colored squares falling with `rotate` + `y` keyframes, no heavy library)

### 5.7 Admin Dashboard
- Stat cards **count up** from 0 to actual value on page load (`framer-motion` + `useEffect` with `requestAnimationFrame` or a simple count-up hook)
- Charts (Recharts) fade + slide in on mount

---

## 6. Dark Mode Behavior

- Toggle in navbar - sun/moon icon **morphs** (not just swaps) using a crossfade + rotate
- Theme transition: when toggled, apply a brief `transition: background-color 0.3s, color 0.3s` to `<html>` so colors fade smoothly instead of flashing
- All animated gradients (hero blob, search glow) have separate dark-mode color values - never just "dim" the light version

---

## 7. Responsive & Performance Notes

- All animations respect `prefers-reduced-motion` - wrap Framer Motion variants with a check:
```tsx
const shouldReduceMotion = useReducedMotion()
const variants = shouldReduceMotion ? {} : fullVariants
```
- On mobile, reduce animation complexity: skip parallax (4.3), keep micro-interactions (4.5)
- Lazy-load below-the-fold sections using `whileInView` (Framer Motion handles this natively - animations only trigger once element enters viewport)
- Product images: use `next/image` with `placeholder="blur"` for smooth loading

---

## 8. Required Packages

```bash
npm install framer-motion
```

Fonts (add to `app/layout.tsx` via `next/font/google`):
```tsx
import { Fraunces, Inter } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

---

## 9. Why This Design Stands Out

| Generic student e-commerce site | This project |
|---|---|
| White + blue, default fonts | Sage/terracotta palette, Fraunces + Inter editorial pairing |
| Static "Add to Cart" button | Fly-to-cart animation with cart icon bounce |
| Plain search input | Glowing magnetic AI search bar with staggered results |
| Static hero image | Scroll-reveal parallax product story |
| Plain "in stock" text | Realtime-animated stock badges with urgency pulse |
| No empty/loading states | Custom illustrations, shimmer skeletons, confetti success |

Each of these is **small enough to build in 1-2 hours** but together create a portfolio piece that looks meaningfully different from a tutorial clone - which is exactly what reviewers notice when deciding on internship extensions.