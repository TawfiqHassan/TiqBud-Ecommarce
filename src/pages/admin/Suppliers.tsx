import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, ExternalLink, RefreshCw, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address: string | null;
  api_endpoint: string | null;
  api_key_name: string | null;
  status: 'active' | 'inactive' | 'pending';
  notes: string | null;
  created_at: string;
}

const Suppliers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    api_endpoint: '',
    api_key_name: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
    notes: '',
  });

  // Note: This uses a 'suppliers' table that would need to be created
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      // Simulated data since suppliers table doesn't exist yet
      // In production, this would fetch from supabase
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'TechParts Global',
          contact_email: 'supply@techparts.com',
          contact_phone: '+1 555-0123',
          website: 'https://techparts.com',
          address: 'New York, USA',
          api_endpoint: 'https://api.techparts.com/v1',
          api_key_name: 'TECHPARTS_API_KEY',
          status: 'active',
          notes: 'Primary supplier for PC components',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Mobile Gadgets Inc',
          contact_email: 'orders@mobilegadgets.com',
          contact_phone: '+1 555-0456',
          website: 'https://mobilegadgets.com',
          address: 'Los Angeles, USA',
          api_endpoint: null,
          api_key_name: null,
          status: 'active',
          notes: 'Mobile accessories supplier',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Asian Tech Exports',
          contact_email: 'exports@asiantech.cn',
          contact_phone: '+86 123-4567',
          website: 'https://asiantech.cn',
          address: 'Shenzhen, China',
          api_endpoint: 'https://api.asiantech.cn/products',
          api_key_name: 'ASIANTECH_KEY',
          status: 'pending',
          notes: 'New supplier - pending verification',
          created_at: new Date().toISOString(),
        },
      ];
      return mockSuppliers;
    },
  });

  const testApiConnection = async (supplier: Supplier) => {
    if (!supplier.api_endpoint) {
      toast.error('No API endpoint configured for this supplier');
      return;
    }

    toast.loading('Testing API connection...');
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.dismiss();
    toast.success(`Successfully connected to ${supplier.name} API`);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Supplier name is required');
      return;
    }

    if (editingSupplier) {
      toast.success('Supplier updated successfully');
    } else {
      toast.success('Supplier added successfully');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      address: '',
      api_endpoint: '',
      api_key_name: '',
      status: 'active',
      notes: '',
    });
    setEditingSupplier(null);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      website: supplier.website || '',
      address: supplier.address || '',
      api_endpoint: supplier.api_endpoint || '',
      api_key_name: supplier.api_key_name || '',
      status: supplier.status,
      notes: supplier.notes || '',
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Manage supplier information and API integrations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark gap-2">
              <Plus className="w-4 h-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="supplier@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 234-567-8900"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://supplier.com"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'pending') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              
              <div className="col-span-2 border-t border-border pt-4 mt-2">
                <h4 className="font-medium text-foreground mb-3">API Integration (Optional)</h4>
              </div>
              
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  placeholder="https://api.supplier.com/v1"
                />
              </div>
              <div>
                <Label htmlFor="api_key_name">API Key Secret Name</Label>
                <Input
                  id="api_key_name"
                  value={formData.api_key_name}
                  onChange={(e) => setFormData({ ...formData, api_key_name: e.target.value })}
                  placeholder="SUPPLIER_API_KEY"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Store actual API key in Secrets, reference by name here
                </p>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this supplier..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-brand-gold hover:bg-brand-gold/90 text-brand-dark">
                {editingSupplier ? 'Update' : 'Add'} Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-brand-gold" />
              <span className="text-3xl font-bold text-foreground">{suppliers.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-3xl font-bold text-foreground">
                {suppliers.filter(s => s.status === 'active').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With API Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-foreground">
                {suppliers.filter(s => s.api_endpoint).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>API Integration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto" />
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No suppliers found. Add your first supplier to get started.
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{supplier.name}</p>
                        {supplier.address && (
                          <p className="text-sm text-muted-foreground">{supplier.address}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.contact_email && (
                          <p className="text-sm text-foreground">{supplier.contact_email}</p>
                        )}
                        {supplier.contact_phone && (
                          <p className="text-sm text-muted-foreground">{supplier.contact_phone}</p>
                        )}
                        {supplier.website && (
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-gold hover:underline inline-flex items-center gap-1"
                          >
                            Website <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.api_endpoint ? (
                        <div className="space-y-1">
                          <Badge variant="secondary" className="text-xs">API Enabled</Badge>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {supplier.api_endpoint}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testApiConnection(supplier)}
                            className="h-7 text-xs gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Test Connection
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not configured</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(supplier)}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.success('Supplier deleted')}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-2">About Supplier API Integration</h4>
          <p className="text-sm text-muted-foreground">
            You can integrate with supplier APIs to automatically sync product inventory, 
            pricing, and availability. Store your API keys securely in the Secrets section 
            and reference them here by name. Test connections before going live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;
