import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Laptop, Smartphone, Server, Monitor, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function ITAssets() {
  const navigate = useNavigate();

  const [softwareLicenses, setSoftwareLicenses] = useState([]);
  const [hardwareDevices, setHardwareDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch IT assets from backend
  const fetchITAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch software licenses (filter by category containing "software" or "license")
      const softwareResponse = await api.get("/assets?type=software");
      setSoftwareLicenses(softwareResponse.data);

      // Fetch hardware devices (filter by IT hardware categories)
      const hardwareResponse = await api.get("/assets?type=hardware");
      setHardwareDevices(hardwareResponse.data);

    } catch (err) {
      console.error("Error fetching IT assets:", err);
      setError("Failed to load IT assets");
      toast.error("Failed to load IT assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchITAssets();
  }, []);

  // Calculate stats from API data
  const stats = [
    {
      title: "Total Devices",
      value: loading ? "..." : hardwareDevices.length.toString(),
      icon: Laptop,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Software Licenses",
      value: loading ? "..." : softwareLicenses.length.toString(),
      icon: Monitor,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Servers",
      value: loading ? "..." : hardwareDevices.filter((d: any) => d.category?.toLowerCase().includes("server")).length.toString(),
      icon: Server,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      title: "Mobile Devices",
      value: loading ? "..." : hardwareDevices.filter((d: any) => d.category?.toLowerCase().includes("mobile") || d.category?.toLowerCase().includes("phone")).length.toString(),
      icon: Smartphone,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "commissioned":
      case "in_operation":
        return "bg-success/10 text-success border-success/20";
      case "maintenance":
        return "bg-warning/10 text-warning border-warning/20";
      case "disposal":
      case "audit":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IT / Digital Asset Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage software licenses, hardware devices, and digital assets
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading IT assets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IT / Digital Asset Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage software licenses, hardware devices, and digital assets
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <span className="ml-2 text-destructive">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IT / Digital Asset Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage software licenses, hardware devices, and digital assets
          </p>
        </div>
        <Button className="gradient-primary" onClick={() => navigate("/it-assets/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add IT Asset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-smooth hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="software" className="space-y-4">
        <TabsList>
          <TabsTrigger value="software">Software Licenses</TabsTrigger>
          <TabsTrigger value="hardware">Hardware Devices</TabsTrigger>
          <TabsTrigger value="mapping">Asset-User Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="software">
          <Card>
            <CardHeader>
              <CardTitle>Software License Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {softwareLicenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                            No software licenses found
                          </TableCell>
                        </TableRow>
                      ) : (
                        softwareLicenses.map((license: any) => (
                          <TableRow key={license.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{license.id}</TableCell>
                            <TableCell className="font-medium">{license.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{license.category || "Software"}</Badge>
                            </TableCell>
                            <TableCell>{license.serialNumber || "N/A"}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {license.owner?.name || "Unassigned"}
                              </div>
                            </TableCell>
                            <TableCell>{license.location || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(license.status)}>
                                {license.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {license.purchaseCost ? `₹${license.purchaseCost.toLocaleString()}` : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/assets/${license.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-warning/50 bg-warning/5 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">License Expiry Alert</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Some software licenses may be expiring soon. Regular monitoring is recommended.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardware">
          <Card>
            <CardHeader>
              <CardTitle>Hardware Device Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hardwareDevices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No hardware devices found
                          </TableCell>
                        </TableRow>
                      ) : (
                        hardwareDevices.map((device: any) => (
                          <TableRow key={device.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{device.id}</TableCell>
                            <TableCell className="font-medium">{device.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{device.category || "Hardware"}</Badge>
                            </TableCell>
                            <TableCell>{device.owner?.name || "Unassigned"}</TableCell>
                            <TableCell>{device.location || "N/A"}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {device.serialNumber || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(device.status)}>
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/assets/${device.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Server className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Asset-User Mapping</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  View and manage the mapping between IT assets and users. Integration with Active
                  Directory coming soon.
                </p>
                <Button 
                  onClick={() => navigate("/it-assets/mapping")}
                >
                  Configure Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
