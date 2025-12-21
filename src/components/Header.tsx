import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import logo from '@/assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const location = useLocation();

  // Navigation menu items - restructured for TiqBud Bangladesh
  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'PC Accessories', href: '/pc-accessories' },
    { name: 'Mobile Accessories', href: '/mobile-accessories' },
    { name: 'Blog & Reviews', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  // Check if current route matches menu item
  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-brand-gold text-brand-dark text-center py-2 text-sm font-medium">
        🎉 Free Delivery in Dhaka on orders over ৳5,000! | Call: +880 1XXX-XXXXXX
      </div>

      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and brand name */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="TiqBud - Tech & Gadget" 
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop navigation menu */}
            <nav className="hidden lg:flex items-center space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-brand-gold'
                      : 'text-foreground/80 hover:text-brand-gold'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search bar for desktop */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-sm mx-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border focus:border-brand-gold focus:ring-brand-gold"
                />
              </div>
            </div>

            {/* Cart and mobile menu buttons */}
            <div className="flex items-center space-x-2">
              {/* Cart button with item count */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative text-foreground hover:text-brand-gold hover:bg-secondary"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-foreground hover:text-brand-gold hover:bg-secondary"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border">
              <div className="flex flex-col space-y-2 mt-4">
                {/* Mobile search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                
                {/* Mobile navigation links */}
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-3 px-4 rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-brand-gold/10 text-brand-gold font-semibold'
                        : 'text-foreground hover:text-brand-gold hover:bg-secondary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart drawer component */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
