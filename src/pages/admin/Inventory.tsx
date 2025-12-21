import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  price: number;
  image_url: string | null;
  is_active: boolean;
}

const AdminInventory: React.FC = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, stock, price, image_url, is_active')
        .order('stock', { ascending: true });
      if (error) throw error;
      return data as Product[];
    }
  });

  const outOfStock = products?.filter(p => p.stock === 0) || [];
  const lowStock = products?.filter(p => p.stock > 0 && p.stock < 10) || [];
  const inStock = products?.filter(p => p.stock >= 10) || [];

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Out of Stock</Badge>;
    }
    if (stock < 10) {
      return <Badge className="bg-yellow-500/20 text-yellow-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low Stock</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Alerts</h1>
        <p className="text-muted-foreground">Monitor stock levels and low inventory alerts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-500/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStock.length}</div>
            <p className="text-xs text-muted-foreground">Products with 0 stock</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{lowStock.length}</div>
            <p className="text-xs text-muted-foreground">Products with less than 10</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{inStock.length}</div>
            <p className="text-xs text-muted-foreground">Products with 10+ stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Out of Stock Alert */}
      {outOfStock.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              Out of Stock Products
            </CardTitle>
            <CardDescription>These products need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStock.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{product.sku || '-'}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Products
            </CardTitle>
            <CardDescription>These products are running low</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{product.sku || '-'}</TableCell>
                    <TableCell className="font-bold text-yellow-500">{product.stock}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Products Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{product.sku || '-'}</TableCell>
                    <TableCell className="font-bold">{product.stock}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No products found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInventory;
