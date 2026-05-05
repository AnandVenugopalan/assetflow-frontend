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
  ComposedChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";
import { KPIBox } from "./KPIBox";
import { ChartContainer } from "./ChartContainer";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  CheckCircle,
} from "lucide-react";
import {
  procurementKPIs,
  procurementRequestStatus,
  monthlySpendTrend,
  categoryWiseSpend,
  vendorPerformance,
  topPurchasedCategories,
} from "@/lib/biDashboardData";

export function ProcurementCostTab() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KPIBox
          title="Total Spend"
          value={`$${(procurementKPIs.totalSpend / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50"
          change="+12%"
          index={0}
        />
        <KPIBox
          title="Total Requests"
          value={procurementKPIs.totalRequests}
          icon={ShoppingCart}
          color="text-blue-600"
          bgColor="bg-blue-50"
          change="+8%"
          index={1}
        />
        <KPIBox
          title="Approval Rate"
          value={`${procurementKPIs.approvalRate}%`}
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          change="+2.5%"
          index={2}
        />
        <KPIBox
          title="Avg Request Value"
          value={`$${procurementKPIs.avgRequestValue.toFixed(0)}`}
          icon={Package}
          color="text-purple-600"
          bgColor="bg-purple-50"
          change="+4%"
          index={3}
        />
        <KPIBox
          title="Pending Requests"
          value={procurementKPIs.pendingRequests}
          icon={TrendingUp}
          color="text-amber-600"
          bgColor="bg-amber-50"
          change="-6%"
          index={4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Procurement Request Status */}
        <ChartContainer
          title="Procurement Request Status"
          subtitle="Current status of all requests"
          index={0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={procurementRequestStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {procurementRequestStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} requests`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Spend Trend */}
        <ChartContainer
          title="Monthly Spend Trend"
          subtitle="Spend and request volume over time"
          index={1}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlySpendTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                label={{ value: "Spend ($)", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: "Requests", angle: 90, position: "insideRight" }}
              />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Legend />
              <Bar yAxisId="left" dataKey="spend" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Category-wise Spend */}
        <ChartContainer
          title="Category-wise Spend"
          subtitle="Procurement spending by category"
          index={2}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryWiseSpend}
              layout="vertical"
              margin={{ left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                formatter={(value) => `$${value}`}
              />
              <Bar dataKey="spend" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Vendor Performance */}
        <ChartContainer
          title="Vendor Performance"
          subtitle="Cost vs Rating analysis"
          index={3}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              data={vendorPerformance}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="cost" name="Cost ($)" tick={{ fontSize: 12 }} />
              <YAxis
                type="number"
                dataKey="rating"
                name="Rating"
                domain={[3, 5]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                cursor={{ strokeDasharray: "3 3" }}
              />
              <Scatter
                name="Vendors"
                data={vendorPerformance}
                fill="#8b5cf6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Top Purchased Categories */}
        <ChartContainer
          title="Top Purchased Categories"
          subtitle="Most frequently purchased items"
          index={4}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPurchasedCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="purchases" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Vendor List */}
        <ChartContainer
          title="Vendor Summary"
          subtitle="Top vendors and their metrics"
          index={5}
        >
          <div className="space-y-3">
            {vendorPerformance.map((vendor, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {vendor.vendor}
                  </h4>
                  <p className="text-xs text-gray-600">Cost: ${vendor.cost.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(vendor.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {vendor.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
