-- Create suppliers table to store external supplier API configurations
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  api_endpoint TEXT,
  api_key TEXT, -- Encrypted API key for the supplier
  api_headers JSONB DEFAULT '{}', -- Custom headers required by the API
  auth_type TEXT DEFAULT 'bearer', -- 'bearer', 'api_key', 'basic', 'custom'
  product_mapping JSONB DEFAULT '{}', -- How to map supplier fields to our product fields
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Only admins can manage suppliers
CREATE POLICY "Admins can manage suppliers"
  ON public.suppliers
  FOR ALL
  USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();