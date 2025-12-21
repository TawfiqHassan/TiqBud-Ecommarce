import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Plus, Trash2, GripVertical, Menu } from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
}

interface NavbarSettings {
  menu_items: MenuItem[];
}

const AdminNavbarSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['navbar-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'navbar')
        .maybeSingle();
      
      if (error) throw error;
      return data?.value as unknown as NavbarSettings | null;
    }
  });

  useEffect(() => {
    if (settings?.menu_items) {
      setMenuItems(settings.menu_items);
    } else {
      setMenuItems([
        { name: 'Home', href: '/' },
        { name: 'PC Accessories', href: '/pc-accessories' },
        { name: 'Mobile Accessories', href: '/mobile-accessories' },
        { name: 'Blog & Reviews', href: '/blog' },
        { name: 'Contact', href: '/contact' }
      ]);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (items: MenuItem[]) => {
      const valueData = { menu_items: items } as unknown as Json;
      
      // Check if exists first
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'navbar')
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ 
            value: valueData,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'navbar');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ 
            key: 'navbar', 
            value: valueData
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navbar-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings-public'] });
      toast.success('Navbar settings saved');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const handleAddItem = () => {
    setMenuItems([...menuItems, { name: '', href: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: 'name' | 'href', value: string) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;
    
    const updated = [...menuItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setMenuItems(updated);
  };

  const handleSave = () => {
    const validItems = menuItems.filter(item => item.name.trim() && item.href.trim());
    if (validItems.length === 0) {
      toast.error('Add at least one menu item');
      return;
    }
    saveMutation.mutate(validItems);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Navbar Settings</h1>
          <p className="text-muted-foreground">Customize navigation menu items</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark"
          disabled={saveMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Menu Items
          </CardTitle>
          <CardDescription>
            Drag to reorder, or use arrows. Items appear in the navigation bar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="flex flex-col gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleMoveItem(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleMoveItem(index, 'down')}
                  disabled={index === menuItems.length - 1}
                >
                  ↓
                </Button>
              </div>
              
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                    placeholder="Menu label"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Link</Label>
                  <Input
                    value={item.href}
                    onChange={(e) => handleUpdateItem(index, 'href', e.target.value)}
                    placeholder="/page-url"
                  />
                </div>
              </div>
              
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNavbarSettings;
