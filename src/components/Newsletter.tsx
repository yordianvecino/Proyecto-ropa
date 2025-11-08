const Newsletter = () => {
  return (
    <section className="py-16 bg-christian-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Mantente Conectado
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Suscríbete a nuestro boletín y recibe ofertas especiales, nuevos productos y mensajes inspiradores
        </p>
        <div className="max-w-md mx-auto flex gap-2">
          <input 
            type="email" 
            placeholder="Tu correo electrónico"
            className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-christian-gold"
          />
          <button className="bg-christian-gold hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors">
            Suscribirse
          </button>
        </div>
        <p className="text-sm mt-4 opacity-80">
          No spam, solo bendiciones. Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  )
}

export default Newsletter