import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const { user } = useAuth();

  // Load cart from database when user logs in
  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    } else {
      // Load from localStorage for non-logged-in users
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [user]);

  // Save to localStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Load cart from Supabase
  const loadCartFromDatabase = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const items: CartItem[] = data.map(item => ({
          id: item.product_id || item.id,
          name: item.product_name,
          price: Number(item.unit_price),
          image: item.product_image || '',
          quantity: item.quantity
        }));
        setCartItems(items);
        
        // Merge localStorage cart with database cart
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const localItems: CartItem[] = JSON.parse(savedCart);
          for (const localItem of localItems) {
            const exists = items.find(i => i.id === localItem.id);
            if (!exists) {
              await addToDatabase(localItem);
            }
          }
          localStorage.removeItem('cart');
          // Reload to get merged cart
          const { data: updatedData } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);
          
          if (updatedData) {
            setCartItems(updatedData.map(item => ({
              id: item.product_id || item.id,
              name: item.product_name,
              price: Number(item.unit_price),
              image: item.product_image || '',
              quantity: item.quantity
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to database
  const addToDatabase = async (item: CartItem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          unit_price: item.price,
          quantity: item.quantity
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Add item to cart or increase quantity if already exists
  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = item.quantity || 1;
    
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { 
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity
      }];
    });

    // Sync with database if logged in
    if (user) {
      const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
      
      await addToDatabase({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: newQuantity
      });
    }
  };

  // Remove item completely from cart
  const removeFromCart = async (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));

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
  };

  // Update item quantity in cart
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

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
  };

  // Clear all items from cart
  const clearCart = async () => {
    setCartItems([]);

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('cart');
    }
  };

  // Get total number of items in cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price of all items in cart
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

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
