import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Truck, Shield, Headphones } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-brand-gold">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">Premium Tech Accessories in Bangladesh</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Elevate Your
                <span className="text-brand-gold block">
                  Tech Experience
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Discover premium keyboards, gaming mice, headsets, and mobile accessories. 
                Quality products at the best prices in Bangladesh.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/pc-accessories">
                <Button 
                  size="lg" 
                  className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark px-8 font-semibold w-full sm:w-auto"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark px-8 w-full sm:w-auto"
                >
                  Contact Us
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-5 h-5 text-brand-gold" />
                <span className="text-sm">Free Dhaka Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-brand-gold" />
                <span className="text-sm">Genuine Products</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Headphones className="w-5 h-5 text-brand-gold" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right side - Hero image/graphics */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-card rounded-2xl p-6 shadow-2xl border border-border">
                <img
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop"
                  alt="Premium Gaming Setup"
                  className="w-full h-72 object-cover rounded-xl"
                />
                
                {/* Floating product cards */}
                <div className="absolute -top-4 -left-4 bg-brand-gold text-brand-dark p-3 rounded-lg shadow-lg">
                  <div className="text-sm font-semibold">Gaming Keyboard</div>
                  <div className="text-xs font-bold">৳12,999</div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-card text-foreground p-3 rounded-lg shadow-lg border border-brand-gold">
                  <div className="text-sm font-semibold">Gaming Mouse</div>
                  <div className="text-xs font-bold text-brand-gold">৳6,999</div>
                </div>
              </div>
            </div>

            {/* Background decorative element */}
            <div className="absolute inset-0 bg-brand-gold/5 rounded-2xl blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
