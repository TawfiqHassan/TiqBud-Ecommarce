import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          created_at,
          products:product_id (id, name, price, image_url, stock)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        ...item,
        product: item.products
      })) as WishlistItem[];
    },
    enabled: !!user
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        throw new Error('Please login to add to wishlist');
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        throw new Error('Product already in wishlist');
      }

      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    }
  });

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlist,
    isLoading,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isInWishlist,
    toggleWishlist,
    wishlistCount: wishlist.length
  };
};
