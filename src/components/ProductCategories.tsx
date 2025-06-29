
import { Keyboard, Mouse, Gamepad2, Headphones, Volume2, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProductCategories = () => {
  // Product categories with icons and details
  const categories = [
    {
      id: 'keyboards',
      name: 'Keyboards',
      icon: Keyboard,
      description: 'Mechanical & Gaming Keyboards',
      productCount: '150+',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'mice',
      name: 'Gaming Mice',
      icon: Mouse,
      description: 'Precision Gaming Mice',
      productCount: '80+',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'gamepads',
      name: 'Gamepads',
      icon: Gamepad2,
      description: 'Controllers & Gamepads',
      productCount: '45+',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'headsets',
      name: 'Headsets',
      icon: Headphones,
      description: 'Gaming & Professional Headsets',
      productCount: '120+',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'speakers',
      name: 'Speakers',
      icon: Volume2,
      description: 'Desktop & Gaming Speakers',
      productCount: '60+',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: Monitor,
      description: 'Cables, Stands & More',
      productCount: '200+',
      color: 'from-teal-500 to-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore our comprehensive collection of premium tech accessories and gaming peripherals
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Card 
                key={category.id}
                className="group bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <CardContent className="p-8 text-center">
                  {/* Category icon with gradient background */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>

                  {/* Category information */}
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-slate-300 mb-4">
                    {category.description}
                  </p>
                  
                  <div className="text-blue-400 font-semibold">
                    {category.productCount} Products
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600">
            <h3 className="text-2xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-slate-300 mb-6">
              Contact our expert team for personalized recommendations
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
