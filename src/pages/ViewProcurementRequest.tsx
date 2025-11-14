import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ViewProcurementRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/procurement/requests/${id}`);
      setRequest(response.data);
    } catch (error) {
      console.error("Error fetching request:", error);
      toast.error("Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await api.patch(`/procurement/requests/${id}/approve`);
      toast.success("Request approved successfully");
      fetchRequest(); // Refresh to show new status
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setRejecting(true);
    try {
      await api.patch(`/procurement/requests/${id}/reject`, { reason: rejectReason });
      toast.success("Request rejected");
      fetchRequest();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setRejecting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/procurement")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Procurement Request Details</h1>
          <p className="text-muted-foreground mt-1">Request ID: {request.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{request.itemName}</CardTitle>
            <Badge variant="outline" className={getStatusColor(request.status)}>
              {request.status?.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <p className="text-sm text-muted-foreground">{request.category || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Quantity</Label>
              <p className="text-sm text-muted-foreground">{request.quantity || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Department</Label>
              <p className="text-sm text-muted-foreground">{request.department || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <p className="text-sm text-muted-foreground">{request.priority || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Estimated Cost</Label>
              <p className="text-sm text-muted-foreground">
                {request.estimatedCost ? `₹${request.estimatedCost.toLocaleString()}` : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Vendor</Label>
              <p className="text-sm text-muted-foreground">{request.vendor || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested By</Label>
              <p className="text-sm text-muted-foreground">{request.requestedBy?.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Requested Date</Label>
              <p className="text-sm text-muted-foreground">
                {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-muted-foreground mt-1">{request.description || "N/A"}</p>
          </div>
          {request.status === "REJECTED" && request.rejectReason && (
            <div>
              <Label className="text-sm font-medium">Rejection Reason</Label>
              <p className="text-sm text-muted-foreground mt-1">{request.rejectReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {user?.role === "MANAGER" && request.status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>Manager Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={approving}
                className="gradient-primary"
              >
                {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {approving ? "Approving..." : "Approve Request"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejecting}
              >
                {rejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                {rejecting ? "Rejecting..." : "Reject Request"}
              </Button>
            </div>
            {rejecting && (
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Rejection Reason</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="Please provide a reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}