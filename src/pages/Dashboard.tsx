import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Wrench, Archive, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [myAssets, setMyAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setDashboardData(response.data);

      // Fetch user's assets if not admin/manager
      if (user && user.role === 'USER') {
        const assetsResponse = await api.get(`/assets?assignedTo=${user.id}`);
        setMyAssets(assetsResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDashboardData();
    })();
  }, []);

  // Calculate stats from API data
  const stats = dashboardData ? [
    {
      title: "Total Assets",
      value: dashboardData.totalAssets?.toString() || "0",
      change: "+12%", // Could be calculated from historical data
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Assets",
      value: dashboardData.assetsByStatus?.find(s => s.status === 'IN_OPERATION')?._count?.toString() || "0",
      change: "+8%",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Under Maintenance",
      value: dashboardData.assetsByStatus?.find(s => s.status === 'MAINTENANCE')?._count?.toString() || "0",
      change: "-5%",
      icon: Wrench,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Retired Assets",
      value: dashboardData.assetsByStatus?.find(s => s.status === 'DISPOSAL')?._count?.toString() || "0",
      change: "+2",
      icon: Archive,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ] : [];

  // Transform category data for charts
  const categoryData = dashboardData?.assetsByCategory?.map(cat => ({
    name: cat.category || 'Unknown',
    value: cat._count,
    color: getCategoryColor(cat.category),
  })) || [];

  // Helper function to get color for categories
  function getCategoryColor(category: string) {
    const colors = {
      'IT Equipment': "hsl(var(--primary))",
      'Furniture': "hsl(var(--secondary))",
      'Vehicles': "hsl(var(--accent))",
      'Property': "hsl(var(--success))",
      'Others': "hsl(var(--muted-foreground))",
    };
    return colors[category as keyof typeof colors] || "hsl(var(--muted-foreground))";
  }

  // Helper function to get color for status
  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case "allocated":
        return "bg-success/10 text-success border-success/20";
      case "maintenance":
        return "bg-warning/10 text-warning border-warning/20";
      case "disposal":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Rajesh! Here's your asset overview.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              toast.success("Opening reports...");
            }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button 
            className="gradient-primary"
            onClick={() => navigate("/assets/add")}
          >
            <Package className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
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
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.change.startsWith("+") ? "text-success" : "text-destructive"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="gradient-accent">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage your assets efficiently</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary"
              onClick={() => {
                toast.success("Starting asset audit...");
              }}
            >
              Start Audit
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate("/requests/new")}
            >
              Raise Request
            </Button>
            <Button 
              onClick={() => {
                toast.success("Generating comprehensive report...");
              }}
            >
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Assets Section for Users */}
      {user?.role === 'USER' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Assets</CardTitle>
            <Button variant="outline" onClick={() => navigate("/my-assets")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {myAssets.length === 0 ? (
              <p className="text-muted-foreground">No assets allocated to you</p>
            ) : (
              <div className="space-y-2">
                {myAssets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.category}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(asset.status)}>
                      {asset.status?.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
