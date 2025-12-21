import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

interface ProductFiltersProps {
  availableBrands: string[];
  maxPrice: number;
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  availableBrands,
  maxPrice,
  onFilterChange,
  initialFilters
}) => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, maxPrice],
    brands: [],
    inStockOnly: false,
    onSaleOnly: false,
    ...initialFilters
  });

  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], Math.min(prev.priceRange[1], maxPrice)]
    }));
  }, [maxPrice]);

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (key: 'inStockOnly' | 'onSaleOnly') => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: FilterState = {
      priceRange: [0, maxPrice],
      brands: [],
      inStockOnly: false,
      onSaleOnly: false
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilterCount = 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0) +
    filters.brands.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Price Range */}
      <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen} className="mb-4">
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Price Range
          {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-4">
            <Slider
              value={[filters.priceRange[0], filters.priceRange[1]]}
              min={0}
              max={maxPrice}
              step={100}
              onValueChange={handlePriceChange}
              className="mt-2"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange([Number(e.target.value), filters.priceRange[1]])}
                  className="h-8 text-sm"
                />
              </div>
              <span className="text-muted-foreground mt-5">-</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange([filters.priceRange[0], Number(e.target.value)])}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              ৳{filters.priceRange[0].toLocaleString()} - ৳{filters.priceRange[1].toLocaleString()}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <Collapsible open={isBrandOpen} onOpenChange={setIsBrandOpen} className="mb-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            Brands
            {filters.brands.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{filters.brands.length}</Badge>
            )}
            {isBrandOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm cursor-pointer flex-1 text-muted-foreground hover:text-foreground"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Additional Options */}
      <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Options
          {isOptionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStockOnly"
                checked={filters.inStockOnly}
                onCheckedChange={() => handleCheckboxChange('inStockOnly')}
              />
              <label
                htmlFor="inStockOnly"
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                In Stock Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onSaleOnly"
                checked={filters.onSaleOnly}
                onCheckedChange={() => handleCheckboxChange('onSaleOnly')}
              />
              <label
                htmlFor="onSaleOnly"
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                On Sale Only
              </label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ProductFilters;
