import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Phone, Mail, FileText, Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VendorsApi } from "@/lib/api/vendors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { vendorSchema, VendorSchema } from "@/lib/validations/procurement";

export default function Vendors() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VendorSchema>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    isPreferred: false
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await VendorsApi.getAll();
      setVendors(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to fetch vendors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVendor = async () => {
    try {
      // Small basic validation
      const parseResult = vendorSchema.safeParse(formData);
      if (!parseResult.success) {
        toast({ variant: "destructive", title: parseResult.error.errors[0].message });
        return;
      }
      
      setIsSubmitting(true);
      await VendorsApi.create(parseResult.data);
      toast({ title: "Vendor created successfully" });
      setIsAddModalOpen(false);
      setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", gstNumber: "", isPreferred: false });
      fetchVendors();
    } catch (error: any) {
      toast({ variant: "destructive", title: error?.response?.data?.message || "Error creating vendor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendor Management</h2>
            <p className="text-muted-foreground">Manage your approved suppliers and partners</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>
                  Enter the supplier's details to add them to the vendor directory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">Tax ID / GST Number</Label>
                  <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="isPreferred" 
                    checked={formData.isPreferred} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPreferred: !!checked }))}
                  />
                  <Label htmlFor="isPreferred" className="cursor-pointer font-normal">
                    Mark as Preferred Vendor
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVendor} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Vendor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className={vendor.isPreferred ? "border-primary/50 bg-primary/5" : ""}>
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{vendor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">ID: {vendor.id}</p>
                      </div>
                    </div>
                    {vendor.isPreferred && (
                      <Badge variant="default" className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Star className="h-3 w-3 fill-current" /> Preferred
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid gap-2 text-sm">
                    {vendor.contactPerson && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground w-16">Contact:</span> {vendor.contactPerson}
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <Mail className="h-4 w-4 shrink-0"/> {vendor.email}
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0"/> {vendor.phone}
                      </div>
                    )}
                    {vendor.gstNumber && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4 shrink-0"/> Tax/GST: {vendor.gstNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {vendors.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <p>No vendors registered yet.</p>
                <p className="text-sm">Click the Add Vendor button to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}