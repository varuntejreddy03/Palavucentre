import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (item, quantity = 1) => {
    const normalizedQuantity = Math.max(Number(quantity) || 1, 1)

    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + normalizedQuantity }
            : cartItem,
        )
      }

      return [...current, { ...item, quantity: normalizedQuantity }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems((current) => current.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeFromCart(id)
    } else {
      setCartItems((current) =>
        current.map((item) => (item.id === id ? { ...item, quantity } : item)),
      )
    }
  }

  const clearCart = () => setCartItems([])

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      isCartOpen,
      setCartOpen: setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}
