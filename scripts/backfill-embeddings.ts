import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.+)$/)
    if (match) {
      env[match[1].trim()] = match[2].trim()
    }
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const GOOGLE_GEMINI_API_KEY = env.GOOGLE_GEMINI_API_KEY

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description')
    .is('embedding', null)

  if (error) {
    console.error('Error fetching products:', error.message)
    process.exit(1)
  }

  if (!products || products.length === 0) {
    console.log('No products need backfilling.')
    return
  }

  console.log(`Backfilling embeddings for ${products.length} products...`)

  for (const product of products) {
    const textToEmbed = `${product.name}${product.description ? ' ' + product.description : ''}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${GOOGLE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text: textToEmbed }] },
          }),
        }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error(`Failed embedding for ${product.id}: ${res.status} ${err}`)
      continue
    }

    const data = await res.json()
    const embedding = data.embedding.values

    const { error: updateError } = await supabase
      .from('products')
      .update({ embedding })
      .eq('id', product.id)

    if (updateError) {
      console.error(`Failed update for ${product.id}: ${updateError.message}`)
    } else {
      console.log(`  ✓ ${product.name}`)
    }

    // Small delay to avoid Gemini rate limits
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log('Backfill complete.')
}

main().catch(console.error)
