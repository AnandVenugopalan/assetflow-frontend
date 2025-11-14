import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ShoppingCart, Clock, CheckCircle, TrendingUp, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Procurement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [workflowStats, setWorkflowStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch procurement data
  const fetchProcurementData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch procurement requests
      const requestsResponse = await api.get("/procurement/requests");
      setProcurementRequests(requestsResponse.data);

      // Fetch vendors
      const vendorsResponse = await api.get("/procurement/vendors");
      setVendors(vendorsResponse.data);

      // Fetch workflow stats
      const statsResponse = await api.get("/procurement/workflow-stats");
      setWorkflowStats(statsResponse.data);

    } catch (err) {
      console.error("Error fetching procurement data:", err);
      setError("Failed to load procurement data");
      toast.error("Failed to load procurement data");
    } finally {
      setLoading(false);
    }
  };

  // Approve procurement request
  const approveRequest = async (requestId: string) => {
    try {
      await api.patch(`/procurement/requests/${requestId}`, {
        status: "APPROVED"
      });
      toast.success("Purchase request approved successfully!");
      fetchProcurementData(); // Refresh data
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error("Failed to approve request");
    }
  };

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/procurement/requests/${id}`, {
        status: "APPROVED"
      });
      toast.success("Purchase request approved successfully!");
      fetchProcurementData();
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error("Failed to approve request");
    }
  };

  // Handle reject
  const handleReject = async (id: string) => {
    try {
      await api.patch(`/procurement/requests/${id}`, {
        status: "REJECTED"
      });
      toast.success("Purchase request rejected successfully!");
      fetchProcurementData();
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error("Failed to reject request");
    }
  };

  useEffect(() => {
    fetchProcurementData();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "pending_approval":
      case "pending approval":
        return "bg-warning/10 text-warning border-warning/20";
      case "in_procurement":
      case "in procurement":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "Low":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const stats = [
    {
      title: "Total Requests",
      value: loading ? "..." : (workflowStats?.totalRequests?.toString() || "0"),
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Approval",
      value: loading ? "..." : (workflowStats?.pendingApproval?.toString() || "0"),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Approved",
      value: loading ? "..." : (workflowStats?.approved?.toString() || "0"),
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Budget",
      value: loading ? "..." : (workflowStats?.totalBudget ? `₹${workflowStats.totalBudget.toLocaleString()}` : "₹0"),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Procurement & Acquisition</h1>
          <p className="text-muted-foreground mt-1">
            Manage purchase requests and vendor information
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => navigate("/procurement/add")}>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Request
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          )}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <div className="mt-2 text-muted-foreground">Loading procurement requests...</div>
                      </TableCell>
                    </TableRow>
                  ) : procurementRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No procurement requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    procurementRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell>{request.requestedBy || "N/A"}</TableCell>
                        <TableCell>{request.department || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(request.status)}
                          >
                            {request.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(request.priority)}
                          >
                            {request.priority || "MEDIUM"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.estimatedCost ? `₹${request.estimatedCost.toLocaleString()}` : "N/A"}
                        </TableCell>
                        <TableCell>{request.vendor || "Not assigned"}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {user?.role === "MANAGER" && (
                              <>
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleReject(request.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/procurement/requests/${request.id}`)}
                            >
                              View Request
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2 text-muted-foreground">Loading vendors...</div>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vendors found
                </div>
              ) : (
                vendors.map((vendor) => (
                  <div
                    key={vendor.id || vendor.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.activeContracts || 0} active contracts
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast.success(`Opening ${vendor.name} details...`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2 text-muted-foreground">Loading workflow stats...</div>
                </div>
              ) : workflowStats?.stages ? (
                workflowStats.stages.map((stage) => (
                  <div
                    key={stage.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${stage.color || 'bg-primary'}`} />
                      <p className="font-medium">{stage.name}</p>
                    </div>
                    <Badge variant="secondary">{stage.count}</Badge>
                  </div>
                ))
              ) : (
                [
                  { stage: "Request Initiated", count: 15, color: "bg-warning" },
                  { stage: "Manager Approval", count: 8, color: "bg-primary" },
                  { stage: "Finance Approval", count: 5, color: "bg-accent" },
                  { stage: "Vendor Selection", count: 12, color: "bg-success" },
                  { stage: "GRN Pending", count: 6, color: "bg-destructive" },
                ].map((workflow) => (
                  <div
                    key={workflow.stage}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${workflow.color}`} />
                      <p className="font-medium">{workflow.stage}</p>
                    </div>
                    <Badge variant="secondary">{workflow.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
