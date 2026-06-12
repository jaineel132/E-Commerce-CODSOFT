# AI Rules — E-Commerce Website
## Instructions for AI coding assistants (Cursor, Copilot, Claude, etc.)

---

## 1. Project Identity

This is a **Next.js 14 App Router** e-commerce project using **Supabase** as the backend, **Tailwind CSS** for styling, and **Stripe** for payments. Always keep this context in mind when suggesting code.

- Language: **TypeScript** — never write plain `.js` files inside `src/`
- Styling: **Tailwind CSS only** — never write inline styles or separate CSS files (except `globals.css`)
- Database: **Supabase** — never suggest Firebase, Prisma, or any other ORM/database
- Auth: **Supabase Auth** — never suggest NextAuth, Clerk, or any other auth library

---

## 2. Code Style Rules

### General
- Always use **TypeScript** with proper types — no `any`, ever
- Use **arrow functions** for components and utilities
- Use **named exports** for components, **default export** only for Next.js pages/layouts
- Always use **`const`** — never use `var`, prefer `const` over `let`
- Keep functions small — if a function is longer than 40 lines, split it
- All async functions must have proper **try/catch error handling**
- Never leave **console.log** in committed code

### Naming Conventions
```
Components       → PascalCase             → ProductCard.tsx
Hooks            → camelCase, use prefix  → useCart.ts
Utility files    → camelCase              → formatPrice.ts
API routes       → lowercase              → route.ts
Database tables  → snake_case             → cart_items
TypeScript types → PascalCase             → CartItem, Product
CSS classes      → Tailwind only          → className="flex items-center gap-2"
```

### Component Rules
- Every component must have a **typed props interface** defined above it
- Never put business logic inside a component — extract to a custom hook or utility
- Keep components **presentational** where possible — data fetching goes in the page or a hook

```typescript
// CORRECT
interface ProductCardProps {
  product: Product
  onAddToCart: (id: string) => void
}
const ProductCard = ({ product, onAddToCart }: ProductCardProps) => { ... }
export { ProductCard }

// WRONG
export default function ProductCard(props: any) { ... }
```

---

## 3. Supabase Rules

- Use **server client** (`lib/supabase/server.ts`) inside API routes and Server Components
- Use **browser client** (`lib/supabase/client.ts`) inside Client Components and hooks
- Never use the **service role key** on the client side
- Always destructure `{ data, error }` and handle both

```typescript
// CORRECT
const { data, error } = await supabase.from('products').select('id, name, price')
if (error) throw new Error(error.message)
return data

// WRONG
const data = await supabase.from('products').select('*')  // no error check + selects embedding vector
return data
```

- Every table must have **RLS enabled** — never disable RLS to fix a bug, fix the policy instead
- Always **unsubscribe Realtime channels on component unmount**

```typescript
// CORRECT
useEffect(() => {
  const channel = supabase.channel('products')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, handler)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

---

## 4. Next.js App Router Rules

- Default to **Server Components** — only add `'use client'` when you actually need hooks or browser APIs
- Never use `useEffect` to fetch data — use Server Components or Route Handlers
- Always return proper **HTTP status codes** from API routes
- Use `next/image` for all images — never `<img>`
- Use `next/link` for all internal links — never `<a href>`
- Never put secrets in `NEXT_PUBLIC_` env vars — they are exposed to the browser

```typescript
// CORRECT API route
export async function GET(request: Request) {
  try {
    const products = await getProducts()
    return Response.json({ products }, { status: 200 })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
```

---

## 5. Stripe Rules

- Always use **test mode** keys (`pk_test_`, `sk_test_`) during development
- Always **verify webhook signatures** before processing events
- Order creation must ONLY happen in the **Stripe webhook handler** — never trust the client

```typescript
// CORRECT
const sig = request.headers.get('stripe-signature')!
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
// process event.type === 'checkout.session.completed'
```

---

## 6. Tailwind CSS Rules

- Use the **`cn()` utility** from `lib/utils.ts` to conditionally combine classes
- Always design **mobile-first**: base styles first, then `md:` and `lg:` breakpoints
- Always add **`dark:`** variants for backgrounds and text colors

```typescript
// CORRECT
<div className={cn("flex rounded-lg p-4 bg-white dark:bg-zinc-900", isActive && "border-2 border-blue-600")} />

// WRONG
<div style={{ display: 'flex', backgroundColor: '#fff' }} />
```

---

## 7. pgvector / AI Search Rules

- Embedding generation must happen **server-side only** — never in client components
- Always generate embeddings when a product is **created or description is updated**
- **Never use `SELECT *`** on the products table — always name columns to avoid fetching large embedding vectors
- Use **cosine distance** (`<=>`) for similarity search, with a minimum threshold of `0.75`

---

## 8. Security Rules

- Never commit `.env.local` — must be in `.gitignore`
- Always validate and sanitize all **user inputs server-side** before touching the database
- Admin routes must be protected in **both** `middleware.ts` AND inside the API route — never rely on one layer alone
- Never expose user emails or sensitive data in client-side state or URLs

---

## 9. File Creation Checklist

Before creating a new file, confirm:
- [ ] Correct folder per the architecture doc
- [ ] TypeScript (`.tsx` for components, `.ts` for utilities)
- [ ] Typed interface for all props/params — no `any`
- [ ] Imports order: React → Next.js → third-party → local (`@/`)
- [ ] No business logic inside UI components
- [ ] Error handling in all async operations

---

## 10. Hard Rules — Never Do These

| Never | Instead |
|---|---|
| Import Supabase client directly in a component | Import from `@/lib/supabase/client` or `/server` |
| Use `any` type | Define interface in `types/index.ts` |
| `useEffect` to fetch data in client component | Use Server Component or API route |
| Inline styles | Tailwind classes |
| Create order from client after Stripe redirect | Only in Stripe webhook handler |
| Disable RLS | Fix the policy |
| `<img>` or `<a href>` for internal links | `next/image` and `next/link` |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Server-side env only |
| `SELECT *` on products | Always name columns explicitly |
| Commit `.env.local` | Add to `.gitignore` |
