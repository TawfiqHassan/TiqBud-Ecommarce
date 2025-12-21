import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  image_url: string | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  sku: string | null;
  brand: string | null;
  specifications: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    parent_category: string | null;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_category: string | null;
  created_at: string;
}

export const useProducts = (options?: { 
  featured?: boolean; 
  categorySlug?: string;
  parentCategory?: string;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_category)
        `)
        .eq('is_active', true);

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      if (options?.categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .maybeSingle();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (options?.parentCategory) {
        const { data: categories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_category', options.parentCategory);
        
        if (categories && categories.length > 0) {
          query = query.in('category_id', categories.map(c => c.id));
        }
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,brand.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    }
  });
};

export const useCategories = (parentCategory?: string) => {
  return useQuery({
    queryKey: ['categories', parentCategory],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');

      if (parentCategory) {
        query = query.eq('parent_category', parentCategory);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    }
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_category)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!id
  });
};
