import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'Ropa Cristiana | Viste tu Fe',
  description: 'Tienda online de ropa cristiana con diseños inspiradores y mensaje de fe',
  icons: {
    icon: [
      { url: '/icon.svg?v=4', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`font-sans text-brand-black`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}