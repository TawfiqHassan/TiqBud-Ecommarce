-- Create shipping zones table for Inside/Outside Dhaka pricing
CREATE TABLE public.shipping_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  shipping_rate NUMERIC NOT NULL DEFAULT 0,
  free_shipping_threshold NUMERIC,
  estimated_days TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipping zones" ON public.shipping_zones
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones
FOR ALL USING (is_admin());

-- Insert default zones for Bangladesh
INSERT INTO public.shipping_zones (name, regions, shipping_rate, free_shipping_threshold, estimated_days)
VALUES 
  ('Inside Dhaka', ARRAY['Dhaka'], 60, 2000, '1-2 days'),
  ('Outside Dhaka', ARRAY['Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'], 120, 3000, '3-5 days');

-- Create product variants table for size/color options
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price_adjustment NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active variants" ON public.product_variants
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage variants" ON public.product_variants
FOR ALL USING (is_admin());

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

-- Create returns/refunds table
CREATE TABLE public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  refund_amount NUMERIC,
  admin_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their returns" ON public.returns
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create returns" ON public.returns
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage returns" ON public.returns
FOR ALL USING (is_admin());

CREATE INDEX idx_returns_order_id ON public.returns(order_id);
CREATE INDEX idx_returns_user_id ON public.returns(user_id);

-- Create flash sales table
CREATE TABLE public.flash_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active flash sales" ON public.flash_sales
FOR SELECT USING (is_active = true AND start_time <= now() AND end_time >= now());

CREATE POLICY "Admins can manage flash sales" ON public.flash_sales
FOR ALL USING (is_admin());

-- Create flash sale products junction table
CREATE TABLE public.flash_sale_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flash_sale_id UUID NOT NULL REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price NUMERIC NOT NULL,
  max_quantity INTEGER,
  sold_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flash_sale_id, product_id)
);

ALTER TABLE public.flash_sale_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flash sale products" ON public.flash_sale_products
FOR SELECT USING (true);

CREATE POLICY "Admins can manage flash sale products" ON public.flash_sale_products
FOR ALL USING (is_admin());

-- Add cancellation support to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Update order status check for cancellation
CREATE POLICY "Users can cancel their own pending orders" ON public.orders
FOR UPDATE USING (
  auth.uid() = user_id 
  AND status = 'pending'
) WITH CHECK (
  auth.uid() = user_id 
  AND status IN ('pending', 'cancelled')
);

-- Create triggers for updated_at
CREATE TRIGGER update_shipping_zones_updated_at
BEFORE UPDATE ON public.shipping_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_returns_updated_at
BEFORE UPDATE ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at
BEFORE UPDATE ON public.flash_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();