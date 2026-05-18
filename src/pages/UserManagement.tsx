import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Shield, Loader2, X, User } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", name: "", email: "", password: "", role: "USER" });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data;
    },
    enabled: currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER",
  });

  const createMutation = useMutation({
    mutationFn: async (newUser: any) => await api.post("/users", newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setIsAddModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await api.patch(`/users/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete user"),
  });

  if (currentUser?.role !== "ADMIN") {
    return <div className="flex h-[80vh] items-center justify-center p-8 text-muted-foreground">You do not have permission to view this page.</div>;
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddModalOpen) {
      createMutation.mutate({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
    } else if (isEditModalOpen) {
      updateMutation.mutate({ id: formData.id, name: formData.name, email: formData.email, role: formData.role });
    }
  };

  const openAddModal = () => {
    setFormData({ id: "", name: "", email: "", password: "", role: "USER" });
    setIsAddModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setFormData({ id: u.id, name: u.name, email: u.email, password: "", role: u.role });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
        </div>
        <Button onClick={openAddModal} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                        u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        u.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role === 'MANAGER' && <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(u)} className="h-8 w-8 hover:text-primary transition-colors hover:bg-primary/10">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          disabled={currentUser?.id === u.id}
                          className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 text-muted-foreground transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <User className="h-12 w-12 text-muted/50 mb-3" />
                        <p>No users found in the system.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                {isAddModalOpen ? <Plus className="h-5 w-5 text-primary" /> : <Pencil className="h-5 w-5 text-primary" />}
                {isAddModalOpen ? 'Add New User' : 'Edit User'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="-mr-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSaveUser} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-10 transition-colors focus-visible:ring-primary/50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-10 transition-colors focus-visible:ring-primary/50" />
              </div>
              
              {isAddModalOpen && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required={isAddModalOpen} minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="h-10 transition-colors focus-visible:ring-primary/50" placeholder="Minimum 6 characters" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <select 
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">Staff / Regular User</option>
                  <option value="MANAGER">Asset Manager</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6 pt-6">
                <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-primary/90 shadow-sm">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isAddModalOpen ? 'Create User' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
