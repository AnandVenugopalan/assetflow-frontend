import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function MyAssets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      let response;
      if (user.role === "USER") {
        response = await api.get("/assets");
      } else {
        response = await api.get("/assets", { params: { assignedTo: user.id } });
      }
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching my assets:", error);
      toast.error("Failed to load your assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyAssets();
    }
  }, [user]);

  const handleRequestMaintenance = async (assetId, assetName) => {
    if (!confirm(`Request maintenance for ${assetName}?`)) return;

    try {
      await api.post("/maintenance", {
        assetId,
        maintenanceType: "GENERAL",
        priority: "MEDIUM",
        description: `Maintenance requested by ${user.name}`,
        requestedBy: user.id,
      });
      toast.success("Maintenance request submitted");
      // Optionally refresh assets if status changes
    } catch (error) {
      console.error("Error requesting maintenance:", error);
      toast.error("Failed to request maintenance");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "allocated":
        return "bg-success/10 text-success border-success/20";
      case "maintenance":
        return "bg-warning/10 text-warning border-warning/20";
      case "disposal":
        return "bg-destructive/10 text-destructive border-destructive/20";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assets</h1>
        <p className="text-muted-foreground mt-1">Assets allocated to you</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Allocated Assets ({assets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assets allocated to you
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allocated Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.id}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell>{asset.location || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(asset.status)}>
                          {asset.status?.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.allocatedDate ? new Date(asset.allocatedDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/assets/${asset.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRequestMaintenance(asset.id, asset.name)}
                            disabled={asset.status === "MAINTENANCE"}
                          >
                            <Wrench className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}