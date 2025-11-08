import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import Testimonials from '@/components/Testimonials'
import Newsletter from '@/components/Newsletter'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <Testimonials />
      <Newsletter />
    </main>
  )
}