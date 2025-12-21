import { useState } from 'react';
import { Star, ShoppingCart, Heart, Eye, Filter, Grid, List, Keyboard, Mouse, Gamepad2, Headphones, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart, Product } from '@/context/CartContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

// PC Accessories subcategories
const subcategories = [
  { id: 'all', name: 'All Products', icon: Grid },
  { id: 'keyboards', name: 'Keyboards', icon: Keyboard },
  { id: 'mice', name: 'Gaming Mice', icon: Mouse },
  { id: 'gamepads', name: 'Gamepads', icon: Gamepad2 },
  { id: 'headsets', name: 'Headsets', icon: Headphones },
  { id: 'speakers', name: 'Speakers', icon: Volume2 },
];

// Sample products data with BDT pricing
const products: Product[] = [
  {
    id: '1',
    name: 'TiqBud Pro Mechanical Keyboard',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    category: 'keyboards',
    description: 'Premium mechanical keyboard with RGB lighting and tactile switches',
    inStock: true,
    rating: 4.8,
    reviews: 324
  },
  {
    id: '2',
    name: 'Precision Gaming Mouse X1',
    price: 6999,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
    category: 'mice',
    description: 'High-precision gaming mouse with customizable DPI settings',
    inStock: true,
    rating: 4.7,
    reviews: 256
  },
  {
    id: '3',
    name: 'UltraSound Pro Headset',
    price: 15999,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    category: 'headsets',
    description: 'Premium gaming headset with 7.1 surround sound and noise cancellation',
    inStock: true,
    rating: 4.9,
    reviews: 445
  },
  {
    id: '4',
    name: 'Wireless Controller Pro',
    price: 5499,
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop',
    category: 'gamepads',
    description: 'Wireless gaming controller with haptic feedback and long battery life',
    inStock: true,
    rating: 4.6,
    reviews: 189
  },
  {
    id: '5',
    name: 'SoundWave Desktop Speakers',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=300&fit=crop',
    category: 'speakers',
    description: 'High-quality desktop speakers with deep bass and crystal clear highs',
    inStock: true,
    rating: 4.5,
    reviews: 167
  },
  {
    id: '6',
    name: 'RGB Mechanical Keyboard Mini',
    price: 7999,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    category: 'keyboards',
    description: '60% compact mechanical keyboard with per-key RGB',
    inStock: true,
    rating: 4.7,
    reviews: 198
  },
  {
    id: '7',
    name: 'Ergonomic Wireless Mouse',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop',
    category: 'mice',
    description: 'Ergonomic design for comfortable all-day use',
    inStock: false,
    rating: 4.4,
    reviews: 89
  },
  {
    id: '8',
    name: 'Pro Gaming Headset 7.1',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    category: 'headsets',
    description: 'Virtual 7.1 surround sound with detachable microphone',
    inStock: true,
    rating: 4.6,
    reviews: 312
  },
];

const PCAccessoriesContent = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  // Filter products by category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  const handleAddToCart = (product: Product) => {
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

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      {/* Page Header */}
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">PC Accessories</h1>
          <p className="text-muted-foreground text-lg">
            Premium keyboards, mice, headsets, gamepads, and speakers for your setup
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
                {subcategories.map((cat) => {
                  const IconComponent = cat.icon;
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <Card 
                  key={product.id}
                  className="group bg-card border-border hover:border-brand-gold/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-brand-gold text-brand-dark">
                        {subcategories.find(c => c.id === product.category)?.name || product.category}
                      </Badge>
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
                      <Button size="sm" variant="secondary" className="w-9 h-9 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-brand-gold transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-foreground">
                        ৳{product.price.toLocaleString()}
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
