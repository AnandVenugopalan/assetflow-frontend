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
  HorizontalBarChart,
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
} from "lucide-react";
import {
  assetUtilizationKPIs,
  assetStatusData,
  inventoryByCategory,
  departmentAssetUsage,
  assetAging,
  topIdleCategories,
} from "@/lib/biDashboardData";

export function AssetUtilizationTab() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KPIBox
          title="Total Assets"
          value={assetUtilizationKPIs.totalAssets}
          icon={Package}
          color="text-blue-600"
          bgColor="bg-blue-50"
          change="+5%"
          index={0}
        />
        <KPIBox
          title="Utilization Rate"
          value={`${assetUtilizationKPIs.utilizationRate}%`}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
          change="+2.1%"
          index={1}
        />
        <KPIBox
          title="Available Assets"
          value={assetUtilizationKPIs.availableAssets}
          icon={Package}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          change="+12%"
          index={2}
        />
        <KPIBox
          title="In Maintenance"
          value={assetUtilizationKPIs.assetsInMaintenance}
          icon={Wrench}
          color="text-amber-600"
          bgColor="bg-amber-50"
          change="-8%"
          index={3}
        />
        <KPIBox
          title="Idle Assets"
          value={assetUtilizationKPIs.idleAssets}
          icon={Clock}
          color="text-red-600"
          bgColor="bg-red-50"
          change="-15%"
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
                data={assetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
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
            <BarChart data={inventoryByCategory}>
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
          subtitle="Asset allocation by department"
          index={2}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={departmentAssetUsage}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="usage" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Asset Aging Analysis */}
        <ChartContainer
          title="Asset Aging Analysis"
          subtitle="Distribution of assets by age group"
          index={3}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetAging}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Top Idle Asset Categories */}
        <ChartContainer
          title="Top Idle Asset Categories"
          subtitle="Asset categories with highest idle counts"
          index={4}
        >
          <div className="space-y-4">
            {topIdleCategories.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.idle}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                      style={{ width: `${(item.idle / 25) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
