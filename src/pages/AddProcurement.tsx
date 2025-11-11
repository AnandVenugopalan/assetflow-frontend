import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { employees } from "@/lib/mockData";
import api from "../lib/api";

export default function AddProcurement() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state variables
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [quantity, setQuantity] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [justification, setJustification] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [budgetCode, setBudgetCode] = useState("");
  const [preferredVendor, setPreferredVendor] = useState("");
  const [alternateVendor, setAlternateVendor] = useState("");
  const [requiredBy, setRequiredBy] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [managerApprover, setManagerApprover] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        itemName: title,
        category,
        quantity: Number(quantity),
        estimatedCost: Number(estimatedCost),
        vendor: preferredVendor,
        requestedBy,
        status: "PENDING",
        priority,
        justification,
      };

      const res = await api.post("/procurement/requests", payload);

      toast.success("Purchase request submitted successfully!");
      navigate("/procurement");

    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting procurement request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/procurement")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Purchase Request</h1>
          <p className="text-muted-foreground mt-1">Submit a new procurement request</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., 10 Dell Laptops for Engineering Team" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT Equipment</SelectItem>
                        <SelectItem value="furniture">Office Furniture</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="infrastructure">IT Infrastructure</SelectItem>
                        <SelectItem value="supplies">Office Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={priority} onValueChange={setPriority} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="10" 
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={department} onValueChange={setDepartment} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description & Specifications *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the items needed, specifications, and any special requirements..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Business Justification *</Label>
                  <Textarea
                    id="justification"
                    placeholder="Explain why this purchase is necessary and how it will benefit the organization..."
                    rows={3}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget & Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Estimated Cost (₹) *</Label>
                    <Input 
                      id="estimatedCost" 
                      type="number" 
                      placeholder="750000" 
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetCode">Budget Code</Label>
                    <Input 
                      id="budgetCode" 
                      placeholder="DEPT-2024-IT-001" 
                      value={budgetCode}
                      onChange={(e) => setBudgetCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferredVendor">Preferred Vendor</Label>
                    <Input 
                      id="preferredVendor" 
                      placeholder="Dell India" 
                      value={preferredVendor}
                      onChange={(e) => setPreferredVendor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternateVendor">Alternate Vendor</Label>
                    <Input 
                      id="alternateVendor" 
                      placeholder="HP India" 
                      value={alternateVendor}
                      onChange={(e) => setAlternateVendor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="requiredBy">Required By Date *</Label>
                    <Input 
                      id="requiredBy" 
                      type="date" 
                      value={requiredBy}
                      onChange={(e) => setRequiredBy(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestedBy">Requested By *</Label>
                    <Select value={requestedBy} onValueChange={setRequestedBy} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select requester" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee} value={employee.toLowerCase()}>
                            {employee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="managerApprover">Manager Approval Required</Label>
                  <Select value={managerApprover} onValueChange={setManagerApprover}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.slice(0, 5).map((employee) => (
                        <SelectItem key={employee} value={employee.toLowerCase()}>
                          {employee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional information or special instructions..."
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quotation/Proposal</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center">
                          Upload vendor quotations
                        </p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" multiple />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Documents</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center">
                          Upload supporting docs
                        </p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" multiple />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">Draft</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Approval Workflow</span>
                  <span className="font-medium">Manager → Finance</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Estimated Timeline</span>
                  <span className="font-medium">2-3 weeks</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button type="submit" className="w-full gradient-primary" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/procurement")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
