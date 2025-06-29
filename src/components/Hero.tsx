
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative py-20 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-400">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">Premium Tech Accessories</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Elevate Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Gaming Setup
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                Discover premium keyboards, gaming mice, headsets, and more. 
                Professional-grade peripherals for gamers and tech enthusiasts.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3 text-lg"
              >
                View Categories
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-slate-400 text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-slate-400 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99%</div>
                <div className="text-slate-400 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right side - Hero image/graphics */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main product showcase image */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop"
                  alt="Premium Gaming Setup"
                  className="w-full h-80 object-cover rounded-xl"
                />
                
                {/* Floating product cards */}
                <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg">
                  <div className="text-sm font-semibold">Gaming Keyboard</div>
                  <div className="text-xs opacity-90">$149.99</div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-purple-500 text-white p-3 rounded-lg shadow-lg">
                  <div className="text-sm font-semibold">Gaming Mouse</div>
                  <div className="text-xs opacity-90">$89.99</div>
                </div>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
