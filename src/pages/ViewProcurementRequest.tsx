import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, Loader2, FileUp, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProcurementApi } from "@/lib/api/procurement";
import { useAuth } from "@/contexts/AuthContext";
import { ProcurementReviewSchema, FinanceApprovalSchema } from "@/lib/validations/procurement";
import { VendorsApi } from "@/lib/api/vendors";
import { PurchaseOrdersApi } from "@/lib/api/purchaseOrders";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ViewProcurementRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [request, setRequest] = useState<any>(null);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Step 2 Form (Purchase Head)
  const [vendorId, setVendorId] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [procurementNotes, setProcurementNotes] = useState("");
  
  // Step 3 Form (Finance)
  const [approvedAmount, setApprovedAmount] = useState("");
  const [financeRemarks, setFinanceRemarks] = useState("");

  const fetchRequest = async () => {
    try {
      const data = await ProcurementApi.getOne(id!);
      setRequest(data);
      
      const vData = await VendorsApi.getAll();
      setVendorsList(vData);

      if (data.vendorId) setVendorId(data.vendorId);
      if (data.estimatedCost) setEstimatedCost(data.estimatedCost.toString());
      if (data.expectedDeliveryDate) setExpectedDeliveryDate(data.expectedDeliveryDate.split('T')[0]);
      if (data.procurementNotes) setProcurementNotes(data.procurementNotes);
      if (data.approvedAmount) setApprovedAmount(data.approvedAmount.toString());
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to load request" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const handlePurchaseReview = async (action: ProcurementReviewSchema['action']) => {
    if (action === 'FORWARD_TO_FINANCE' && (!vendorId || !estimatedCost || !expectedDeliveryDate)) {
      toast({ variant: "destructive", title: "Fill required fields before forwarding" });
      return;
    }
    
    setActionLoading(true);
    try {
      await ProcurementApi.review(id!, {
        action,
        vendorId,
        estimatedCost: Number(estimatedCost),
        expectedDeliveryDate,
        procurementNotes
      });
      toast({ title: "Review submitted successfully" });
      fetchRequest();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error submitting review" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinanceReview = async (action: FinanceApprovalSchema['action']) => {
    if (action === 'APPROVE' && !approvedAmount) {
      toast({ variant: "destructive", title: "Approved amount is required" });
      return;
    }

    setActionLoading(true);
    try {
      await ProcurementApi.financeApproval(id!, {
        action,
        approvedAmount: Number(approvedAmount),
        financeRemarks
      });
      toast({ title: "Decision recorded" });
      fetchRequest();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setActionLoading(false);
    }
  };

  const [paymentTerms, setPaymentTerms] = useState("");
  const handleGeneratePO = async () => {
    if (!request?.vendorId) {
      toast({ variant: "destructive", title: "Vendor missing" });
      return;
    }
    setActionLoading(true);
    try {
      await PurchaseOrdersApi.create({
        vendorId: request.vendorId,
        procurementRequestId: id!,
        approvedAmount: request.approvedAmount || undefined,
        paymentTerms,
      });
      toast({ title: "Purchase Order generated successfully" });
      fetchRequest();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to generate PO" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!request) return <div className="p-8">Request not found</div>;

  const isPurchaseHead = user?.role === 'PURCHASE_HEAD' || user?.role === 'ADMIN';
  const isFinance = user?.role === 'FINANCE_MANAGER' || user?.role === 'ADMIN';

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/procurement")}><ArrowLeft /></Button>
            <div>
              <h2 className="text-3xl font-bold">{request.requestTitle || request.itemName}</h2>
              <p className="text-muted-foreground">ID: {request.id}</p>
            </div>
          </div>
          <Badge className="text-sm px-4 py-1">{request.status.replace(/_/g, ' ')}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Item Name</Label><p className="form-p">{request.itemName}</p></div>
              <div><Label>Quantity</Label><p className="form-p">{request.quantity}</p></div>
              <div><Label>Category</Label><p className="form-p">{request.category || 'N/A'}</p></div>
              <div><Label>Asset Type</Label><p className="form-p">{request.assetType || 'N/A'}</p></div>
              <div><Label>Department</Label><p className="form-p">{request.department || 'N/A'}</p></div>
              <div><Label>Priority</Label><p className="form-p">{request.priority || 'N/A'}</p></div>
              <div className="col-span-2"><Label>Business Justification</Label><p className="form-p mt-1">{request.justification || 'N/A'}</p></div>
              {request.technicalSpecs && <div className="col-span-2"><Label>Technical Specs</Label><p className="form-p mt-1">{request.technicalSpecs}</p></div>}
            </CardContent>
          </Card>

          {/* Workflow Status Timeline representation could go here */}

          {/* Step 2: Procurement Manager View */}
          {isPurchaseHead && (request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW' || request.status === 'CLARIFICATION_REQUESTED') && (
            <Card className="md:col-span-3 border-blue-200">
              <CardHeader className="bg-blue-50/50">
                <CardTitle>Procurement Review</CardTitle>
                <CardDescription>Assign vendor and estimated costs before pushing to finance.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Assign Vendor</Label>
                    <Select value={vendorId} onValueChange={setVendorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorsList.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estimated Cost</Label>
                    <Input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
                  </div>
                  <div>
                    <Label>Expected Delivery Date</Label>
                    <Input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <Label>Procurement Notes / Clarification Request</Label>
                    <Textarea value={procurementNotes} onChange={(e) => setProcurementNotes(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t">
                  <Button onClick={() => handlePurchaseReview('FORWARD_TO_FINANCE')} disabled={actionLoading} className="bg-blue-600">
                    {actionLoading ? <Loader2 className="animate-spin" /> : "Forward to Finance"}
                  </Button>
                  <Button variant="outline" onClick={() => handlePurchaseReview('REQUEST_CLARIFICATION')} disabled={actionLoading}>
                    Request Clarification
                  </Button>
                  <Button variant="destructive" onClick={() => handlePurchaseReview('REJECT')} disabled={actionLoading}>
                    Reject Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Finance Manager View */}
          {isFinance && request.status === 'PENDING_FINANCE_APPROVAL' && (
            <Card className="md:col-span-3 border-green-200">
              <CardHeader className="bg-green-50/50">
                <CardTitle>Finance Approval</CardTitle>
                <CardDescription>Review costs and approve procurement budget.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                  <div><Label>Requested Cost</Label><p className="text-xl font-bold">₹{request.estimatedCost}</p></div>
                  <div><Label>Vendor ID</Label><p>{request.vendorId}</p></div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Approved Amount</Label>
                    <Input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label>Finance Remarks</Label>
                    <Textarea value={financeRemarks} onChange={(e) => setFinanceRemarks(e.target.value)} />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => handleFinanceReview('APPROVE')} disabled={actionLoading} className="bg-green-600">
                    {actionLoading ? <Loader2 className="animate-spin" /> : "Approve Budget"}
                  </Button>
                  <Button variant="outline" onClick={() => handleFinanceReview('SEND_BACK')} disabled={actionLoading}>
                    Send Back to Procurement
                  </Button>
                  <Button variant="destructive" onClick={() => handleFinanceReview('REJECT')} disabled={actionLoading}>
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isPurchaseHead && request.status === 'FINANCE_APPROVED' && (
            <Card className="md:col-span-3 border-blue-200">
              <CardHeader className="bg-blue-50/50">
                <CardTitle>Generate Purchase Order</CardTitle>
                <CardDescription>Finance has approved the budget. Generate the PO for the vendor.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                  <div><Label>Approved Budget</Label><p className="text-xl font-bold font-mono text-green-700">₹{request.approvedAmount}</p></div>
                  <div><Label>Vendor ID</Label><p>{request.vendorId}</p></div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Payment Terms</Label>
                    <Textarea 
                      placeholder="e.g. Net 30 days, 50% advance..."
                      value={paymentTerms} 
                      onChange={(e) => setPaymentTerms(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleGeneratePO} disabled={actionLoading} className="bg-blue-600 w-full md:w-auto">
                    {actionLoading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Generate PO
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}