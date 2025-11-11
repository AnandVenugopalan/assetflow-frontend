import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { toast } from "sonner";

export default function Operation() {
  const navigate = useNavigate();

  const [inUseAssets, setInUseAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch assets that are currently in operation
  const fetchInUseAssets = async () => {
    try {
      const res = await api.get("/assets");
      const filtered = res.data.filter((asset: any) => asset.status === "IN_OPERATION");
      setInUseAssets(filtered);
    } catch (err: any) {
      toast.error("Failed to load operational assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInUseAssets();
  }, []);

  // ✅ Move asset to maintenance  
  const handleMoveToMaintenance = async (assetId: string) => {
    try {
      // 1️⃣ Lifecycle log
      await api.post("/lifecycle", {
        assetId,
        stage: "MAINTENANCE",
        notes: "Moved to maintenance from operation",
      });

      // 2️⃣ Update asset status
      await api.patch(`/assets/${assetId}`, {
        status: "MAINTENANCE",
      });

      toast.success("Asset moved to maintenance!");

      // 3️⃣ Reload list
      fetchInUseAssets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating asset");
    }
  };

  if (loading) {
    return <p className="text-center py-8">Loading assets...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Assets in Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inUseAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No assets currently in operation
                  </TableCell>
                </TableRow>
              ) : (
                inUseAssets.map((asset: any) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.owner?.name || "Unassigned"}</TableCell>
                    <TableCell>{asset.status}</TableCell>
                    <TableCell>{new Date(asset.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gradient-primary"
                        onClick={() => handleMoveToMaintenance(asset.id)}
                      >
                        Move to Maintenance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
