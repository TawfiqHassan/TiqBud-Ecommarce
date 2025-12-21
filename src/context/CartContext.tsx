import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Product interface for use across components
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

// Cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Cart context type definition
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
}

// Create cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component to wrap the app
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Get user safely - AuthContext may not be available in all routes
  let user: any = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {
    // AuthContext not available, use localStorage only
  }

  // Load cart from database when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          if (data && data.length > 0) {
            const items: CartItem[] = data.map(item => ({
              id: item.product_id || item.id,
              name: item.product_name,
              price: Number(item.unit_price),
              image: item.product_image || '',
              quantity: item.quantity
            }));
            setCartItems(items);
          } else {
            // Check if there's a local cart to sync
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              const localItems: CartItem[] = JSON.parse(savedCart);
              if (localItems.length > 0) {
                // Sync local cart to database
                for (const item of localItems) {
                  await supabase.from('cart_items').upsert({
                    user_id: user.id,
                    product_id: item.id,
                    product_name: item.name,
                    product_image: item.image,
                    unit_price: item.price,
                    quantity: item.quantity
                  }, { onConflict: 'user_id,product_id' });
                }
                setCartItems(localItems);
                localStorage.removeItem('cart');
              }
            }
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          // Fallback to localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        } finally {
          setIsLoading(false);
          setInitialized(true);
        }
      } else {
        // Load from localStorage for non-logged-in users
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        setInitialized(true);
      }
    };

    loadCart();
  }, [user?.id]);

  // Save to localStorage for non-logged-in users
  useEffect(() => {
    if (initialized && !user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user, initialized]);

  // Sync cart item to database
  const syncToDatabase = useCallback(async (item: CartItem) => {
    if (!user) return;

    try {
      await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        unit_price: item.price,
        quantity: item.quantity
      }, { onConflict: 'user_id,product_id' });
    } catch (error) {
      console.error('Error syncing cart item:', error);
    }
  }, [user]);

  // Add item to cart or increase quantity if already exists
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = item.quantity || 1;
    
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        newItems = [...prev, { 
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity
        }];
      }

      // Sync with database if logged in
      if (user) {
        const updatedItem = newItems.find(i => i.id === item.id);
        if (updatedItem) {
          syncToDatabase(updatedItem);
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }

      return newItems;
    });
  }, [user, syncToDatabase]);

  // Remove item completely from cart
  const removeFromCart = useCallback(async (productId: string) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);
      if (!user) {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return newItems;
    });

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  }, [user]);

  // Update item quantity in cart
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => {
      const newItems = prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      if (!user) {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return newItems;
    });

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  }, [user, removeFromCart]);

  // Clear all items from cart
  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem('cart');

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  }, [user]);

  // Get total number of items in cart
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Get total price of all items in cart
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
