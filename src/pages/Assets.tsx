import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, ArrowUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Assets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase());
      if (typeFilter !== "all") params.append("type", typeFilter.toUpperCase());
      if (searchQuery) params.append("q", searchQuery);

      const response = await api.get(`/assets?${params.toString()}`);
      setAssets(response.data);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("Failed to load assets");
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  // Delete asset
  const deleteAsset = async (assetId: string, assetName: string) => {
    if (!confirm(`Are you sure you want to delete ${assetName}?`)) return;

    try {
      await api.delete(`/assets/${assetId}`);
      toast.success("Asset deleted successfully");
      fetchAssets(); // Refresh the list
    } catch (err) {
      console.error("Error deleting asset:", err);
      toast.error("Failed to delete asset");
    }
  };

  // Load assets on component mount and when filters change
  useEffect(() => {
    fetchAssets();
  }, [statusFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredAssets = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.assignedTo?.name && asset.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "allocated":
        return "bg-success/10 text-success border-success/20";
      case "under_maintenance":
        return "bg-warning/10 text-warning border-warning/20";
      case "retired":
      case "disposed":
        return "bg-muted text-muted-foreground border-border";
      case "procured":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "commissioned":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Register</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all organizational assets
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => navigate("/assets/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Asset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>
              All Assets ({loading ? "..." : filteredAssets.length})
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="procured">Procured</SelectItem>
                  <SelectItem value="commissioned">Commissioned</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                onClick={() => {
                  toast.success("Exporting assets list...");
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
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
                    <TableHead>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Asset ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <div className="mt-2 text-muted-foreground">Loading assets...</div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No assets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{asset.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {asset.serialNumber || asset.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>
                          <div>
                            <div>{asset.assignedTo?.name || "Unassigned"}</div>
                            <div className="text-xs text-muted-foreground">
                              {asset.department || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{asset.location || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(asset.status)}>
                            {asset.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {asset.currentValue ? `₹${asset.currentValue.toLocaleString()}` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => navigate(`/assets/${asset.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => navigate(`/assets/${asset.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteAsset(asset.id, asset.name)}
                            >
                              <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
