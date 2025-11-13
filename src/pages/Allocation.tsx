import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, ArrowRightLeft, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";

const allocations = [
  {
    id: "ALLOC-001",
    asset: "Dell Latitude 5520",
    assetId: "AST-001",
    assignedTo: "Priya Sharma",
    assignedBy: "Rajesh Agarwal",
    department: "Engineering",
    assignDate: "2023-01-15",
    expectedReturn: "—",
    status: "Active",
  },
  {
    id: "ALLOC-002",
    asset: "MacBook Pro 16",
    assetId: "AST-005",
    assignedTo: "Amit Patel",
    assignedBy: "Rajesh Agarwal",
    department: "Design",
    assignDate: "2023-03-12",
    expectedReturn: "—",
    status: "Active",
  },
  {
    id: "ALLOC-003",
    asset: "Canon EOS R5",
    assetId: "AST-012",
    assignedTo: "Photography Team",
    assignedBy: "Meera Iyer",
    department: "Marketing",
    assignDate: "2024-01-08",
    expectedReturn: "2024-01-15",
    status: "Temporary",
  },
];

export default function Allocation() {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [transferLog, setTransferLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch allocations and transfer log from API
  const fetchAllocationsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch allocations
      const allocationsResponse = await api.get("/allocations");
      setAllocations(allocationsResponse.data);

      // Fetch transfer log
      const transferResponse = await api.get("/allocations/transfer-log/_recent");
      setTransferLog(transferResponse.data);

    } catch (err) {
      console.error("Error fetching allocations data:", err);
      setError("Failed to load allocations data");
      toast.error("Failed to load allocations data");
    } finally {
      setLoading(false);
    }
  };

  // Check-in asset
  const checkInAsset = async (allocationId: string) => {
    try {
      await api.post(`/allocations/${allocationId}/check-in`);
      toast.success("Asset checked in successfully!");
      fetchAllocationsData(); // Refresh data
    } catch (err) {
      console.error("Error checking in asset:", err);
      toast.error("Failed to check in asset");
    }
  };

  // Check-out asset
  const checkOutAsset = async (allocationId: string) => {
    try {
      await api.post(`/allocations/${allocationId}/check-out`);
      toast.success("Asset checked out successfully!");
      fetchAllocationsData(); // Refresh data
    } catch (err) {
      console.error("Error checking out asset:", err);
      toast.error("Failed to check out asset");
    }
  };

  useEffect(() => {
    fetchAllocationsData();
  }, []);

  // Calculate stats from API data
  const stats = [
    {
      title: "Total Allocations",
      value: loading ? "..." : allocations.length.toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active",
      value: loading ? "..." : allocations.filter(a => a.status?.toLowerCase() === "active").length.toString(),
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Temporary",
      value: loading ? "..." : allocations.filter(a => a.status?.toLowerCase() === "temporary").length.toString(),
      icon: ArrowRightLeft,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "temporary":
        return "bg-warning/10 text-warning border-warning/20";
      case "returned":
        return "bg-muted text-muted-foreground border-border";
      case "checked_out":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "checked_in":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Allocation & Movement</h1>
          <p className="text-muted-foreground mt-1">
            Manage asset assignments and track asset movement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/allocation/transfer")}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer Asset
          </Button>
          <Button className="gradient-primary" onClick={() => navigate("/allocation/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Allocation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle>Asset Allocations</CardTitle>
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
                    <TableHead>Allocation ID</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assign Date</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <div className="mt-2 text-muted-foreground">Loading allocations...</div>
                      </TableCell>
                    </TableRow>
                  ) : allocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No allocations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allocations.map((allocation) => (
                      <TableRow key={allocation.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{allocation.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{allocation.asset?.name || allocation.assetName || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">
                              {allocation.asset?.id || allocation.assetId || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{allocation.assignedTo?.name || "N/A"}</TableCell>
                        <TableCell>{allocation.assignedBy?.name || "N/A"}</TableCell>
                        <TableCell>{allocation.department || "N/A"}</TableCell>
                        <TableCell>
                          {allocation.assignDate ? new Date(allocation.assignDate).toLocaleDateString() :
                           allocation.createdAt ? new Date(allocation.createdAt).toLocaleDateString() :
                           "N/A"}
                        </TableCell>
                        <TableCell>
                          {allocation.expectedReturn ? new Date(allocation.expectedReturn).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(allocation.status)}
                          >
                            {allocation.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/allocation/${allocation.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate("/allocation/transfer")}
                            >
                              Transfer
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
            <CardTitle>Check-in / Check-out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage temporary asset assignments with check-in and check-out functionality.
              </p>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2 text-muted-foreground">Loading check-in/check-out data...</div>
                </div>
              ) : allocations.filter(a => a.status === "checked_out" || a.status === "temporary").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assets currently checked out
                </div>
              ) : (
                allocations
                  .filter(a => a.status === "checked_out" || a.status === "temporary")
                  .slice(0, 3)
                  .map((allocation) => (
                    <div key={allocation.id} className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{allocation.asset?.name || allocation.assetName || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {allocation.asset?.id || allocation.assetId || "N/A"}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          {allocation.status?.replace("_", " ").toUpperCase() || "Checked Out"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={async () => {
                            try {
                              await api.post(`/allocations/${allocation.id}/check-in`);
                              toast.success("Asset checked in successfully!");
                              fetchAllocationsData();
                            } catch (error) {
                              toast.error("Failed to check in asset");
                            }
                          }}
                        >
                          Check In
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => navigate(`/allocation/${allocation.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2 text-muted-foreground">Loading transfer log...</div>
                </div>
              ) : transferLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent transfers
                </div>
              ) : (
                transferLog.map((transfer, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{transfer.assetName || "N/A"}</p>
                      <Badge
                        variant="outline"
                        className={
                          transfer.status === "completed" || transfer.status === "Completed"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {transfer.status || "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transfer.fromUser?.name || transfer.from || "N/A"}</span>
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>{transfer.toUser?.name || transfer.to || "N/A"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {transfer.timestamp ? new Date(transfer.timestamp).toLocaleDateString() : "N/A"}
                    </p>
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
