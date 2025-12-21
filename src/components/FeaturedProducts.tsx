
import { useState } from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart, Product } from '@/context/CartContext';
import { toast } from 'sonner';

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Sample featured products data with BDT pricing
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'TiqBud Pro Mechanical Keyboard',
      price: 12999,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
      category: 'Keyboards',
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
      category: 'Mice',
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
      category: 'Headsets',
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
      category: 'Gamepads',
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
      category: 'Speakers',
      description: 'High-quality desktop speakers with deep bass and crystal clear highs',
      inStock: true,
      rating: 4.5,
      reviews: 167
    },
    {
      id: '6',
      name: '20000mAh Power Bank Pro',
      price: 3999,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',
      category: 'Mobile',
      description: '65W fast charging power bank with LED display',
      inStock: true,
      rating: 4.8,
      reviews: 89
    }
  ];

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  // Handle adding/removing from favorites
  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-brand-gold text-brand-gold'
            : i < rating
            ? 'fill-brand-gold/50 text-brand-gold'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular and highest-rated tech accessories
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Card 
              key={product.id}
              className="group bg-card border-border hover:border-brand-gold/50 transition-all duration-300 hover:shadow-xl overflow-hidden"
            >
              <div className="relative">
                {/* Product image */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-brand-gold text-brand-dark hover:bg-brand-gold-dark">
                    {product.category}
                  </Badge>
                  {!product.inStock && (
                    <Badge variant="destructive">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Action buttons overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toggleFavorite(product.id)}
                    className="w-10 h-10 p-0"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-10 h-10 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Product info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-brand-gold transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Rating and reviews */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xl font-bold text-foreground">
                      ৳{product.price.toLocaleString()}
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      size="sm"
                      className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {product.inStock ? 'Add' : 'Out'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button 
            size="lg"
            variant="outline"
            className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark px-8"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
