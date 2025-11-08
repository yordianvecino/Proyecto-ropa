const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "María González",
      text: "Me encanta la calidad y los diseños únicos. Cada prenda refleja mi fe de manera hermosa.",
      rating: 5
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      text: "Excelente servicio y productos de alta calidad. Recomiendo esta tienda al 100%.",
      rating: 5
    },
    {
      id: 3,
      name: "Ana López",
      text: "Los mensajes cristianos en la ropa son muy inspiradores. Mi familia y yo somos clientes fieles.",
      rating: 5
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Lo que dicen nuestros clientes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-christian-cream p-6 rounded-lg shadow-md">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-christian-gold text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
              <p className="font-semibold text-christian-purple">- {testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials