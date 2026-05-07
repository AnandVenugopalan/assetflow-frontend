import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { KPIBox } from "./KPIBox";
import { ChartContainer } from "./ChartContainer";
import { DashboardCard } from "./DashboardCard";
import {
  Package,
  TrendingUp,
  AlertCircle,
  Wrench,
  Clock,
  Lightbulb,
} from "lucide-react";
import { fetchAssetUtilizationData, AssetUtilizationResponse } from "@/lib/dashboardApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function AssetUtilizationTab() {
  const [data, setData] = useState<AssetUtilizationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAssetUtilizationData();
        setData(response);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-12">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-12">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KPIBox
          title="Total Assets"
          value={data.metrics.totalAssets}
          icon={Package}
          color="text-blue-600"
          bgColor="bg-blue-50"
          change={data.metrics.totalAssetsChangePercent}
          index={0}
        />
        <KPIBox
          title="Utilization Rate"
          value={`${data.metrics.utilizationRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
          change={data.metrics.utilizationRateChangePercent}
          index={1}
        />
        <KPIBox
          title="Available Assets"
          value={data.metrics.availableAssets}
          icon={Package}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          change={data.metrics.availableAssetsChangePercent}
          index={2}
        />
        <KPIBox
          title="In Maintenance"
          value={data.metrics.inMaintenanceAssets}
          icon={Wrench}
          color="text-amber-600"
          bgColor="bg-amber-50"
          change={data.metrics.inMaintenanceChangePercent}
          index={3}
        />
        <KPIBox
          title="Idle Assets"
          value={data.metrics.idleAssets}
          icon={Clock}
          color="text-red-600"
          bgColor="bg-red-50"
          change={data.metrics.idleAssetsChangePercent}
          index={4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Asset Status Distribution */}
        <ChartContainer
          title="Asset Status Distribution"
          subtitle="Breakdown of asset allocation status"
          index={0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution.map((item) => ({
                  name: item.status,
                  value: item.count,
                  fill: item.status === "Available" ? "#3b82f6" : item.status === "Allocated" ? "#10b981" : "#f97316",
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={false}
              >
                {data.statusDistribution.map((entry, index) => {
                  const colors = ["#3b82f6", "#10b981", "#f97316"];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Legend />
              <Tooltip formatter={(value) => `${value} assets`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Inventory vs Allocated Assets by Category */}
        <ChartContainer
          title="Inventory vs Allocated Assets by Category"
          subtitle="Stock utilization across asset categories"
          index={1}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.inventoryByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Legend />
              <Bar dataKey="inventory" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="allocated" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Department-wise Asset Usage */}
        <ChartContainer
          title="Department-wise Asset Usage"
          subtitle="Asset distribution across departments"
          index={2}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.departmentWiseAssetUsage}
              layout="vertical"
              margin={{ top: 10, right: 150, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={65} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="assetCount" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Asset Aging Analysis */}
        <ChartContainer
          title="Asset Aging Analysis"
          subtitle="Distribution of assets by age"
          index={3}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.assetAgingAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="ageGroup" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Top Idle Asset Categories */}
        <ChartContainer
          title="Top Idle Asset Categories"
          subtitle="Categories with the most idle assets"
          index={4}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topIdleAssetCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="idleCount" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Key Insights */}
        <ChartContainer
          title="Key Insights"
          subtitle="Important observations and recommendations"
          index={5}
        >
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-700">
                Overall utilization is healthy, but {data.metrics.idleAssets} assets still represent a visible optimization opportunity.
              </p>
            </div>
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-700">
                {data.departmentWiseAssetUsage.length} departments have deployed assets and should be reviewed before fresh procurement.
              </p>
            </div>
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-700">
                Most assets ({data.assetAgingAnalysis[0]?.count || 0}) are 0-1 years old, indicating recent acquisitions with good operational capacity.
              </p>
            </div>
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-700">
                Assets older than 5 years should be monitored for maintenance cost and replacement planning.
              </p>
            </div>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
