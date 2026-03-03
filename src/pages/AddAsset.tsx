import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Download, CheckCircle, Eye, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AddAsset() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<any>(null);

  // Correct fields for backend schema
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [vendor, setVendor] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !category.trim() || !department.trim()) {
      toast.error("Name, category, and department are required");
      return;
    }

    if (!purchaseDate) {
      toast.error("Purchase date is required");
      return;
    }

    const payload = {
      name,
      category,
      department,
      vendor: vendor || "Unknown",
      purchaseCost: parseFloat(purchaseCost || "0"),
      purchaseDate,
      status: status || "PROCUREMENT",
      description,
    };

    setIsSubmitting(true);
    try {
      const response = await api.post("/assets", payload);
      const newAsset = response.data;
      
      // Store the created asset and show QR dialog
      setCreatedAsset(newAsset);
      setShowQRDialog(true);
      
      toast.success("✅ Asset created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    const canvas = document.getElementById("new-asset-qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `asset-${createdAsset?.id || 'new'}-qr-code.png`;
      link.click();
      toast.success("QR Code downloaded successfully!");
    }
  };

  // View Asset Details
  const viewAssetDetails = () => {
    if (createdAsset?.id) {
      navigate(`/assets/${createdAsset.id}`);
    }
  };

  // Close and go back to assets list
  const closeAndNavigate = () => {
    setShowQRDialog(false);
    navigate("/assets");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Asset</h1>
          <p className="text-muted-foreground mt-1">Create a new asset in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Name & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dell Laptop XPS" />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Machinery">Machinery</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Department & Vendor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Dell / HP / Epson..." />
                </div>
              </div>

              {/* Purchase Cost & Purchase Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Purchase Date *</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROCUREMENT">Procurement</SelectItem>
                    <SelectItem value="COMMISSIONED">Commissioned</SelectItem>
                    <SelectItem value="IN_OPERATION">In Operation</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="DISPOSAL">Disposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe asset condition or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Creating Asset..." : "Create Asset"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/assets")}>Cancel</Button>
          </div>
        </div>
      </form>

      {/* QR Code Success Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Asset Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your asset has been registered. Here's the QR code for quick access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Asset Info */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="font-semibold text-lg">{createdAsset?.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>ID: {createdAsset?.id}</span>
                {createdAsset?.category && (
                  <>
                    <span>•</span>
                    <span>{createdAsset.category}</span>
                  </>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-lg border">
              <QRCodeCanvas
                id="new-asset-qr-code"
                value={createdAsset?.id || ""}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <QrCode className="h-3 w-3" />
                Next Steps:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-blue-800 dark:text-blue-200">
                <li>Download and print this QR code</li>
                <li>Attach it to the physical asset</li>
                <li>Use QR Scanner to access asset details instantly</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={viewAssetDetails}
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={closeAndNavigate}
                  className="gradient-primary"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
