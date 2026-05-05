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
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
} from "recharts";
import { KPIBox } from "./KPIBox";
import { ChartContainer } from "./ChartContainer";
import {
  AlertCircle,
  Wrench,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  maintenanceKPIs,
  maintenanceRequestStatus,
  monthlyMaintenanceTrend,
  priorityDistribution,
  maintenanceCostTrend,
  topHighCostAssets,
  repeatFailures,
  assetHealthScore,
} from "@/lib/biDashboardData";

export function MaintenanceHealthTab() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KPIBox
          title="Total Requests"
          value={maintenanceKPIs.totalRequests}
          icon={Wrench}
          color="text-blue-600"
          bgColor="bg-blue-50"
          change="+8%"
          index={0}
        />
        <KPIBox
          title="Open Requests"
          value={maintenanceKPIs.openRequests}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
          change="-12%"
          index={1}
        />
        <KPIBox
          title="Closure Rate"
          value={`${maintenanceKPIs.closureRate}%`}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
          change="+3%"
          index={2}
        />
        <KPIBox
          title="Total Cost"
          value={`$${(maintenanceKPIs.totalMaintenanceCost / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="text-purple-600"
          bgColor="bg-purple-50"
          change="+5%"
          index={3}
        />
        <KPIBox
          title="Critical Assets"
          value={maintenanceKPIs.criticalAssets}
          icon={AlertTriangle}
          color="text-amber-600"
          bgColor="bg-amber-50"
          change="-2"
          index={4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Request Status Distribution */}
        <ChartContainer
          title="Request Status Distribution"
          subtitle="Maintenance request status breakdown"
          index={0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={maintenanceRequestStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {maintenanceRequestStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} requests`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Maintenance Trend */}
        <ChartContainer
          title="Monthly Maintenance Trend"
          subtitle="Requests and costs over time"
          index={1}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyMaintenanceTrend}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRequests)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Priority Distribution */}
        <ChartContainer
          title="Priority Distribution"
          subtitle="Maintenance requests by priority level"
          index={2}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Maintenance Cost Trend */}
        <ChartContainer
          title="Maintenance Cost Trend"
          subtitle="Monthly maintenance expenditure"
          index={3}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceCostTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                formatter={(value) => `$${value}`}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Top High-Cost Assets */}
        <ChartContainer
          title="Top High-Cost Assets"
          subtitle="Assets with highest maintenance costs"
          index={4}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topHighCostAssets}
              layout="vertical"
              margin={{ left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="asset" type="category" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                formatter={(value) => `$${value}`}
              />
              <Bar dataKey="cost" fill="#ef4444" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Repeat Failures */}
        <ChartContainer
          title="Repeat Failures"
          subtitle="Assets requiring frequent maintenance"
          index={5}
        >
          <div className="space-y-4">
            {repeatFailures.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.asset}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.failures} failures
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                      style={{ width: `${(item.failures / 8) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* Asset Health Score */}
        <ChartContainer
          title="Asset Health Score"
          subtitle="Distribution of asset health status"
          index={6}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetHealthScore}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="health" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
