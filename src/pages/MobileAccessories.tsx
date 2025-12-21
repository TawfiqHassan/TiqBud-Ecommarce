import { useState } from 'react';
import { Star, ShoppingCart, Heart, Eye, Filter, Smartphone, Battery, Cable, Headphones, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart, Product } from '@/context/CartContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

// Mobile Accessories subcategories
const subcategories = [
  { id: 'all', name: 'All Products', icon: Smartphone },
  { id: 'chargers', name: 'Chargers & Cables', icon: Cable },
  { id: 'powerbanks', name: 'Power Banks', icon: Battery },
  { id: 'earbuds', name: 'Earbuds & Earphones', icon: Headphones },
  { id: 'cases', name: 'Cases & Covers', icon: Shield },
];

// Sample mobile products with BDT pricing
const products: Product[] = [
  {
    id: 'm1',
    name: '65W GaN Fast Charger',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    category: 'chargers',
    description: 'Ultra-compact GaN charger with USB-C PD and USB-A ports',
    inStock: true,
    rating: 4.8,
    reviews: 456
  },
  {
    id: 'm2',
    name: 'USB-C to Lightning Cable 2m',
    price: 999,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    category: 'chargers',
    description: 'MFi certified braided cable for fast charging',
    inStock: true,
    rating: 4.6,
    reviews: 234
  },
  {
    id: 'm3',
    name: '20000mAh Power Bank Pro',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    category: 'powerbanks',
    description: '65W fast charging, LED display, dual USB-C ports',
    inStock: true,
    rating: 4.9,
    reviews: 567
  },
  {
    id: 'm4',
    name: '10000mAh Slim Power Bank',
    price: 1999,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
    category: 'powerbanks',
    description: 'Ultra-slim design, fits in your pocket',
    inStock: true,
    rating: 4.5,
    reviews: 189
  },
  {
    id: 'm5',
    name: 'True Wireless Earbuds Pro',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    category: 'earbuds',
    description: 'ANC, 30hr battery, wireless charging case',
    inStock: true,
    rating: 4.7,
    reviews: 678
  },
  {
    id: 'm6',
    name: 'Wired Earphones HD',
    price: 799,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    category: 'earbuds',
    description: 'Type-C connector, built-in microphone',
    inStock: true,
    rating: 4.3,
    reviews: 145
  },
  {
    id: 'm7',
    name: 'Premium Leather Case',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=400&h=300&fit=crop',
    category: 'cases',
    description: 'Genuine leather case with card slots',
    inStock: true,
    rating: 4.6,
    reviews: 234
  },
  {
    id: 'm8',
    name: 'Rugged Armor Case',
    price: 899,
    image: 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=400&h=300&fit=crop',
    category: 'cases',
    description: 'Military-grade drop protection',
    inStock: false,
    rating: 4.8,
    reviews: 456
  },
];

const MobileAccessoriesContent = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Mobile Accessories</h1>
          <p className="text-muted-foreground text-lg">
            Chargers, power banks, earbuds, and cases for your mobile devices
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

const MobileAccessories = () => (
  <CartProvider>
    <MobileAccessoriesContent />
  </CartProvider>
);

export default MobileAccessories;
