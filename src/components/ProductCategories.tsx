import { Link } from 'react-router-dom';
import { Keyboard, Mouse, Gamepad2, Headphones, Volume2, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProductCategories = () => {
  // Product categories with icons and details
  const categories = [
    {
      id: 'keyboards',
      name: 'Keyboards',
      icon: Keyboard,
      description: 'Mechanical & Gaming',
      productCount: '150+',
      href: '/pc-accessories'
    },
    {
      id: 'mice',
      name: 'Gaming Mice',
      icon: Mouse,
      description: 'Precision Gaming',
      productCount: '80+',
      href: '/pc-accessories'
    },
    {
      id: 'gamepads',
      name: 'Gamepads',
      icon: Gamepad2,
      description: 'Controllers',
      productCount: '45+',
      href: '/pc-accessories'
    },
    {
      id: 'headsets',
      name: 'Headsets',
      icon: Headphones,
      description: 'Gaming & Professional',
      productCount: '120+',
      href: '/pc-accessories'
    },
    {
      id: 'speakers',
      name: 'Speakers',
      icon: Volume2,
      description: 'Desktop & Gaming',
      productCount: '60+',
      href: '/pc-accessories'
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: Smartphone,
      description: 'Chargers & Earbuds',
      productCount: '200+',
      href: '/mobile-accessories'
    }
  ];

  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive collection of tech accessories
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Link key={category.id} to={category.href}>
                <Card className="group bg-card border-border hover:border-brand-gold/50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
                  <CardContent className="p-5 text-center">
                    {/* Category icon */}
                    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="w-7 h-7 text-brand-gold group-hover:text-brand-dark" />
                    </div>

                    {/* Category information */}
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-brand-gold transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-muted-foreground text-xs mb-2">
                      {category.description}
                    </p>
                    
                    <div className="text-brand-gold text-sm font-medium">
                      {category.productCount}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
