import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProcurementApi } from "@/lib/api/procurement";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { z } from "zod";
import { createProcurementSchema, CreateProcurementSchema } from "@/lib/validations/procurement";

const AddProcurement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreateProcurementSchema>({
    requestTitle: "",
    itemName: "",
    category: "",
    assetType: "",
    department: "",
    quantity: 1,
    requiredDate: "",
    priority: "MEDIUM",
    justification: "",
    technicalSpecs: "",
    status: "DRAFT",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    try {
      createProcurementSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please check the form for errors.",
        });
      }
      return false;
    }
  };

  const handleSubmit = async (action: 'DRAFT' | 'SUBMITTED') => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await ProcurementApi.create({ ...formData, status: action });
      
      toast({
        title: action === 'DRAFT' ? "Draft Saved" : "Request Submitted",
        description: `Your procurement request has been ${action === 'DRAFT' ? 'saved as draft' : 'submitted successfully'}.`,
      });
      
      navigate("/procurement");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">New Procurement Request</h2>
            <p className="text-muted-foreground">
              Step 1: Department Request Information
            </p>
          </div>
        </div>

        <Card className="max-w-4xl">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <CardTitle>Request Details</CardTitle>
            </div>
            <CardDescription>Fill in the required information for the procurement request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="requestTitle">Request Title <span className="text-red-500">*</span></Label>
                <Input
                  id="requestTitle"
                  name="requestTitle"
                  placeholder="e.g., Replacement Laptops for Q3"
                  value={formData.requestTitle}
                  onChange={handleChange}
                  className={errors.requestTitle ? "border-red-500" : ""}
                />
                {errors.requestTitle && <p className="text-sm text-red-500">{errors.requestTitle}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select value={formData.category} onValueChange={(val) => handleSelectChange('category', val)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it-assets">IT Assets</SelectItem>
                    <SelectItem value="office-equipment">Office Equipment</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetType">Asset Type <span className="text-red-500">*</span></Label>
                <Input
                  id="assetType"
                  name="assetType"
                  placeholder="e.g., Laptop, Printer, Chair"
                  value={formData.assetType}
                  onChange={handleChange}
                  className={errors.assetType ? "border-red-500" : ""}
                />
                {errors.assetType && <p className="text-sm text-red-500">{errors.assetType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName">Specific Item Name / Model <span className="text-red-500">*</span></Label>
                <Input
                  id="itemName"
                  name="itemName"
                  placeholder="e.g., Dell ThinkPad XPS"
                  value={formData.itemName}
                  onChange={handleChange}
                  className={errors.itemName ? "border-red-500" : ""}
                />
                {errors.itemName && <p className="text-sm text-red-500">{errors.itemName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Select value={formData.department} onValueChange={(val) => handleSelectChange('department', val)}>
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredDate">Required Date <span className="text-red-500">*</span></Label>
                <Input
                  id="requiredDate"
                  name="requiredDate"
                  type="date"
                  value={formData.requiredDate}
                  onChange={handleChange}
                  className={errors.requiredDate ? "border-red-500" : ""}
                />
                {errors.requiredDate && <p className="text-sm text-red-500">{errors.requiredDate}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="priority">Priority Level <span className="text-red-500">*</span></Label>
                <Select value={formData.priority} onValueChange={(val) => handleSelectChange('priority', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Routine purchase</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Standard requirement</SelectItem>
                    <SelectItem value="HIGH">High - Business impacting</SelectItem>
                    <SelectItem value="URGENT">Urgent - Business critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="justification">Business Justification <span className="text-red-500">*</span></Label>
                <Textarea
                  id="justification"
                  name="justification"
                  placeholder="Explain why this procurement is needed..."
                  className={`min-h-[100px] ${errors.justification ? "border-red-500" : ""}`}
                  value={formData.justification}
                  onChange={handleChange}
                />
                {errors.justification && <p className="text-sm text-red-500">{errors.justification}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="technicalSpecs">Technical Specifications (Optional)</Label>
                <Textarea
                  id="technicalSpecs"
                  name="technicalSpecs"
                  placeholder="Enter any specific technical requirements..."
                  className="min-h-[100px]"
                  value={formData.technicalSpecs}
                  onChange={handleChange}
                />
              </div>

            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t p-6 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/procurement")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSubmit('DRAFT')}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                type="submit"
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Submit Request
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddProcurement;
