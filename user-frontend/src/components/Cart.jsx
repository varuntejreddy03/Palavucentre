export default function Cart({ items, onClose, updateQuantity, removeFromCart }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-earth-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-turmeric/30">
          <h2 className="text-2xl font-bold text-turmeric">Your Cart</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 bg-earth-brown/50 p-4 rounded-lg">
                  <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-turmeric">{item.name}</h3>
                    <p className="text-sm text-gray-400">₹{item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-earth-dark px-3 py-1 rounded hover:bg-turmeric hover:text-earth-dark transition"
                      >
                        -
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-earth-dark px-3 py-1 rounded hover:bg-turmeric hover:text-earth-dark transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-turmeric">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-turmeric/30 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-turmeric">₹{total}</span>
            </div>
            <button className="w-full bg-turmeric text-earth-dark py-4 rounded-full font-bold text-lg hover:bg-yellow-600 transition">
              Proceed to Checkout
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              Or call <a href="tel:9966655997" className="text-turmeric hover:underline">9966655997</a> to place order
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
