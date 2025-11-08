export type Product = {
  id: string | number
  name: string
  price: number
  image?: string
  category?: string
}

export type CartItem = {
  product: Product
  quantity: number
}
