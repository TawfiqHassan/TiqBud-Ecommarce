import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCategories } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  inStock: boolean;
  onSale: boolean;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'name';
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  maxPrice?: number;
}

const AdvancedSearchFilters = ({ filters, onFiltersChange, maxPrice = 100000 }: AdvancedSearchFiltersProps) => {
  const { data: categories = [] } = useCategories();
  const [brands, setBrands] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    brand: true,
    availability: true,
  });

  useEffect(() => {
    // Fetch unique brands
    const fetchBrands = async () => {
      const { data } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null)
        .eq('is_active', true);
      
      if (data) {
        const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))] as string[];
        setBrands(uniqueBrands);
      }
    };
    fetchBrands();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      categories: [],
      brands: [],
      inStock: false,
      onSale: false,
      sortBy: 'newest',
    });
  };

  const activeFilterCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice,
    filters.categories.length > 0,
    filters.brands.length > 0,
    filters.inStock,
    filters.onSale,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Active Filters</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-muted-foreground">
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.categories.map(catId => {
              const cat = categories.find(c => c.id === catId);
              return cat ? (
                <Badge key={catId} variant="secondary" className="gap-1">
                  {cat.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({
                    categories: filters.categories.filter(id => id !== catId)
                  })} />
                </Badge>
              ) : null;
            })}
            {filters.brands.map(brand => (
              <Badge key={brand} variant="secondary" className="gap-1">
                {brand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({
                  brands: filters.brands.filter(b => b !== brand)
                })} />
              </Badge>
            ))}
            {filters.inStock && (
              <Badge variant="secondary" className="gap-1">
                In Stock
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ inStock: false })} />
              </Badge>
            )}
            {filters.onSale && (
              <Badge variant="secondary" className="gap-1">
                On Sale
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ onSale: false })} />
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Price Range */}
      <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="font-medium text-foreground">Price Range</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <Slider
            value={filters.priceRange}
            min={0}
            max={maxPrice}
            step={500}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            className="mt-2"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilters({ priceRange: [Number(e.target.value), filters.priceRange[1]] })}
              className="h-8"
              placeholder="Min"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], Number(e.target.value)] })}
              className="h-8"
              placeholder="Max"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Categories */}
      <Collapsible open={expandedSections.category} onOpenChange={() => toggleSection('category')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="font-medium text-foreground">Categories</span>
          {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilters({ categories: [...filters.categories, category.id] });
                  } else {
                    updateFilters({ categories: filters.categories.filter(id => id !== category.id) });
                  }
                }}
              />
              <Label htmlFor={`cat-${category.id}`} className="text-sm text-foreground cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Brands */}
      {brands.length > 0 && (
        <>
          <Collapsible open={expandedSections.brand} onOpenChange={() => toggleSection('brand')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <span className="font-medium text-foreground">Brands</span>
              {expandedSections.brand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({ brands: [...filters.brands, brand] });
                      } else {
                        updateFilters({ brands: filters.brands.filter(b => b !== brand) });
                      }
                    }}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-sm text-foreground cursor-pointer">
                    {brand}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
          <Separator />
        </>
      )}

      {/* Availability */}
      <Collapsible open={expandedSections.availability} onOpenChange={() => toggleSection('availability')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="font-medium text-foreground">Availability</span>
          {expandedSections.availability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
            />
            <Label htmlFor="in-stock" className="text-sm text-foreground cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={filters.onSale}
              onCheckedChange={(checked) => updateFilters({ onSale: !!checked })}
            />
            <Label htmlFor="on-sale" className="text-sm text-foreground cursor-pointer">
              On Sale
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-card">
        <SheetHeader>
          <SheetTitle className="text-foreground">Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterContent />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedSearchFilters;
