
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

  // Sample featured products data
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'TiqBud Pro Mechanical Keyboard',
      price: 149.99,
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
      price: 89.99,
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
      price: 199.99,
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
      price: 79.99,
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
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=300&fit=crop',
      category: 'Speakers',
      description: 'High-quality desktop speakers with deep bass and crystal clear highs',
      inStock: true,
      rating: 4.5,
      reviews: 167
    },
    {
      id: '6',
      name: 'Professional Workstation Setup',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
      category: 'Accessories',
      description: 'Complete workstation setup with monitor stand and cable management',
      inStock: false,
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
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-400/50 text-yellow-400'
            : 'text-slate-600'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-slate-800/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover our most popular and highest-rated tech accessories
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Card 
              key={product.id}
              className="group bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl overflow-hidden"
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
                  <Badge className="bg-blue-500 hover:bg-blue-600">
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
                          : 'text-slate-600'
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Rating and reviews */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-slate-400">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price and add to cart */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-2xl font-bold text-white">
                      ${product.price}
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View all products button */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
