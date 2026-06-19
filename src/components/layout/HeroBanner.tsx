'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f5f5f5] to-[#e0e0e0] dark:from-zinc-900 dark:to-zinc-950 min-h-[600px] flex items-center">
      {/* Huge Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <h1 className="text-[10rem] md:text-[14rem] font-bold text-white/70 dark:text-white/5 tracking-tighter select-none whitespace-nowrap">
          VERDANT
        </h1>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between z-10">
        {/* Left Content */}
        <div className="flex-1 space-y-4 text-center md:text-left mb-12 md:mb-0">
          <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tight leading-tight">
            Curated For Your <br className="hidden md:block" />
            <span className="text-[#ef4444]">Modern Lifestyle</span>
          </h2>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[#ef4444] hover:bg-red-700 px-8 py-3.5 text-[15px] font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Center Image */}
        <div className="flex-1 flex justify-center w-full max-w-md md:max-w-none relative animate-fade-in-up">
          <Image
            src="/headphone-removebg-preview.png"
            alt="Featured Product"
            width={500}
            height={500}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right mt-12 md:mt-0">
          <div className="max-w-[280px]">
            <h3 className="text-lg font-bold text-black dark:text-white mb-3">About the collection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Shop the latest trends across Electronics, Clothing, Books, and Home
              &amp; Kitchen. Experience quality products at unbeatable prices.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

