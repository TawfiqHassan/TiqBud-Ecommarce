-- Add is_approved column to profiles for admin approval workflow
ALTER TABLE public.profiles ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Update existing profiles to be approved (so current users aren't locked out)
UPDATE public.profiles SET is_approved = true;

-- Add index for faster querying of unapproved users
CREATE INDEX idx_profiles_is_approved ON public.profiles(is_approved);

-- Insert default site settings for hero, announcement bar, and footer
INSERT INTO public.site_settings (key, value) VALUES 
  ('hero', '{"title": "Premium Tech & Gadgets", "subtitle": "Discover the best PC and mobile accessories at unbeatable prices", "image_url": "", "cta_text": "Shop Now", "cta_link": "/pc-accessories"}'),
  ('announcement_bar', '{"message": "Free Delivery in Dhaka on orders over ৳5,000!", "phone": "+880 1XXX-XXXXXX", "is_visible": true}'),
  ('footer', '{"about": "TiqBud is your one-stop destination for premium tech accessories. We bring you the best quality products at competitive prices.", "address": "Dhaka, Bangladesh", "email": "info@tiqbud.com", "phone": "+880 1XXX-XXXXXX", "facebook": "", "instagram": "", "youtube": ""}'),
  ('navbar', '{"logo_url": "", "show_search": true, "menu_items": []}')
ON CONFLICT (key) DO NOTHING;