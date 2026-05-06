import { useState, useEffect } from "react";
import {
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
} from "recharts";
import { KPIBox } from "./KPIBox";
import { ChartContainer } from "./ChartContainer";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { fetchProcurementCostData, ProcurementCostResponse } from "@/lib/dashboardApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function ProcurementCostTab() {
  const [data, setData] = useState<ProcurementCostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProcurementCostData();
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
          title="Total Spend"
          value={`$${(data.metrics.totalSpend / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50"
          change={data.metrics.totalSpendChangePercent}
          index={0}
        />
        <KPIBox
          title="Total Requests"
          value={data.metrics.totalRequests}
          icon={ShoppingCart}
          color="text-blue-600"
          bgColor="bg-blue-50"
          change={data.metrics.totalRequestsChangePercent}
          index={1}
        />
        <KPIBox
          title="Closure Rate"
          value={`${data.metrics.closureRate.toFixed(1)}%`}
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          change={data.metrics.closureRateChangePercent}
          index={2}
        />
        <KPIBox
          title="Pending Requests"
          value={data.metrics.pendingRequests}
          icon={Clock}
          color="text-orange-600"
          bgColor="bg-orange-50"
          change={data.metrics.pendingRequestsChangePercent}
          index={3}
        />
        <KPIBox
          title="Avg Request Value"
          value={`$${(data.metrics.avgRequestValue / 1000).toFixed(0)}k`}
          icon={TrendingUp}
          color="text-purple-600"
          bgColor="bg-purple-50"
          change={data.metrics.avgRequestValueChangePercent}
          index={4}
        />
      </div>

      {/* Top Row - 3 Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Procurement Request Status */}
        <ChartContainer
          title="Procurement Request Status"
          subtitle="Breakdown of request statuses"
          index={0}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.requestStatusDistribution.map((item) => ({
                name: item.status,
                value: item.count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Procurement Spend Trend */}
        <ChartContainer
          title="Monthly Procurement Spend Trend"
          subtitle="Spend trends over months"
          index={1}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.monthlySpendTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                formatter={(value) => `$${value}`}
              />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Department-wise Spend */}
        <ChartContainer
          title="Department-wise Spend"
          subtitle="Spending by department"
          index={2}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.departmentWiseSpend}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={140} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="spend" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Bottom Row - 3 Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category-wise Procurement Spend */}
        <ChartContainer
          title="Category-wise Procurement Spend"
          subtitle="Spending by category"
          index={3}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.categoryWiseSpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="spend" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Pending Pipeline Value by Stage */}
        <ChartContainer
          title="Pending Pipeline Value by Stage"
          subtitle="Value at each procurement stage"
          index={4}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.pendingPipelineValueByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gap Coverage Notes */}
        <ChartContainer
          title="Gap Coverage Notes"
          subtitle="Key observations and actions"
          index={5}
        >
          <div className="p-6 space-y-4">
            {data.gapCoverageNotes.length > 0 ? (
              data.gapCoverageNotes.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-700">{item.note}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No notes available</p>
            )}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
