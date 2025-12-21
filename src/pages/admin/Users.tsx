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
import { Check, X, Shield, Users, Clock } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  is_approved: boolean;
  created_at: string;
  role?: string;
}

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch roles for each user
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return profiles.map(p => ({
        ...p,
        role: rolesMap.get(p.user_id) || 'user'
      })) as UserProfile[];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: approved })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(approved ? 'User approved' : 'User access revoked');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      }
    },
    onSuccess: (_, { isAdmin }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(isAdmin ? 'Admin role removed' : 'Admin role granted');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const pendingUsers = users?.filter(u => !u.is_approved) || [];
  const approvedUsers = users?.filter(u => u.is_approved) || [];

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

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
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Approve users and manage admin access</p>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Clock className="h-5 w-5" />
              Pending Approvals ({pendingUsers.length})
            </CardTitle>
            <CardDescription>Users waiting for account approval</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveMutation.mutate({ userId: user.user_id, approved: true })}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => approveMutation.mutate({ userId: user.user_id, approved: false })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
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

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <><Shield className="h-3 w-3 mr-1" /> Admin</>
                      ) : (
                        'User'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant={user.role === 'admin' ? 'destructive' : 'outline'}
                        onClick={() => toggleAdminMutation.mutate({ 
                          userId: user.user_id, 
                          isAdmin: user.role === 'admin' 
                        })}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveMutation.mutate({ userId: user.user_id, approved: false })}
                      >
                        Revoke Access
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {approvedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No approved users yet.
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

export default AdminUsers;
