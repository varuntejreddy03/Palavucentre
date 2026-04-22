import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext()
const CART_STORAGE_KEY = 'palavu:cart-items'

export const useCart = () => useContext(CartContext)

function readStoredCartItems() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedItems = JSON.parse(rawValue)
    return Array.isArray(parsedItems) ? parsedItems : []
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => readStoredCartItems())
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // Ignore storage errors. Cart state still works in memory.
    }
  }, [cartItems])

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
  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isCartOpen,
        setCartOpen: setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
