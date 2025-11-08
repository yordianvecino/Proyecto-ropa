export type Product = {
  id: string
  name: string
  price: number // unidades monetarias (no centavos) para la UI pública
  image?: string
  category?: string
}

export type CartItem = {
  product: Product
  quantity: number
}
