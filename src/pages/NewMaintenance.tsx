import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Wrench, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function NewMaintenance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [myAssets, setMyAssets] = useState([]);
  const [assetId, setAssetId] = useState(location.state?.assetId || "");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    const fetchMyAssets = async () => {
      if (user) {
        try {
          setLoadingAssets(true);
          let response;
          if (user.role === "USER") {
            response = await api.get("/assets");
          } else {
            response = await api.get("/assets", { params: { assignedTo: user.id } });
          }
          setMyAssets(response.data);
        } catch (error) {
          console.error("Failed to fetch assets:", error);
          toast.error("Failed to load your assets");
        } finally {
          setLoadingAssets(false);
        }
      }
    };
    fetchMyAssets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetId || !type || !priority || !scheduledDate) {
      toast.error("Required fields missing");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        assetId,
        type: type.toUpperCase(),
        priority: priority.toUpperCase(),
        scheduledDate,
        vendor: vendor || undefined,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        notes: notes || undefined,
      };

      await api.post("/maintenance", payload);

      toast.success("New maintenance record created!");
      navigate("/maintenance");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/maintenance")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">New Maintenance Request</h1>
        <Badge variant="outline" className="ml-2">
          <Wrench className="h-4 w-4 mr-1 inline" /> Maintenance
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Maintenance Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Select Asset *</label>
              <Select value={assetId} onValueChange={setAssetId} disabled={!!location.state?.assetId || myAssets.length === 0 || loadingAssets}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingAssets ? "Loading assets..." :
                    myAssets.length === 0 ? "No allocated assets available" :
                    "Select Asset"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {myAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {myAssets.length === 0 && !loadingAssets && (
                <p className="text-sm text-muted-foreground mt-1">No assets allocated to you</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                  <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority *</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <Input
                placeholder="Enter vendor name"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estimated Cost</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter estimated cost"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                placeholder="Additional notes or description"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/maintenance")}
              >
                Cancel
              </Button>

              <Button type="submit" className="gradient-primary" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
