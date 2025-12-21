import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, ShoppingCart, Heart, Eye, Filter, Grid, Keyboard, Mouse, Gamepad2, Headphones, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart, CartItem } from '@/context/CartContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { Link } from 'react-router-dom';

// Extended product type for this page
interface ProductWithExtras {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  originalPrice?: number;
}

// Icon mapping for subcategories
const iconMap: Record<string, any> = {
  'keyboards': Keyboard,
  'mice': Mouse,
  'gaming-mice': Mouse,
  'gaming mice': Mouse,
  'gamepads': Gamepad2,
  'controllers': Gamepad2,
  'headsets': Headphones,
  'headphones': Headphones,
  'speakers': Volume2,
  'audio': Volume2,
};

const PCAccessoriesContent = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  // Fetch PC category and its subcategories from database
  const { data: pcCategory } = useQuery({
    queryKey: ['pc-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or('slug.eq.pc-accessories,slug.eq.pc,name.ilike.%PC%')
        .single();
      
      if (error) return null;
      return data;
    }
  });

  // Fetch subcategories
  const { data: subcategories = [] } = useQuery({
    queryKey: ['pc-subcategories', pcCategory?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_category', pcCategory?.name || 'PC Accessories')
        .order('name');
      
      if (error) return [];
      return data;
    },
    enabled: !!pcCategory
  });

  // Fetch products from database
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['pc-products', activeCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('is_active', true);

      if (activeCategory !== 'all') {
        query = query.eq('category_id', activeCategory);
      } else if (pcCategory) {
        // Get all products from PC category or its subcategories
        const categoryIds = [pcCategory.id, ...subcategories.map(s => s.id)];
        query = query.in('category_id', categoryIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return data.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
        category: p.category?.slug || 'uncategorized',
        description: p.description || '',
        inStock: p.stock > 0,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
      })) as ProductWithExtras[];
    },
    enabled: !!pcCategory || subcategories.length > 0 || activeCategory === 'all'
  });

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      default: return 0;
    }
  });

  const handleAddToCart = (product: ProductWithExtras) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-brand-gold text-brand-gold'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const getIcon = (slug: string) => {
    const key = slug.toLowerCase();
    return iconMap[key] || Grid;
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      {/* Page Header */}
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {pcCategory?.name || 'PC Accessories'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {pcCategory?.description || 'Premium keyboards, mice, headsets, gamepads, and speakers for your setup'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-brand-gold/10 text-brand-gold'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  All Products
                </button>
                {subcategories.map((cat) => {
                  const IconComponent = getIcon(cat.slug);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-brand-gold/10 text-brand-gold'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {sortedProducts.length} products
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card 
                    key={product.id}
                    className="group bg-card border-border hover:border-brand-gold/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative">
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </Link>

                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Badge className="bg-red-500 text-white">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleFavorite(product.id)}
                          className="w-9 h-9 p-0"
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              favorites.includes(product.id) 
                                ? 'fill-red-500 text-red-500' 
                                : ''
                            }`} 
                          />
                        </Button>
                        <Link to={`/product/${product.id}`}>
                          <Button size="sm" variant="secondary" className="w-9 h-9 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-brand-gold transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(product.rating || 4.5)}</div>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold text-foreground">
                            ৳{product.price.toLocaleString()}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-muted-foreground line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          size="sm"
                          className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const PCAccessories = () => (
  <CartProvider>
    <PCAccessoriesContent />
  </CartProvider>
);

export default PCAccessories;
