import { Truck, Shield, Star, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Enjoy free and fast delivery on all orders over $50.',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment information is encrypted and fully protected.',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: 'Not satisfied? Return it within 30 days for a full refund.',
  },
  {
    icon: Star,
    title: 'Premium Quality',
    description: 'We carefully curate our selection to ensure top-tier quality.',
  },
]

export function WhyShopSection() {
  return (
    <section className="w-full bg-background-cream py-24 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="display-md text-foreground">
            Why Shop With Verdant
          </h2>
          <p className="mt-4 text-[16px] text-foreground-muted">
            We&apos;re committed to providing you with the best shopping experience possible, from secure checkout to lightning-fast delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex flex-col items-start gap-4"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[12px] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Icon className="h-6 w-6 relative z-10" />
                  <div className="absolute -inset-1 rounded-[16px] bg-primary/20 blur-sm"></div>
                </div>
                <div>
                  <h3 className="heading-sm text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-foreground-muted">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
