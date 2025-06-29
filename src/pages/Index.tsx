
import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductCategories from '@/components/ProductCategories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header with navigation and cart */}
        <Header />
        
        {/* Hero section with main banner */}
        <Hero />
        
        {/* Product categories section */}
        <ProductCategories />
        
        {/* Featured products section */}
        <FeaturedProducts />
        
        {/* Footer */}
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Index;
