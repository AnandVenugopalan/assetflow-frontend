import { useEffect, useState } from "react";
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

type AllocationType = "permanent" | "temporary";

export default function NewAllocation() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationType, setAllocationType] = useState<AllocationType>("permanent");

  // ------- API data --------
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // ------- Form state -------
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assignToUserId, setAssignToUserId] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");

  // Load assets + users from backend
  useEffect(() => {
    (async () => {
      try {
        const [assetsRes, usersRes] = await Promise.all([
          api.get("/assets"),
          api.get("/users"),
        ]);

        // Only assets that can be allocated
        const allocatable = (assetsRes.data || []).filter(
          (a: any) => ["COMMISSIONED", "IN_OPERATION", "AVAILABLE"].includes(a.status)
        );

        setAssetsList(allocatable);
        setUsersList(usersRes.data || []);
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Failed to load assets/users");
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssetId || !assignToUserId || !department || !location || !purpose) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (allocationType === "temporary" && (!startDate || !expectedReturn)) {
      toast.error("Start date and expected return are required for temporary allocation.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects IDs, not names
      const payload: any = {
        assetId: selectedAssetId,
        assignedToId: assignToUserId, // <- IMPORTANT
        allocationType: allocationType === "permanent" ? "PERMANENT" : "TEMPORARY",
        department,
        location,
        purpose,
        notes: notes || undefined,
        status: "ACTIVE",
      };

      if (allocationType === "temporary") {
        payload.startDate = new Date(startDate).toISOString();
        payload.expectedReturnDate = new Date(expectedReturn).toISOString();
      }

      await api.post("/allocations", payload);

      toast.success("Asset allocated successfully!");
      navigate("/allocation");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error allocating asset");
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
          <h1 className="text-3xl font-bold">New Asset Allocation</h1>
          <p className="text-muted-foreground mt-1">Assign an asset to a user/department</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
          {/* Asset */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Asset *</Label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose asset to allocate" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetsList.length === 0 && (
                      <SelectItem value="__none" disabled>
                        No eligible assets
                      </SelectItem>
                    )}
                    {assetsList.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} {a.serialNumber ? `(${a.serialNumber})` : ""} • {a.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Allocation type */}
          <Card>
            <CardHeader>
              <CardTitle>Allocation Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duration *</Label>
                <Select
                  value={allocationType}
                  onValueChange={(v) => setAllocationType(v as AllocationType)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {allocationType === "temporary" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Return Date *</Label>
                    <Input
                      type="date"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle>Assignee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assign To (User) *</Label>
                <Select value={assignToUserId} onValueChange={setAssignToUserId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersList.length === 0 && (
                      <SelectItem value="__none" disabled>
                        No users found
                      </SelectItem>
                    )}
                    {usersList.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} • {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Input
                    placeholder="e.g. Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    placeholder="e.g. Kochi Office"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Textarea
                  placeholder="Describe the purpose or project…"
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special instructions…"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Allocating..." : "Allocate Asset"}
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
