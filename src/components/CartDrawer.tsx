
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  // Handle checkout process
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    toast.success('Redirecting to checkout...');
    // Here you would typically redirect to checkout page
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            // Empty cart state
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
              <p className="text-slate-400 mb-6">Add some products to get started</p>
              <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
                Continue Shopping
              </Button>
            </div>
          ) : (
            // Cart items
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center space-x-4">
                    {/* Product image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-slate-400">{item.category}</p>
                      <p className="text-lg font-bold text-blue-400">
                        ${item.price}
                      </p>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 p-0 border-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="text-white font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0 border-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-white font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart button */}
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full mt-4 border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Clear Cart
              </Button>
            </div>
          )}
        </div>

        {/* Footer with total and checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-700 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-xl font-bold text-white">
              <span>Total:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>

            {/* Checkout button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
            >
              Proceed to Checkout
            </Button>

            {/* Continue shopping */}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
