import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import api from "../lib/api";
import { toast } from "sonner";

const locations = ["HO", "Warehouse", "Branch"];

export default function Commissioning() {
  const [asset, setAsset] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [availableAssets, setAvailableAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get("/assets");

        // ✅ pick all assets eligible for commissioning
        const filtered = res.data.filter(
          (a: any) =>
            a.status === "AVAILABLE" ||
            a.status === "PROCUREMENT" ||
            a.status === "READY_FOR_USE"
        );

        setAvailableAssets(filtered);
      } catch (err) {
        toast.error("Failed to load assets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets(); // ✅ RUN ONLY ONCE
  }, []); // ✅ IMPORTANT — to stop infinite API calls

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset || !location || !date) {
      toast.error("All fields are required");
      return;
    }

    try {
      await api.post("/lifecycle", {
        assetId: asset,
        stage: "COMMISSIONED",
        notes: notes || "Commissioned",
        date: date,
        location: location,
      });

      await api.patch(`/assets/${asset}`, {
        status: "IN_OPERATION",
        location: location,
      });

      toast.success("Asset commissioned successfully!");

      setAsset("");
      setDate("");
      setLocation("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error commissioning asset");
    }
  };

  if (isLoading) return <p className="text-center py-4">Loading assets...</p>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Commission Asset</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* ✅ Asset dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">Select Asset</label>
              <select
                className="w-full rounded border px-2 py-2 text-sm"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                required
              >
                <option value="" disabled>Select asset...</option>

                {availableAssets.length === 0 && (
                  <option disabled>No available assets</option>
                )}

                {availableAssets.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.serialNumber ? `(${a.serialNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Commissioning date */}
            <div>
              <label className="block text-sm font-medium mb-1">Commissioning Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* ✅ Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Location Assigned</label>
              <select
                className="w-full rounded border px-2 py-2 text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="" disabled>Select location...</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="gradient-primary">
                Commission Asset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
