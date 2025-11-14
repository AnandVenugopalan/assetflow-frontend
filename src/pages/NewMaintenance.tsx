import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [scheduledDate, setScheduledDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMyAssets = async () => {
      if (user) {
        try {
          const response = await api.get(`/assets?assignedTo=${user.id}`);
          setMyAssets(response.data);
        } catch (error) {
          console.error("Failed to fetch assets:", error);
          toast.error("Failed to load your assets");
        }
      }
    };
    fetchMyAssets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetId || !type || !scheduledDate) {
      toast.error("Required fields missing");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        assetId,
        type,
        scheduledDate,
        vendor: vendor || undefined,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
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
              <Select value={assetId} onValueChange={setAssetId} disabled={!!location.state?.assetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Asset" />
                </SelectTrigger>
                <SelectContent>
                  {myAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <Input
                placeholder="Preventive / Breakdown / Scheduled"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
              <Input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
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
