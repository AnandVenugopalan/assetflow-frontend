import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { employees } from "@/lib/mockData";
import api from "../lib/api";

export default function AddITAsset() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetType, setAssetType] = useState<"hardware" | "software">("hardware");

  // ✅ Hardware states
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [department, setDepartment] = useState("");
  const [specifications, setSpecifications] = useState("");

  // ✅ Software states
  const [softwareName, setSoftwareName] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [version, setVersion] = useState("");
  const [totalLicenses, setTotalLicenses] = useState("");
  const [usedLicenses, setUsedLicenses] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [annualCost, setAnnualCost] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let payload: any = {};

      if (assetType === "hardware") {
        payload = {
          name: deviceName,
          category: deviceType,
          serialNumber: serialNo,
          location: department || "IT Department",
          ownerUserId: assignedUser || undefined,
          status: "PROCUREMENT",
        };
      } else {
        payload = {
          name: softwareName,
          category: "SOFTWARE",
          serialNumber: licenseKey || "",
          price: annualCost ? Number(annualCost) : undefined,
          location: "Software Department",
          ownerUserId: undefined,
          status: "PROCUREMENT",
        };
      }

      const res = await api.post("/assets", payload);

      toast.success("Asset added successfully!");
      navigate("/it-assets");

    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/it-assets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add IT Asset</h1>
          <p className="text-muted-foreground mt-1">Register new hardware device or software license</p>
        </div>
      </div>

      <Tabs value={assetType} onValueChange={(v) => setAssetType(v as "hardware" | "software")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hardware">Hardware Device</TabsTrigger>
          <TabsTrigger value="software">Software License</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {/* ✅ HARDWARE FORM */}
          <TabsContent value="hardware" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hardware Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Device Name *</Label>
                    <Input
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="Dell OptiPlex 7090"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Device Type *</Label>
                    <Select onValueChange={setDeviceType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="smartphone">Smartphone</SelectItem>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="scanner">Scanner</SelectItem>
                        <SelectItem value="router">Router</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    <Input
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="Dell"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="OptiPlex 7090"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Serial Number *</Label>
                    <Input
                      value={serialNo}
                      onChange={(e) => setSerialNo(e.target.value)}
                      placeholder="SN-XXX-XXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IP Address</Label>
                    <Input
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="192.168.1.100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Select onValueChange={setAssignedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => (
                          <SelectItem key={e} value={e.toLowerCase()}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Specifications</Label>
                  <Input
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    placeholder="Intel i7, 16GB RAM, 512GB SSD"
                  />
                </div>

              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Hardware Device"}
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate("/it-assets")}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          {/* ✅ SOFTWARE FORM */}
          <TabsContent value="software" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Software License Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="space-y-2">
                  <Label>Software Name *</Label>
                  <Input
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    placeholder="Microsoft Office 365"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>License Type *</Label>
                    <Select onValueChange={setLicenseType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="perliminary">Perpetual</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="open-source">Open Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Input
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total Licenses *</Label>
                    <Input
                      type="number"
                      value={totalLicenses}
                      onChange={(e) => setTotalLicenses(e.target.value)}
                      placeholder="250"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currently Used</Label>
                    <Input
                      type="number"
                      value={usedLicenses}
                      onChange={(e) => setUsedLicenses(e.target.value)}
                      placeholder="242"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Purchase Date *</Label>
                    <Input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Vendor/Publisher</Label>
                    <Input
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="Microsoft"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Annual Cost (₹) *</Label>
                    <Input
                      type="number"
                      value={annualCost}
                      onChange={(e) => setAnnualCost(e.target.value)}
                      placeholder="850000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>License Key</Label>
                  <Input
                    type="password"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="XXXXX-XXXXX-XXXXX"
                  />
                </div>

              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Software License"}
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate("/it-assets")}>
                Cancel
              </Button>
            </div>

          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
