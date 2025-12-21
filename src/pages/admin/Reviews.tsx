import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { Check, X, Star, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  product_name?: string;
  user_email?: string;
}

const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products:product_id (name),
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((r: any) => ({
        ...r,
        product_name: r.products?.name || 'Unknown Product',
        user_email: r.profiles?.email || 'Unknown User'
      })) as Review[];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: approved })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(approved ? 'Review approved' : 'Review rejected');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const pendingReviews = reviews?.filter(r => !r.is_approved) || [];
  const approvedReviews = reviews?.filter(r => r.is_approved) || [];

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-brand-gold text-brand-gold' : 'text-muted'}`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Reviews</h1>
        <p className="text-muted-foreground">Approve and manage customer reviews</p>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <MessageSquare className="h-5 w-5" />
              Pending Approval ({pendingReviews.length})
            </CardTitle>
            <CardDescription>Reviews waiting for moderation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.product_name}</TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {review.title && <p className="font-medium">{review.title}</p>}
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{review.user_email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveMutation.mutate({ id: review.id, approved: true })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(review.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Approved Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Approved Reviews ({approvedReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.product_name}</TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {review.title && <p className="font-medium">{review.title}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{review.user_email}</TableCell>
                  <TableCell className="text-sm">{new Date(review.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Delete this review?')) {
                          deleteMutation.mutate(review.id);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {approvedReviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No approved reviews yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
