import { Crown } from 'lucide-react'
const Hero = () => {
  return (
    <section className="relative py-20 bg-brand-blush">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="font-accent text-5xl leading-none text-brand-black">moda celestial</span>
          <Crown size={28} className="text-brand-gold" />
        </div>
        <p className="text-sm tracking-widest text-gray-500 mb-8">BOUTIQUE CRISTIANA VIRTUAL</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-black">Viste tu fe con estilo</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-700">
          Prendas inspiradas en la fe, con toques delicados y elegantes para cada ocasión.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/productos" className="bg-brand-rose hover:bg-brand-pink text-white px-8 py-3 rounded-lg font-semibold transition-colors">Ver colección</a>
          <a href="/nosotros" className="border-2 border-brand-rose text-brand-rose hover:bg-brand-rose/10 px-8 py-3 rounded-lg font-semibold transition-colors">Conócenos</a>
        </div>
      </div>
    </section>
  )
}

export default Hero