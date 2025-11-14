import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function TransferAsset() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [transferType, setTransferType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newEmployee, setNewEmployee] = useState("");
  const [reason, setReason] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [priority, setPriority] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [condition, setCondition] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (user.role === "USER") {
        response = await api.get("/assets");
      } else {
        response = await api.get("/assets");
      }
      setAssets(response.data);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setError("Failed to load assets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAssetChange = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    setSelectedAsset(asset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const transferData = {
        assetId: selectedAsset?.id,
        fromLocation: selectedAsset?.location || "Current Location",
        toLocation: newLocation,
        reason,
        scheduledDate: transferDate,
        priority,
        condition,
        notes: handoverNotes + (conditionNotes ? `\n\nCondition Notes: ${conditionNotes}` : ""),
        status: "PENDING"
      };

      await api.post("/transfers", transferData);
      toast.success("Transfer request submitted successfully!");
      navigate("/allocation");
    } catch (error) {
      console.error("Failed to submit transfer request:", error);
      toast.error("Failed to submit transfer request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/allocation")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Transfer Asset</h1>
          <p className="text-muted-foreground mt-1">Transfer asset to a new location or employee</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Select Asset to Transfer *</Label>
                {loading ? (
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading assets...</span>
                  </div>
                ) : error ? (
                  <div className="p-2 border rounded text-destructive text-sm">
                    {error}
                  </div>
                ) : (
                  <Select onValueChange={handleAssetChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.id}) - Currently at {asset.location || "Unknown"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedAsset && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <p className="text-sm font-medium">Current Asset Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span> {selectedAsset.category || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Serial No:</span> {selectedAsset.serialNumber || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Location:</span> {selectedAsset.location || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span> {selectedAsset.status || "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Transfer Type *</Label>
                <Select value={transferType} onValueChange={setTransferType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transfer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location Transfer</SelectItem>
                    <SelectItem value="employee">Employee Transfer</SelectItem>
                    <SelectItem value="both">Location & Employee Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex-1 text-center">
                    <p className="text-sm text-muted-foreground mb-1">From</p>
                    <p className="font-medium">{selectedAsset?.location || "Current Location"}</p>
                    <p className="text-sm">Current Assignment</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-primary" />
                  <div className="flex-1 text-center">
                    <p className="text-sm text-muted-foreground mb-1">To</p>
                    <p className="font-medium text-primary">{newLocation || "New Location/Person"}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newLocation">New Location *</Label>
                  <Input
                    id="newLocation"
                    placeholder="Enter new location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmployee">New Assignee (Optional)</Label>
                  <Input
                    id="newEmployee"
                    placeholder="Enter new assignee"
                    value={newEmployee}
                    onChange={(e) => setNewEmployee(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain the reason for this transfer..."
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transfer Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transferDate">Proposed Transfer Date *</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select value={priority} onValueChange={setPriority} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handoverNotes">Handover Notes</Label>
                <Textarea
                  id="handoverNotes"
                  placeholder="Any special instructions for the handover process..."
                  rows={3}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Condition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Condition *</Label>
                <Select value={condition} onValueChange={setCondition} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs-repair">Needs Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditionNotes">Condition Notes</Label>
                <Textarea
                  id="conditionNotes"
                  placeholder="Document any scratches, damages, or issues with the asset..."
                  rows={3}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded" required />
                  <span className="text-sm">
                    I confirm that the asset is in working condition and ready for transfer.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded" required />
                  <span className="text-sm">
                    All accessories and documents related to this asset are included in the transfer.
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
            <p className="text-sm">
              <strong>Note:</strong> This transfer request requires approval from both the current and new
              location managers. You will receive a notification once approved.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="gradient-primary" disabled={isSubmitting || !selectedAsset}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/allocation")}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
