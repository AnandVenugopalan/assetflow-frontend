import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Plus, Wrench, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Maintenance() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const isCompletedStatus = (status: string) =>
    String(status ?? "").trim().toUpperCase() === "COMPLETED";

  const isInProgressStatus = (status: string) =>
    String(status ?? "").trim().toUpperCase() === "IN PROGRESS";

  const isScheduledStatus = (status: string) =>
    String(status ?? "").trim().toUpperCase() === "SCHEDULED";

  // ✅ Fetch maintenance records
  const fetchMaintenance = async () => {
    try {
      const res = await api.get("/maintenance");
      setRecords(Array.isArray(res.data.items) ? res.data.items : []);
    } catch (err: any) {
      toast.error("Failed to load maintenance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // ✅ Update maintenance status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      toast.success(newStatus === "Completed" ? "Maintenance record approved" : `Maintenance record updated to ${newStatus}`);
      fetchMaintenance();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update maintenance record");
    }
  };

  const getStatusColor = (status: string) => {
    if (isCompletedStatus(status)) return "bg-success/10 text-success border-success/20";
    if (isInProgressStatus(status)) return "bg-warning/10 text-warning border-warning/20";
    if (isScheduledStatus(status)) return "bg-primary/10 text-primary border-primary/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium": return "bg-warning/10 text-warning border-warning/20";
      case "Low": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  // ✅ Handle filtering
  const filteredRecords = records.filter((rec: any) => {
    if (activeTab === "all") return true;
    return rec.type?.toLowerCase() === activeTab.toLowerCase();
  });

  const stats = [
    {
      title: "Total Maintenance",
      value: records.length.toString(),
      icon: Wrench,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "In Progress",
      value: records.filter((r) => isInProgressStatus(r.status)).length.toString(),
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Completed",
      value: records.filter((r) => isCompletedStatus(r.status)).length.toString(),
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Overdue",
      value: records.filter((r) => {
        if (isCompletedStatus(r.status)) return false;
        const dueDate = r.dueDate || r.scheduledDate;
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
      }).length.toString(),
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  if (loading) {
    return <p className="text-center py-8">Loading maintenance records...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage asset maintenance schedules</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab("scheduled")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>

          <Button variant="outline" onClick={fetchMaintenance}>
            Refresh
          </Button>

          <Button className="gradient-primary" onClick={() => navigate("/maintenance/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Maintenance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="preventive">Preventive</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Est. Cost</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-6">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>

                          <TableCell>
                            <div>
                              <div className="font-medium">{record.asset?.name || record.assetName}</div>
                              <div className="text-xs text-muted-foreground">{record.asset?.id || record.assetId}</div>
                            </div>
                          </TableCell>

                          <TableCell><Badge>{record.type}</Badge></TableCell>

                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={getPriorityColor(record.priority)}>{record.priority}</Badge>
                          </TableCell>

                          <TableCell>
                            {record.reportedBy?.name || record.reportedBy?.email || "-"}
                          </TableCell>

                          <TableCell>{record.scheduledDate || "-"}</TableCell>

                          <TableCell>{record.vendor?.name || record.vendor || "-"}</TableCell>

                          <TableCell>{record.estimatedCost}</TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/maintenance/${record.id}`)}
                              >
                                View
                              </Button>

                              <Button
                                size="sm"
                                disabled={isCompletedStatus(record.status)}
                                onClick={() => handleUpdateStatus(record.id, "Completed")}
                                className={
                                  isCompletedStatus(record.status)
                                    ? "bg-success text-success-foreground hover:bg-success disabled:opacity-100 disabled:text-success-foreground"
                                    : ""
                                }
                              >
                                {isCompletedStatus(record.status) ? "Approved" : "Approve"}
                              </Button>

                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
