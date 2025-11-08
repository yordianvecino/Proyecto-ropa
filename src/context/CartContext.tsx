"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem, Product } from '@/types'

const STORAGE_KEY = 'rc_cart_v1'

type CartContextValue = {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: Product['id']) => void
  updateQuantity: (productId: Product['id'], quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist on change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((ci) => ci.product.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, { product, quantity }]
    })
  }

  const removeFromCart = (productId: Product['id']) => {
    setItems((prev) => prev.filter((ci) => ci.product.id !== productId))
  }

  const updateQuantity = (productId: Product['id'], quantity: number) => {
    setItems((prev) =>
      prev.map((ci) => (ci.product.id === productId ? { ...ci, quantity: Math.max(1, quantity) } : ci))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = useMemo(() => items.reduce((acc, ci) => acc + ci.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((acc, ci) => acc + ci.product.price * ci.quantity, 0), [items])

  const value = useMemo<CartContextValue>(
    () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }),
    [items, totalItems, subtotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
