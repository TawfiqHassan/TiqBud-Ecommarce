-- Fix cart_items to support non-UUID product ids used by some catalog pages
-- Drop FK first (if it exists)
ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

-- Convert product_id from uuid -> text
ALTER TABLE public.cart_items
  ALTER COLUMN product_id TYPE text USING product_id::text;

-- Ensure unique constraint remains correct (recreate defensively)
ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON public.cart_items (user_id, product_id);