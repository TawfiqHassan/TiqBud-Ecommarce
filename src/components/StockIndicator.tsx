import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, XCircle } from 'lucide-react';

interface StockIndicatorProps {
  stock: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StockIndicator = ({ stock, showCount = true, size = 'md' }: StockIndicatorProps) => {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (stock <= 0) {
    return (
      <Badge 
        variant="destructive" 
        className={`${sizeClasses[size]} flex items-center gap-1 bg-red-500/20 text-red-500 border-red-500/30`}
      >
        <XCircle className={iconSizes[size]} />
        Out of Stock
      </Badge>
    );
  }

  if (stock <= 5) {
    return (
      <Badge 
        className={`${sizeClasses[size]} flex items-center gap-1 bg-orange-500/20 text-orange-500 border-orange-500/30 animate-pulse`}
      >
        <AlertTriangle className={iconSizes[size]} />
        Only {stock} left!
      </Badge>
    );
  }

  if (stock <= 10) {
    return (
      <Badge 
        className={`${sizeClasses[size]} flex items-center gap-1 bg-yellow-500/20 text-yellow-600 border-yellow-500/30`}
      >
        <Package className={iconSizes[size]} />
        {showCount ? `${stock} in stock` : 'Low Stock'}
      </Badge>
    );
  }

  return (
    <Badge 
      className={`${sizeClasses[size]} flex items-center gap-1 bg-green-500/20 text-green-500 border-green-500/30`}
    >
      <Package className={iconSizes[size]} />
      {showCount ? `${stock} in stock` : 'In Stock'}
    </Badge>
  );
};

export default StockIndicator;
