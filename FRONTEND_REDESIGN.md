# Verdant — Frontend Redesign Plan

> **Scope:** Frontend only. Zero changes to API routes, Supabase queries, database schema, authentication, Stripe, search/embeddings, pgvector, middleware, server actions, or business logic.

---

## 1. Complete UI Audit

### 1.1 Current Design System

The existing UI uses a **green/earthy** color palette (`#2D5A4A` primary, `#D97757` accent) with Inter + Fraunces fonts. It relies on shadcn CSS variables and a basic Tailwind config. The system works but reads as a **generic template** rather than a premium, intentional product.

### 1.2 Page-by-Page Weaknesses

#### Homepage (`page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Flat hero | 🔴 Critical | Solid `bg-primary` with a single floating blob. No gradient mesh, no depth, no visual interest. Feels like a dev placeholder. |
| Weak headline hierarchy | 🟡 Medium | Fraunces serif at generic weights. No negative letter-spacing, no editorial density. |
| Category cards are basic | 🟡 Medium | Simple icon-in-circle + label. No imagery, no atmosphere, no hover depth. |
| "Why Shop With Us" section | 🟡 Medium | Cookie-cutter trust badges with zero differentiation from any Shopify template. |
| No visual rhythm | 🔴 Critical | Every section uses the same white-on-card pattern. No tonal variation (cream bands, dark bands, mesh backdrops). |
| Footer says "Store" not "Verdant" | 🟢 Minor | Brand inconsistency. |

#### Navbar (`Navbar.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| No search in nav | 🔴 Critical | SearchBar only exists on the products page. Should be globally accessible. |
| Flat design | 🟡 Medium | `bg-background/70 backdrop-blur-md` is fine but lacks premium polish. No scroll-triggered background change. |
| Mobile menu is bare | 🟡 Medium | Simple stacked links with no animation, no visual grouping. |
| Sign In button is a rounded rectangle | 🟢 Minor | Should be a pill per Stripe conventions. |

#### Products Listing (`products/page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Page header is plain | 🟡 Medium | "All Products" as a flat `text-3xl`. No hero band, no visual hook. |
| Filter sidebar is basic | 🟡 Medium | White card with stacked buttons. No visual separation between filter groups. |
| No sort controls visible | 🟡 Medium | Sorting exists in the query but there's no visible dropdown for the user. |
| Product grid has no visual anchor | 🟡 Medium | Cards float in a white void. No surface differentiation. |

#### Product Card (`ProductCard.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Generic card styling | 🟡 Medium | `rounded-xl border border-border bg-card shadow-sm` — every e-commerce template in existence. |
| Category label is tiny uppercase | 🟢 Minor | `text-[11px]` — nearly invisible. |
| Add to Cart button has no visual weight | 🟡 Medium | Same green as primary. Needs to be the dominant CTA in the card. |
| No wishlist heart on card | 🟡 Medium | Wishlist is only on detail page. The card needs a heart icon overlay. |
| Hover state is `-translate-y-1` | 🟢 Minor | Acceptable but could use a shadow escalation + subtle image zoom. |

#### Product Detail Page (`products/[id]/page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Breadcrumb is unstyled | 🟢 Minor | Plain text with `/` separators. Needs proper pill breadcrumbs. |
| Two-column layout is sparse | 🟡 Medium | Image left, text right — correct structure but the text side has too much white space and weak hierarchy. |
| Description section is flat | 🟡 Medium | "DESCRIPTION" uppercase label above plain text. Needs better typographic treatment. |
| No image gallery/zoom | 🟡 Medium | Single image, no zoom, no secondary images. |
| Add to Cart / Wishlist buttons lack premium styling | 🔴 Critical | Just green rectangles. No hover animations, no visual hierarchy between primary and secondary actions. |

#### Cart Page (`cart/page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Cart items look like form rows | 🟡 Medium | Functional but flat. Needs better image treatment, clearer quantity controls. |
| Cart summary card is generic | 🟡 Medium | No visual differentiation from other cards. Should feel like a checkout panel. |
| Quantity stepper is too small | 🟡 Medium | 32px buttons on mobile are below WCAG touch targets. |

#### Checkout Page (`checkout/page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| No trust indicators | 🔴 Critical | Small lock icon + "Secure checkout powered by Stripe" text. Needs payment method badges, trust seals, SSL indicators. |
| Pay button uses accent color | 🟡 Medium | Should be the most prominent, premium-styled CTA on the entire site. |
| Order summary is a repeat of cart | 🟢 Minor | Could be more condensed with better visual design. |

#### Orders Page (`orders/page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Status badges use raw Tailwind colors | 🟡 Medium | Hardcoded `bg-amber-100 text-amber-800`. Should use semantic design tokens. |
| Order cards have weak hierarchy | 🟡 Medium | Order ID, date, status, amount all compete for attention. |
| No order timeline/tracking visualization | 🟢 Minor | Nice-to-have: a step indicator for pending → shipped → delivered. |

#### Admin Dashboard (`admin/page.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Stat cards are basic | 🟡 Medium | `rounded-xl border bg-card p-5` — needs better visual treatment. |
| Chart is minimal | 🟡 Medium | Dynamic import of `OrdersChart` but the chart styling is bare Recharts defaults. |
| No data density | 🟡 Medium | Dashboard should feel like Linear: dense, informative, dark-surface panels. |
| Sidebar is hidden on mobile | 🔴 Critical | `hidden md:block` — admin panel is inaccessible on mobile. |

#### Auth Pages (Login/Signup)
| Issue | Severity | Detail |
|---|---|---|
| Not audited in full | 🟡 Medium | Need to verify form styling matches the new design system. Auth pages should feel premium (centered card, gradient background). |

#### Empty States (`EmptyState.tsx`)
| Issue | Severity | Detail |
|---|---|---|
| Generic circle icon | 🟡 Medium | `rounded-full bg-muted p-6` with a Lucide icon. Could be more expressive with illustrations or branded empty states. |

#### Loading States
| Issue | Severity | Detail |
|---|---|---|
| `skeleton-shimmer` is CSS-only | 🟢 Minor | Works but feels generic. Could benefit from more branded loading patterns. |

### 1.3 Global Issues

| Issue | Detail |
|---|---|
| **No gradient mesh** | The Stripe-inspired hero needs the signature atmospheric gradient. Currently just a flat green background. |
| **No dark mode design intent** | Dark mode exists but it's auto-generated inverse values. No crafted dark palette like Linear's surface ladder. |
| **Inconsistent typography** | Mix of `font-serif` (Fraunces) and `font-sans` (Inter) without clear rules for when each is used. |
| **No motion library** | CSS keyframes only. No Framer Motion for page transitions, layout animations, or micro-interactions. |
| **No tabular figures** | Money values don't use `font-variant-numeric: tabular-nums`. Prices misalign in grids. |
| **Color system is earthy** | Green + terracotta reads "organic grocery" not "premium tech commerce." Needs sophistication. |
| **No visual break between sections** | Homepage is all-white or all-card. No cream bands, dark bands, or gradient interludes. |

---

## 2. Design System Proposal

### 2.1 Design Philosophy

**Storefront = Stripe DNA:** Atmospheric gradient mesh heroes, indigo CTAs, pill buttons, light-surface cards with editorial-density typography.

**Dashboard = Linear DNA:** Near-black canvas, four-step surface ladder, lavender accent used sparingly, dense data-focused UI, hairline borders instead of shadows.

The two systems share:
- **Inter** as the primary font family (closest free substitute for both Sohne and Linear Display)
- **JetBrains Mono** for code/numeric contexts
- An 8px spacing base unit
- A shared border-radius scale
- CSS custom properties for seamless light/dark switching

### 2.2 Component Architecture

```
New Design Tokens (globals.css)
├── Light theme (Stripe-inspired)
│   ├── Surface: white → soft gray → cream
│   ├── Text: deep navy ink hierarchy
│   ├── CTA: indigo pill buttons
│   └── Gradient mesh for heroes
│
├── Dark theme (Linear-inspired)
│   ├── Surface: near-black → 4-step ladder
│   ├── Text: light gray hierarchy
│   ├── CTA: lavender accent, scarce
│   └── Hairline borders, no shadows
│
└── Shared tokens
    ├── Spacing scale (4px base)
    ├── Border radius scale
    ├── Typography scale with negative tracking
    ├── Semantic colors (success, warning, error)
    └── Animation/transition tokens
```

---

## 3. Color Palette

### 3.1 Light Mode (Stripe-Inspired)

| Token | Value | Use |
|---|---|---|
| `--background` | `#FFFFFF` | Default page canvas |
| `--background-soft` | `#F6F9FC` | Alternate section backgrounds |
| `--background-cream` | `#F5E9D4` | Warm feature band interlude |
| `--foreground` | `#0A2540` | Primary text — deep navy, never black |
| `--foreground-secondary` | `#425466` | Secondary body text |
| `--foreground-muted` | `#64748D` | Captions, helpers, meta |
| `--primary` | `#635BFF` | Primary CTA — indigo (Stripe's exact brand) |
| `--primary-hover` | `#5349E0` | Hover state for primary |
| `--primary-press` | `#3D35C2` | Active/pressed state |
| `--primary-soft` | `#E8E6FF` | Soft indigo backgrounds (tags, pills) |
| `--primary-foreground` | `#FFFFFF` | Text on indigo surfaces |
| `--accent` | `#FF764A` | Secondary CTA, gradient stop |
| `--accent-foreground` | `#FFFFFF` | Text on accent surfaces |
| `--card` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `#0A2540` | Card text |
| `--border` | `#E3E8EE` | Hairline borders |
| `--border-input` | `#A8C3DE` | Form input borders |
| `--ring` | `#635BFF` | Focus ring |
| `--destructive` | `#DF1B41` | Error states |
| `--success` | `#30B130` | Success states |
| `--warning` | `#F5A623` | Warning states |
| `--muted` | `#F6F9FC` | Muted backgrounds |
| `--muted-foreground` | `#64748D` | Muted text |

### 3.2 Dark Mode (Linear-Inspired)

| Token | Value | Use |
|---|---|---|
| `--background` | `#0A0A0B` | Deep dark canvas (Linear-style near-black) |
| `--background-soft` | `#111113` | Alternate section background |
| `--foreground` | `#F7F8F8` | Primary text — light gray |
| `--foreground-secondary` | `#D0D6E0` | Secondary text |
| `--foreground-muted` | `#8A8F98` | Captions, helpers |
| `--primary` | `#7B73FF` | Primary CTA — lighter indigo for dark surfaces |
| `--primary-hover` | `#9B94FF` | Hover |
| `--primary-press` | `#5B53DF` | Press |
| `--primary-soft` | `#1E1B4B` | Soft indigo background |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--accent` | `#FF8B6A` | Warmer accent for dark mode |
| `--accent-foreground` | `#0A0A0B` | Text on accent in dark |
| `--card` | `#141416` | Card surface (surface-1) |
| `--card-hover` | `#1A1A1D` | Hovered card (surface-2) |
| `--card-elevated` | `#1F1F23` | Elevated card (surface-3) |
| `--card-foreground` | `#F7F8F8` | Card text |
| `--border` | `#23252A` | Hairline border |
| `--border-strong` | `#34343A` | Strong border |
| `--ring` | `#7B73FF` | Focus ring |
| `--destructive` | `#FF4D6A` | Error |
| `--success` | `#27A644` | Success |
| `--warning` | `#FFBE1A` | Warning |
| `--muted` | `#18181B` | Muted background |
| `--muted-foreground` | `#8A8F98` | Muted text |

### 3.3 Gradient Mesh Colors (Hero Only)

| Stop | Value | Position |
|---|---|---|
| Cream | `#F5E9D4` | Left edge |
| Sherbet Orange | `#FFB366` | 20% |
| Lavender | `#C5B3FF` | 40% |
| Indigo | `#635BFF` | 60% |
| Ruby Pink | `#FF6B8A` | 80% |
| Magenta | `#E855D4` | Right edge |

In dark mode, the gradient mesh shifts to deeper, more saturated versions with lower opacity over the dark canvas.

### 3.4 Chart Colors

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-1` | `#635BFF` | `#7B73FF` | Primary metric |
| `--chart-2` | `#FF764A` | `#FF8B6A` | Secondary metric |
| `--chart-3` | `#30B130` | `#27A644` | Success/growth |
| `--chart-4` | `#F5A623` | `#FFBE1A` | Warning/attention |
| `--chart-5` | `#DF1B41` | `#FF4D6A` | Negative/decline |

---

## 4. Typography System

### 4.1 Font Stack

| Family | Role | Source |
|---|---|---|
| **Inter** (weight 300–600) | All display + body text | Google Fonts |
| **JetBrains Mono** (weight 400) | Code snippets, order IDs, money cells | Google Fonts |

**Remove Fraunces.** The serif font is contributing to the "organic grocery" feel. A single sans-serif family with careful weight/tracking control is more premium and aligns with both Stripe and Linear.

### 4.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-hero` | 64px → 48px mobile | 300 | 1.05 | -2.5px | Landing hero headline |
| `display-xl` | 48px → 36px mobile | 300 | 1.10 | -1.5px | Section openers |
| `display-lg` | 36px → 28px mobile | 300 | 1.15 | -0.8px | Page titles |
| `display-md` | 28px → 24px mobile | 400 | 1.20 | -0.5px | Card titles, sub-sections |
| `heading-lg` | 22px | 500 | 1.25 | -0.3px | Feature card titles |
| `heading-md` | 18px | 500 | 1.35 | -0.15px | Section sub-headings |
| `heading-sm` | 16px | 500 | 1.40 | 0 | Small headings |
| `body-lg` | 18px | 400 | 1.60 | -0.1px | Hero subhead, lead text |
| `body` | 16px | 400 | 1.55 | -0.05px | Default body |
| `body-sm` | 14px | 400 | 1.50 | 0 | Cards, meta, nav |
| `caption` | 13px | 400 | 1.40 | 0 | Captions, helpers |
| `micro` | 11px | 500 | 1.30 | 0.3px | Eyebrow labels, tags |
| `button-md` | 15px | 500 | 1.0 | 0 | Primary button label |
| `button-sm` | 13px | 500 | 1.0 | 0 | Compact button label |
| `tabular` | 14px | 400 | 1.40 | -0.3px | Money, order IDs (with `tnum`) |
| `mono` | 13px | 400 | 1.50 | 0 | Code, IDs |

### 4.3 Typography Rules

1. **`font-feature-settings: "ss01"` on body** — enables Inter's single-story `a` for a cleaner editorial look.
2. **`font-variant-numeric: tabular-nums`** on ALL money values, quantities, and order IDs.
3. **Negative letter-spacing scales proportionally** — hero at -2.5px, down to 0 at body sizes.
4. **Weight 300 for display tiers** (Stripe editorial density). Weight 500–600 reserved for dashboard headings (Linear density).
5. **Remove all `font-serif` classes** from the codebase. Single family throughout.

---

## 5. Component Token Updates

### 5.1 Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | `4px` | Tags, chips, status badges |
| `--radius-sm` | `6px` | Form inputs |
| `--radius-md` | `8px` | Buttons (dashboard/Linear style) |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Large panels, product images |
| `--radius-pill` | `9999px` | CTA buttons (storefront/Stripe style), category pills |

### 5.2 Spacing Scale

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-24` | `96px` |

### 5.3 Elevation (Shadows)

**Light mode (Stripe):**
| Level | Shadow | Use |
|---|---|---|
| 0 | None | Default flat |
| 1 | `0 1px 3px rgba(0,55,112,0.06)` | Cards at rest |
| 2 | `0 4px 12px rgba(0,55,112,0.08)` | Cards on hover |
| 3 | `0 8px 24px rgba(0,55,112,0.10), 0 2px 6px rgba(0,55,112,0.04)` | Floating panels, modals |

**Dark mode (Linear):**
Shadows are replaced by **surface ladder + hairline borders**. No drop shadows on dark.

### 5.4 Button Variants

| Variant | Storefront (Light) | Dashboard (Dark) |
|---|---|---|
| **Primary** | Indigo pill (`9999px`), 300 weight label | Lavender `8px` radius, 500 weight label |
| **Secondary** | White pill with indigo border | Surface-1 with hairline border |
| **Ghost** | Transparent, indigo text | Transparent, light gray text |
| **Destructive** | Red pill | Red `8px` radius |
| **CTA (Checkout)** | Large indigo pill with gradient shimmer | N/A |

---

## 6. Page-by-Page Redesign Plan

### Phase 1: Foundation (Do First)
> Design tokens, fonts, global CSS, Tailwind config

| File | Changes |
|---|---|
| `globals.css` | Complete rewrite of CSS variables for both light/dark. Add gradient mesh keyframes. Add typography utilities. |
| `tailwind.config.ts` | Extend with full new color tokens, radius scale, spacing scale. Remove Fraunces font. Add Inter 300/400/500/600 weights. Add JetBrains Mono. |
| `layout.tsx` | Remove Fraunces import. Update Inter import with weight range. Add `font-feature-settings: "ss01"` to body. |

**Estimated components to update:** 3 files
**Dependencies:** None

---

### Phase 2: Navbar + Footer
> Global chrome — the frame everything else sits in

| Component | Redesign Goals |
|---|---|
| `Navbar.tsx` | • Add global SearchBar (desktop: inline, mobile: expanding overlay) ⁕ Pill-shaped Sign In button ⁕ Scroll-triggered background (transparent → frosted) ⁕ Better mobile menu with slide-in panel + grouped sections ⁕ Subtle bottom border with gradient hint |
| `Footer.tsx` | • Fix "Store" → "Verdant" ⁕ 4-column link grid with proper spacing ⁕ Add payment method icons row (Visa, Mastercard, Stripe badge) ⁕ Muted color treatment per Stripe footer conventions |

**Estimated components to update:** 2 files
**Dependencies:** Phase 1

---

### Phase 3: Landing Page (Hero + Sections)
> The most important first impression

| Component | Redesign Goals |
|---|---|
| `HeroBanner.tsx` | • **Full gradient mesh backdrop** (CSS implementation of Stripe's cream→orange→lavender→indigo→ruby wash) ⁕ Display-hero typography at weight 300 with -2.5px tracking ⁕ Two CTAs: indigo pill primary + ghost secondary ⁕ Subtle floating product mockup or trust indicator strip below ⁕ Responsive: mesh re-tiles on mobile, headline drops to 48px |
| `CategoryCards.tsx` | • Larger cards with subtle gradient backgrounds per category ⁕ Better hover states with shadow escalation ⁕ Category count badges |
| `WhyShopSection.tsx` | • Redesign as a **cream-band interlude** (Stripe `canvas-cream` pattern) ⁕ Icon treatment with indigo accent circles ⁕ Better copywriting hierarchy |
| `page.tsx` (homepage) | • Add a visual rhythm: hero (gradient) → featured products (white) → categories (soft gray) → recently viewed → trust section (cream band) → footer ⁕ Add a "customer logos" or "as featured in" strip for trust |

**Estimated components to update:** 4 files
**Dependencies:** Phase 2

---

### Phase 4: Product Listing + Cards + Filters + Search
> The core shopping experience

| Component | Redesign Goals |
|---|---|
| `products/page.tsx` | • Add a mini-hero band at top with gradient hint ⁕ Better page title typography ⁕ Add visible sort dropdown (Price ↑↓, Newest, Name) ⁕ Results count badge |
| `ProductCard.tsx` | • Wishlist heart overlay (top-right, semi-transparent until hover) ⁕ Better image treatment (slightly rounded, no hard border) ⁕ Category as a pill tag, not tiny uppercase ⁕ Price with `tabular-nums` ⁕ Add to Cart button as a full-width indigo pill ⁕ Stock badge repositioned inside image overlay ⁕ Hover: shadow escalation + image subtle zoom (keep existing `scale-105`) |
| `ProductFilter.tsx` | • Category buttons as pill toggles instead of stacked rectangles ⁕ Price range with better input styling (indigo focus ring) ⁕ Active filter chips redesigned as indigo soft pills ⁕ Collapsible on mobile (drawer pattern) |
| `SearchBar.tsx` | • Keep the gradient glow border (it's good!) ⁕ Add search suggestions dropdown ⁕ Better loading state (skeleton results instead of dots) ⁕ "AI-powered" subtle label |
| `ProductGrid.tsx` | • No structural changes needed — grid is solid |
| `StockBadge.tsx` | • Redesign as a small pill with dot indicator ⁕ Use semantic tokens instead of hardcoded green/orange/red |
| `Pagination.tsx` | • Pill-styled page buttons ⁕ Better active state |

**Estimated components to update:** 7 files
**Dependencies:** Phase 3

---

### Phase 5: Product Detail Page
> Where the purchase decision happens

| Component | Redesign Goals |
|---|---|
| `products/[id]/page.tsx` | • Breadcrumb as pill-styled chips ⁕ Larger image with zoom-on-hover ⁕ Better right-column hierarchy: category pill → name (display-lg, weight 300, negative tracking) → price (large, tabular) → description (proper body text treatment) → stock + add to cart ⁕ Add to Cart as large indigo pill ⁕ Add to Wishlist as ghost button with heart ⁕ Better product details grid |
| `ProductImage.tsx` | • Add zoom-on-hover or lightbox ⁕ Better fallback state |
| `ProductDetailStock.tsx` | • Inline with action buttons ⁕ Better stock status visualization |
| `ReviewSection.tsx` | • Better star display ⁕ Review cards with proper typography ⁕ Review form styling aligned with new design system |
| `SimilarProducts.tsx` | • Section title treatment ⁕ Horizontal scroll on mobile |

**Estimated components to update:** 5 files
**Dependencies:** Phase 4

---

### Phase 6: Cart + Checkout
> The money pages — trust and clarity are paramount

| Component | Redesign Goals |
|---|---|
| `cart/page.tsx` | • Better page header ⁕ Cart items as clean rows with better image treatment |
| `CartItem.tsx` | • Larger product images ⁕ Quantity stepper with ≥44px touch targets ⁕ Better price display with `tabular-nums` ⁕ Swipe-to-delete on mobile |
| `CartSummary.tsx` | • Sticky sidebar with elevated card treatment ⁕ Free shipping progress bar ("$12.50 away from free shipping!") ⁕ Checkout button as large indigo pill with lock icon |
| `checkout/page.tsx` | • Trust indicator bar (Stripe logo, payment method icons, SSL badge) ⁕ Pay button as the most premium CTA: large indigo pill with gradient shimmer on hover ⁕ Better order summary layout ⁕ Address picker styling aligned |
| `checkout/success/page.tsx` | • Animated checkmark ⁕ Confetti or celebration state ⁕ Clear order summary ⁕ "Continue Shopping" CTA |

**Estimated components to update:** 5 files
**Dependencies:** Phase 5

---

### Phase 7: User Dashboard (Orders, Wishlist, Profile)
> These should feel like a mini Linear app

| Component | Redesign Goals |
|---|---|
| `orders/page.tsx` | • In dark mode: use Linear surface ladder ⁕ Order cards with clear visual hierarchy (status badge prominent, timeline indicator for shipped/delivered) ⁕ Status badges using semantic design tokens ⁕ Better tracking info display |
| `wishlist/page.tsx` | • Grid cards matching updated ProductCard design ⁕ "Move to Cart" quick action ⁕ Better empty state |
| `profile/page.tsx` | • Clean form layout ⁕ Avatar section ⁕ Address management |
| `EmptyState.tsx` | • More expressive with branded illustration or animated icon ⁕ Better CTA button (indigo pill) |

**Estimated components to update:** 4 files
**Dependencies:** Phase 6

---

### Phase 8: Admin Dashboard
> Full Linear-inspired treatment

| Component | Redesign Goals |
|---|---|
| `admin/layout.tsx` | • Dark sidebar (surface-1 background) with Linear-style nav ⁕ Mobile: slide-out drawer instead of hidden ⁕ Active link with lavender left border indicator |
| `AdminSidebar.tsx` | • Lavender accent on active item ⁕ Section grouping with eyebrow labels ⁕ Compact, dense layout |
| `admin/page.tsx` | • Stat cards with colored left borders ⁕ Charts with branded colors (indigo/accent/success) ⁕ Top products as a proper table ⁕ Recent orders preview |
| `admin/products/page.tsx` | • Data table with Linear-style hairline rows ⁕ Inline edit capabilities ⁕ Better image thumbnails |
| `admin/orders/page.tsx` | • Dense data table ⁕ Status dropdown with colored indicators ⁕ Better mobile treatment |
| `ProductForm.tsx` | • Two-column form layout ⁕ Better image upload UI ⁕ Form inputs with indigo/lavender focus rings |
| `OrdersChart.tsx` | • Chart with branded color tokens ⁕ Better axis labels ⁕ Tooltip styling |

**Estimated components to update:** 7 files
**Dependencies:** Phase 7

---

## 7. Animation Strategy

### What to Add (Framer Motion)
| Animation | Where | Type |
|---|---|---|
| Page transitions | All pages | `layoutId` + fade |
| Product card enter | Grid loading | Stagger fade-up |
| Cart item add/remove | Cart page | `AnimatePresence` layout |
| Number transitions | Cart count, prices | Spring counter |
| Button press | All CTAs | Scale 0.97 + bounce |
| Gradient mesh | Hero | Slow CSS animation (keep existing, enhance) |
| Checkout success | Success page | Checkmark draw + confetti |

### What to Keep (CSS)
- `scroll-reveal` — keep the existing intersection observer pattern
- `skeleton-shimmer` — keep but refine timing
- `badge-enter` / `badge-exit` — keep for cart count

### What to Remove
- `animate-gradient-blob` on hero — replace with proper mesh implementation
- Excessive animation delays (`delay-600`, `delay-700`) — reduce cascade

---

## 8. Dependencies to Add

| Package | Purpose |
|---|---|
| `framer-motion` | Page transitions, layout animations, micro-interactions |
| (No other new deps) | Everything else is achievable with existing Tailwind + CSS |

**Remove:** Consider removing `boneyard-js` in favor of consistent skeleton patterns with the new design system.

---

## 9. Implementation Priority

| Priority | Phase | Impact | Effort |
|---|---|---|---|
| 🔴 P0 | Phase 1 (Foundation) | Highest — unlocks everything | Medium |
| 🔴 P0 | Phase 2 (Navbar/Footer) | High — visible on every page | Low |
| 🔴 P0 | Phase 3 (Landing) | Highest — first impression | High |
| 🟡 P1 | Phase 4 (Products) | High — core shopping | High |
| 🟡 P1 | Phase 5 (Detail) | High — purchase decision | Medium |
| 🟡 P1 | Phase 6 (Cart/Checkout) | High — revenue impact | Medium |
| 🟢 P2 | Phase 7 (User Dashboard) | Medium | Medium |
| 🟢 P2 | Phase 8 (Admin) | Medium | High |

---

## 10. Files NOT Modified (Backend Boundary)

The following are explicitly untouched:

```
src/app/api/**/*          — All API routes
src/lib/supabase/*        — Supabase clients
src/lib/stripe.ts         — Stripe client
src/lib/embeddings.ts     — OpenAI embeddings
src/context/*             — React contexts (data logic stays)
src/hooks/*               — Custom hooks (data logic stays)
src/types/*               — TypeScript types
middleware.ts             — Route protection
supabase/**/*             — Migrations and schema
```

Only **layouts, pages (JSX/styling), components (JSX/styling), CSS, and Tailwind config** are modified.
