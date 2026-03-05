import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (item) => {
    const existing = cartItems.find(i => i.id === item.id)
    if (existing) {
      setCartItems(cartItems.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))
    } else {
      setCartItems([...cartItems, {...item, quantity: 1}])
    }
  }

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(i => i.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity === 0) {
      removeFromCart(id)
    } else {
      setCartItems(cartItems.map(i => i.id === id ? {...i, quantity} : i))
    }
  }

  const clearCart = () => setCartItems([])

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}
