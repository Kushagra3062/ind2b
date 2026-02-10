export interface ICartItem {
  productId: string
  title: string
  image_link: string
  price: number
  quantity: number
  discount: number
  seller_id: number
  stock: number
  units?: string
}

export interface ICart {
  userId: string
  items: ICartItem[]
  updatedAt: Date
}
