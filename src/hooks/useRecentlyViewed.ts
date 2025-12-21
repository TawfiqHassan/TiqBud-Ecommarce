import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface RecentlyViewedProduct {
  id: string;
  product_id: string;
  viewed_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
}

export const useRecentlyViewed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recentlyViewed = [], isLoading } = useQuery({
    queryKey: ['recently-viewed', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recently_viewed')
        .select(`
          id,
          product_id,
          viewed_at,
          products:product_id (id, name, price, image_url)
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        ...item,
        product: item.products
      })) as RecentlyViewedProduct[];
    },
    enabled: !!user
  });

  const trackViewMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;

      // First, check if already viewed
      const { data: existing } = await supabase
        .from('recently_viewed')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        // Update the viewed_at timestamp
        await supabase
          .from('recently_viewed')
          .update({ viewed_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Insert new entry
        await supabase
          .from('recently_viewed')
          .insert({ user_id: user.id, product_id: productId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-viewed'] });
    }
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-viewed'] });
    }
  });

  return {
    recentlyViewed,
    isLoading,
    trackView: trackViewMutation.mutate,
    clearHistory: clearHistoryMutation.mutate
  };
};
