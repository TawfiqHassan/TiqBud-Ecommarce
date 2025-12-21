import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface ComparisonProduct {
  id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    brand: string | null;
    description: string | null;
    specifications: Record<string, any> | null;
    stock: number;
  };
}

export const useProductComparison = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comparisonProducts = [], isLoading } = useQuery({
    queryKey: ['product-comparisons', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('product_comparisons')
        .select(`
          id,
          product_id,
          created_at,
          products:product_id (id, name, price, original_price, image_url, brand, description, specifications, stock)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        ...item,
        product: item.products
      })) as ComparisonProduct[];
    },
    enabled: !!user
  });

  const addToComparisonMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        throw new Error('Please login to compare products');
      }

      // Check if already in comparison
      const { data: existing } = await supabase
        .from('product_comparisons')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        throw new Error('Product already in comparison');
      }

      // Check max limit (4 products)
      const { count } = await supabase
        .from('product_comparisons')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (count && count >= 4) {
        throw new Error('Maximum 4 products can be compared');
      }

      const { error } = await supabase
        .from('product_comparisons')
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-comparisons'] });
      toast.success('Added to comparison');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const removeFromComparisonMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('product_comparisons')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-comparisons'] });
      toast.success('Removed from comparison');
    }
  });

  const clearComparisonMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from('product_comparisons')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-comparisons'] });
    }
  });

  const isInComparison = (productId: string) => {
    return comparisonProducts.some(p => p.product_id === productId);
  };

  return {
    comparisonProducts,
    isLoading,
    addToComparison: addToComparisonMutation.mutate,
    removeFromComparison: removeFromComparisonMutation.mutate,
    clearComparison: clearComparisonMutation.mutate,
    isInComparison,
    comparisonCount: comparisonProducts.length
  };
};
