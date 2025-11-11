import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

const disposalRequests = [
  {
    id: "DSP-001",
    assetId: "AST-045",
    assetName: "HP ProBook 450",
    reason: "End of life",
    requestedBy: "Meera Iyer",
    requestDate: "2024-01-08",
    status: "Pending Approval",
    estimatedValue: "₹8,000",
    salvageValue: "₹5,000",
    disposalMethod: "Auction",
  },
  {
    id: "DSP-002",
    assetId: "AST-078",
    assetName: "Office Chair",
    reason: "Damaged",
    requestedBy: "Admin Team",
    requestDate: "2024-01-05",
    status: "Approved",
    estimatedValue: "₹3,500",
    salvageValue: "₹500",
    disposalMethod: "Scrap",
  },
  {
    id: "DSP-003",
    assetId: "AST-023",
    assetName: "Maruti Swift",
    reason: "High maintenance cost",
    requestedBy: "Vikram Singh",
    requestDate: "2023-12-28",
    status: "Completed",
    estimatedValue: "₹2,80,000",
    salvageValue: "₹2,65,000",
    disposalMethod: "Sale",
  },
];

export default function Disposal() {
  const navigate = useNavigate();
  const [disposals, setDisposals] = useState([]);
  const [stats, setStats] = useState([
    {
      title: "Total Disposals",
      value: "0",
      icon: Trash2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: "0",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Completed",
      value: "0",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Rejected",
      value: "0",
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDisposalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch disposal requests
      const [disposalsResponse, statsResponse] = await Promise.all([
        api.get("/disposals"),
        api.get("/dashboard/stats")
      ]);

      setDisposals(disposalsResponse.data);

      // Update stats from dashboard stats
      const { totalDisposals, disposalsByStatus } = statsResponse.data;
      const statusCounts = disposalsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {});

      setStats([
        {
          title: "Total Disposals",
          value: totalDisposals.toString(),
          icon: Trash2,
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
        {
          title: "Pending",
          value: (statusCounts.REQUESTED || 0).toString(),
          icon: Clock,
          color: "text-warning",
          bgColor: "bg-warning/10",
        },
        {
          title: "Completed",
          value: (statusCounts.DISPOSED || 0).toString(),
          icon: CheckCircle,
          color: "text-success",
          bgColor: "bg-success/10",
        },
        {
          title: "Rejected",
          value: (statusCounts.REJECTED || 0).toString(),
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch disposal data:", error);
      setError("Failed to load disposal data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposalData();
  }, []);

  const handleApproveDisposal = async (id) => {
    try {
      await api.patch(`/disposals/${id}`, { status: "APPROVED" });
      toast.success("Disposal request approved successfully!");
      fetchDisposalData(); // Refresh data
    } catch (error) {
      console.error("Failed to approve disposal:", error);
      toast.error("Failed to approve disposal request");
    }
  };

  const handleRejectDisposal = async (id) => {
    try {
      await api.patch(`/disposals/${id}`, { status: "REJECTED" });
      toast.success("Disposal request rejected!");
      fetchDisposalData(); // Refresh data
    } catch (error) {
      console.error("Failed to reject disposal:", error);
      toast.error("Failed to reject disposal request");
    }
  };

  const getMethodDescription = (method: string) => {
    const descriptions = {
      "Sale": "Public auction or private sale",
      "Scrap": "Sold as scrap material",
      "Donation": "Donated to charitable organizations",
      "Trade-in": "Exchanged with vendor",
      "Other": "Other disposal methods"
    };
    return descriptions[method] || "Other disposal methods";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-warning/10 text-warning border-warning/20";
      case "APPROVED":
        return "bg-primary/10 text-primary border-primary/20";
      case "REJECTED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "DISPOSED":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Disposal & Retirement</h1>
          <p className="text-muted-foreground mt-1">
            Manage asset disposal requests and retirement workflow
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => navigate("/disposal/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Disposal Request
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
          <CardTitle>Disposal Requests</CardTitle>
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
                    <TableHead>Asset</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Salvage Value</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <div className="mt-2 text-muted-foreground">Loading disposal requests...</div>
                      </TableCell>
                    </TableRow>
                  ) : disposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No disposal requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    disposals.map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.asset?.name || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">
                              {request.asset?.id || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.reason || "—"}</TableCell>
                        <TableCell>{request.requestedBy || "N/A"}</TableCell>
                        <TableCell>
                          {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {request.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.estimatedValue ? `₹${request.estimatedValue.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className="font-medium text-success">
                          {request.salvageValue ? `₹${request.salvageValue.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.method || "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/disposal/${request.id}`)}
                            >
                              View
                            </Button>
                            {request.status === "REQUESTED" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveDisposal(request.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectDisposal(request.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
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
            <CardTitle>Disposal Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, title: "Request Initiated", desc: "User submits disposal request" },
                { step: 2, title: "Manager Review", desc: "Department head reviews request" },
                { step: 3, title: "Asset Inspection", desc: "Physical inspection and valuation" },
                { step: 4, title: "Finance Approval", desc: "CFO approves disposal" },
                { step: 5, title: "Disposal Execution", desc: "Asset disposed via chosen method" },
                { step: 6, title: "Record Updated", desc: "System records updated" },
              ].map((workflow, index) => (
                <div key={workflow.step} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {workflow.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{workflow.title}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.desc}</p>
                  </div>
                  {index < 5 && (
                    <div className="absolute left-4 mt-8 h-8 w-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disposal Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2 text-muted-foreground">Loading disposal methods...</div>
                </div>
              ) : (
                (() => {
                  // Calculate disposal methods from actual data
                  const methodStats = disposals.reduce((acc, disposal) => {
                    const method = disposal.method || "Other";
                    if (!acc[method]) {
                      acc[method] = { count: 0, revenue: 0 };
                    }
                    acc[method].count += 1;
                    acc[method].revenue += disposal.salvageValue || 0;
                    return acc;
                  }, {} as Record<string, { count: number; revenue: number }>);

                  const methods = Object.entries(methodStats).map(([method, stats]) => ({
                    method,
                    count: (stats as { count: number; revenue: number }).count,
                    revenue: `₹${(stats as { count: number; revenue: number }).revenue.toLocaleString()}`,
                    desc: getMethodDescription(method),
                  }));

                  return methods.length > 0 ? methods.map((method) => (
                    <div key={method.method} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{method.method}</h4>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                        <Badge variant="secondary">{method.count} items</Badge>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Total Revenue: </span>
                        <span className="font-semibold text-success">{method.revenue}</span>
                      </p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No disposal methods data available
                    </div>
                  );
                })()
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
