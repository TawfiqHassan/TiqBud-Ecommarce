import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSettings {
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
}

export interface AnnouncementSettings {
  message: string;
  phone: string;
  is_visible: boolean;
}

export interface FooterSettings {
  about: string;
  address: string;
  email: string;
  phone: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface SiteSettingsData {
  hero: HeroSettings;
  announcement_bar: AnnouncementSettings;
  footer: FooterSettings;
}

const defaultSettings: SiteSettingsData = {
  hero: {
    title: 'Premium Tech & Gadgets',
    subtitle: 'Discover the best PC and mobile accessories at unbeatable prices',
    image_url: '',
    cta_text: 'Shop Now',
    cta_link: '/pc-accessories'
  },
  announcement_bar: {
    message: 'Free Delivery in Dhaka on orders over ৳5,000!',
    phone: '+880 1XXX-XXXXXX',
    is_visible: true
  },
  footer: {
    about: 'TiqBud is your one-stop destination for premium tech accessories.',
    address: 'Dhaka, Bangladesh',
    email: 'info@tiqbud.com',
    phone: '+880 1XXX-XXXXXX',
    facebook: '',
    instagram: '',
    youtube: ''
  }
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['hero', 'announcement_bar', 'footer']);
      
      if (error) throw error;
      
      const settings: SiteSettingsData = { ...defaultSettings };
      
      data?.forEach(item => {
        if (item.key === 'hero' && item.value) {
          settings.hero = { ...defaultSettings.hero, ...(item.value as unknown as HeroSettings) };
        }
        if (item.key === 'announcement_bar' && item.value) {
          settings.announcement_bar = { ...defaultSettings.announcement_bar, ...(item.value as unknown as AnnouncementSettings) };
        }
        if (item.key === 'footer' && item.value) {
          settings.footer = { ...defaultSettings.footer, ...(item.value as unknown as FooterSettings) };
        }
      });
      
      return settings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
