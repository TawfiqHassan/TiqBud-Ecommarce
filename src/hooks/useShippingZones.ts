import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  shipping_rate: number;
  free_shipping_threshold: number | null;
  estimated_days: string | null;
  is_active: boolean;
}

export const useShippingZones = () => {
  return useQuery({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('is_active', true)
        .order('shipping_rate', { ascending: true });
      
      if (error) throw error;
      return data as ShippingZone[];
    }
  });
};

export const getShippingRateForCity = (city: string, zones: ShippingZone[], subtotal: number): { 
  rate: number; 
  zone: ShippingZone | null;
  isFreeShipping: boolean;
} => {
  const normalizedCity = city.toLowerCase().trim();
  
  // Find matching zone
  for (const zone of zones) {
    const matchesZone = zone.regions.some(
      region => region.toLowerCase() === normalizedCity
    );
    
    if (matchesZone) {
      const isFreeShipping = zone.free_shipping_threshold 
        ? subtotal >= zone.free_shipping_threshold 
        : false;
      
      return {
        rate: isFreeShipping ? 0 : zone.shipping_rate,
        zone,
        isFreeShipping
      };
    }
  }
  
  // Default to "Outside Dhaka" rate if no match
  const outsideDhaka = zones.find(z => z.name.toLowerCase().includes('outside'));
  if (outsideDhaka) {
    const isFreeShipping = outsideDhaka.free_shipping_threshold 
      ? subtotal >= outsideDhaka.free_shipping_threshold 
      : false;
    
    return {
      rate: isFreeShipping ? 0 : outsideDhaka.shipping_rate,
      zone: outsideDhaka,
      isFreeShipping
    };
  }
  
  return { rate: 120, zone: null, isFreeShipping: false };
};
