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
import { ArrowLeft, Save, Loader2, Download, CheckCircle, Eye, QrCode, Upload } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import api from "@/lib/api";

type BulkUploadSummary = {
  total: number;
  success: number;
  failed: number;
  errors: string[];
};

const DEFAULT_PURCHASE_DATE = new Date().toISOString().split("T")[0];
const ALLOWED_STATUSES = new Set([
  "PROCUREMENT",
  "COMMISSIONED",
  "IN_OPERATION",
  "MAINTENANCE",
  "DISPOSAL",
]);

export default function AddAsset() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<any>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkSummary, setBulkSummary] = useState<BulkUploadSummary | null>(null);

  // Correct fields for backend schema
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [vendor, setVendor] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  const readFileText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsText(file);
    });

  const parseCsvLine = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    return cells;
  };

  const parseCsv = (text: string) => {
    const rows = text
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean);

    if (!rows.length) return [] as Record<string, string>[];

    const headers = parseCsvLine(rows[0]).map((header) =>
      header.toLowerCase().replace(/\s+/g, "")
    );

    return rows.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = (values[index] || "").trim();
      });

      return row;
    });
  };

  const pickValue = (row: Record<string, any>, keys: string[]) => {
    for (const key of keys) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
      const value = row[normalizedKey] ?? row[key];
      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }
    return "";
  };

  const normalizeStatus = (value: string) => {
    const normalized = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    return ALLOWED_STATUSES.has(normalized) ? normalized : "PROCUREMENT";
  };

  const handleDownloadTemplate = () => {
    const template = [
      "name,category,department,vendor,purchaseCost,purchaseDate,status,description",
      "Dell Laptop XPS,IT Equipment,Engineering,Dell,1200,2026-03-13,COMMISSIONED,Developer laptop",
      "Office Chair,Furniture,Operations,IKEA,300,2026-03-13,IN_OPERATION,Ergonomic chair",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "asset-bulk-template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please choose a CSV or JSON file");
      return;
    }

    setIsBulkUploading(true);
    setBulkSummary(null);

    try {
      const text = await readFileText(bulkFile);
      let parsedRows: Record<string, any>[] = [];

      if (bulkFile.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text);
        parsedRows = Array.isArray(parsed) ? parsed : [];
      } else {
        parsedRows = parseCsv(text);
      }

      if (!parsedRows.length) {
        toast.error("No asset rows found in the uploaded file");
        return;
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let index = 0; index < parsedRows.length; index += 1) {
        const row = parsedRows[index] || {};
        const nameValue = pickValue(row, ["name", "assetname", "itemname"]);
        const categoryValue = pickValue(row, ["category"]);
        const departmentValue = pickValue(row, ["department"]);

        if (!nameValue || !categoryValue || !departmentValue) {
          failed += 1;
          errors.push(`Row ${index + 2}: missing required fields (name/category/department)`);
          continue;
        }

        const payload = {
          name: nameValue,
          category: categoryValue,
          department: departmentValue,
          vendor: pickValue(row, ["vendor"]) || "Unknown",
          purchaseCost: parseFloat(pickValue(row, ["purchasecost", "price"]) || "0"),
          purchaseDate: pickValue(row, ["purchasedate"]) || DEFAULT_PURCHASE_DATE,
          status: normalizeStatus(pickValue(row, ["status"])),
          description: pickValue(row, ["description"]),
        };

        try {
          await api.post("/assets", payload);
          success += 1;
        } catch (error: any) {
          failed += 1;
          const message = error?.response?.data?.message || "Failed to create asset";
          errors.push(`Row ${index + 2}: ${message}`);
        }
      }

      setBulkSummary({
        total: parsedRows.length,
        success,
        failed,
        errors,
      });

      if (success > 0) {
        toast.success(`${success} assets uploaded successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} rows failed during bulk upload`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Bulk upload failed");
    } finally {
      setIsBulkUploading(false);
    }
  };

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
              <CardTitle>Bulk Upload Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV or JSON file to create multiple assets in one go.
                Required fields per row: name, category, and department.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
                </Button>

                <Input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">
                  {bulkFile ? `Selected file: ${bulkFile.name}` : "No file selected"}
                </span>
                <Button
                  type="button"
                  className="gradient-primary"
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || isBulkUploading}
                >
                  {isBulkUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Bulk Data
                    </>
                  )}
                </Button>
              </div>

              {bulkSummary && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <p className="text-sm font-medium">Upload Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Total: {bulkSummary.total} | Success: {bulkSummary.success} | Failed: {bulkSummary.failed}
                  </p>
                  {bulkSummary.errors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded border bg-background p-2">
                      {bulkSummary.errors.slice(0, 10).map((error) => (
                        <p key={error} className="text-xs text-destructive">{error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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
