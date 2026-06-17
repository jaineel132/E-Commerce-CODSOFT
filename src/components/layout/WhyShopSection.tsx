import { Truck, Shield, Star } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50. Fast delivery to your doorstep.',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment info is encrypted and protected.',
  },
  {
    icon: Star,
    title: 'Quality Products',
    description: 'Curated selection of premium items you can trust.',
  },
]

export function WhyShopSection() {
  return (
    <section className="w-full bg-muted/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Why Shop With Us
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We make shopping easy and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 text-center shadow-sm border border-border"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
