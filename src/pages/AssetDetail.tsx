import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  QrCode,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  User,
  FileText,
  History,
  Save,
  X,
} from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

export default function AssetDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lifecycleHistory, setLifecycleHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    serialNumber: "",
    location: "",
    status: "",
  });
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch Asset + Lifecycle
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const assetRes = await api.get(`/assets/${id}`);
        setAsset(assetRes.data);

        // Initialize edit form with current values
        setEditForm({
          name: assetRes.data.name || "",
          category: assetRes.data.category || "",
          serialNumber: assetRes.data.serialNumber || "",
          location: assetRes.data.location || "",
          status: assetRes.data.status || "",
        });

        const lcRes = await api.get(`/lifecycle/asset/${id}`);
        setLifecycleHistory(lcRes.data);
      } catch (err: any) {
        toast.error("Unable to load asset details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Delete Asset
  const handleRetire = async () => {
    if (!confirm("Are you sure you want to retire this asset?")) return;

    try {
      await api.delete(`/assets/${id}`);
      toast.success("Asset retired successfully");
      navigate("/assets");
    } catch (err: any) {
      toast.error("Unable to retire asset");
    }
  };

  // ✅ Schedule Maintenance
  const scheduleMaintenance = async () => {
    try {
      await api.post(`/lifecycle`, {
        assetId: id,
        stage: "MAINTENANCE",
        notes: "Scheduled maintenance",
      });

      toast.success("Maintenance event added!");

      // Refresh lifecycle
      const updated = await api.get(`/lifecycle/asset/${id}`);
      setLifecycleHistory(updated.data);
    } catch (err: any) {
      toast.error("Failed to schedule maintenance");
    }
  };

  // ✅ Request Transfer
  const requestTransfer = async () => {
    try {
      await api.post(`/lifecycle`, {
        assetId: id,
        stage: "TRANSFER",
        notes: "Transfer requested",
      });

      toast.success("Transfer request added!");

      const updated = await api.get(`/lifecycle/asset/${id}`);
      setLifecycleHistory(updated.data);
    } catch (err: any) {
      toast.error("Failed to request transfer");
    }
  };

  // ✅ Update Asset
  const handleUpdateAsset = async () => {
    try {
      setUpdating(true);

      const updateData = {
        name: editForm.name.trim() || undefined,
        category: editForm.category.trim() || undefined,
        serialNumber: editForm.serialNumber.trim() || undefined,
        location: editForm.location.trim() || undefined,
        status: editForm.status || undefined,
      };

      const response = await api.patch(`/assets/${id}`, updateData);

      // Update local asset state
      setAsset(response.data);

      // Update edit form with new values
      setEditForm({
        name: response.data.name || "",
        category: response.data.category || "",
        serialNumber: response.data.serialNumber || "",
        location: response.data.location || "",
        status: response.data.status || "",
      });

      setIsEditing(false);
      toast.success("Asset updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update asset");
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Start/Cancel Edit
  const toggleEdit = () => {
    if (isEditing) {
      // Reset form to current asset values
      setEditForm({
        name: asset.name || "",
        category: asset.category || "",
        serialNumber: asset.serialNumber || "",
        location: asset.location || "",
        status: asset.status || "",
      });
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) return <p>Loading...</p>;
  if (!asset) return <p>Asset not found</p>;

  // Filter lifecycle by type (approx)
  const maintenanceHistory = lifecycleHistory.filter(
    (e: any) => e.stage === "MAINTENANCE"
  );

  const transferHistory = lifecycleHistory.filter(
    (e: any) => e.stage === "TRANSFER"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{asset.name}</h1>
              <Badge variant="outline" className="bg-success/10 text-success">
                {asset.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {asset.id} • {asset.serialNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            View QR
          </Button>

          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={toggleEdit}
                disabled={updating}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                className="gradient-primary"
                onClick={handleUpdateAsset}
                disabled={updating}
              >
                <Save className="mr-2 h-4 w-4" />
                {updating ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={toggleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleRetire}
            disabled={isEditing || updating}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Retire
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Asset Name</p>
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter asset name"
                      />
                    ) : (
                      <p className="font-medium">{asset.name || "NA"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    {isEditing ? (
                      <Input
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Enter category"
                      />
                    ) : (
                      <p className="font-medium">{asset.category || "NA"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    {isEditing ? (
                      <Input
                        value={editForm.serialNumber}
                        onChange={(e) => setEditForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                        placeholder="Enter serial number"
                      />
                    ) : (
                      <p className="font-mono text-sm">{asset.serialNumber || "-"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{asset.purchaseDate || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{asset.ownerName || "Unassigned"}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.department || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    {isEditing ? (
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter location"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{asset.location || "-"}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {isEditing ? (
                      <select
                        className="w-full rounded border px-2 py-2 text-sm"
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="PROCUREMENT">Procurement</option>
                        <option value="COMMISSIONED">Commissioned</option>
                        <option value="ALLOCATED">Allocated</option>
                        <option value="IN_OPERATION">In Operation</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="AUDIT">Audit</option>
                        <option value="VALUATION">Valuation</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="DISPOSAL">Disposal</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success">
                        {asset.status}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Cost</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{asset.purchaseCost || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="maintenance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="maintenance" disabled={isEditing}>Maintenance</TabsTrigger>
              <TabsTrigger value="transfers" disabled={isEditing}>Transfers</TabsTrigger>
              <TabsTrigger value="documents" disabled={isEditing}>Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {maintenanceHistory.map((record: any, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="rounded-full bg-primary/10 p-2">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">Maintenance Event</p>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={scheduleMaintenance}
                    disabled={isEditing || updating}
                  >
                    Schedule Maintenance
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transfers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transferHistory.map((record: any, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="rounded-full bg-accent/20 p-2">
                        <MapPin className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">Transfer Logged</p>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={requestTransfer}
                    disabled={isEditing || updating}
                  >
                    Request Transfer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents untouched (mock for now) */}
          </Tabs>
        </div>

        {/* Right Column unchanged */}
        {/* QR Code, quick actions, depreciation */}
      </div>
    </div>
  );
}
