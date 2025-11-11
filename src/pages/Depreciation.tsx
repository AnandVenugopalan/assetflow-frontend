import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingDown, Calculator, DollarSign, FileText, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import api from "../lib/api";

const depreciationTrendData = [
  { year: "2020", value: 2850000 },
  { year: "2021", value: 3120000 },
  { year: "2022", value: 2980000 },
  { year: "2023", value: 3350000 },
  { year: "2024", value: 3580000 },
];

export default function Depreciation() {
  // State for API data
  const [depreciationData, setDepreciationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for calculator form
  const [assetCost, setAssetCost] = useState("");
  const [salvageValue, setSalvageValue] = useState("");
  const [usefulLife, setUsefulLife] = useState("");
  const [depreciationMethod, setDepreciationMethod] = useState("slm");
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  // Fetch depreciation data from API
  const fetchDepreciationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/depreciation/summary");
      setDepreciationData(response.data);
    } catch (err: any) {
      console.error("Error fetching depreciation data:", err);
      setError("Failed to load depreciation data");
      toast.error("Failed to load depreciation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepreciationData();
  }, []);

  // Calculate depreciation
  const handleCalculateDepreciation = async () => {
    if (!assetCost || !salvageValue || !usefulLife) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCalculating(true);
    try {
      const payload = {
        assetCost: Number(assetCost),
        salvageValue: Number(salvageValue),
        usefulLife: Number(usefulLife),
        method: depreciationMethod
      };

      const response = await api.post("/depreciation/calculate", payload);
      setCalculationResult(response.data);
      toast.success("Depreciation calculated successfully!");
    } catch (err: any) {
      console.error("Error calculating depreciation:", err);
      toast.error(err.response?.data?.message || "Error calculating depreciation");
    } finally {
      setCalculating(false);
    }
  };

  // Generate depreciation report
  const handleGenerateReport = async () => {
    try {
      toast.success("Generating depreciation report...");
      const response = await api.get("/depreciation/report", {
        responseType: "blob"
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'depreciation-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error("Error generating report:", err);
      toast.error("Failed to generate report");
    }
  };

  // Dynamic stats based on API data
  const stats = [
    {
      title: "Total Depreciation",
      value: loading ? "..." : `₹${(depreciationData?.totalDepreciation || 0).toLocaleString()}`,
      change: depreciationData?.change || "+8.2%",
      icon: TrendingDown,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Current Year",
      value: loading ? "..." : `₹${(depreciationData?.currentYearDepreciation || 0).toLocaleString()}`,
      change: "YTD",
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Book Value",
      value: loading ? "..." : `₹${(depreciationData?.bookValue || 0).toLocaleString()}`,
      change: "Assets",
      icon: FileText,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Depreciation & Financials</h1>
          <p className="text-muted-foreground mt-1">
            Calculate depreciation and manage financial aspects of assets
          </p>
        </div>
        <Button 
          className="gradient-primary"
          onClick={handleGenerateReport}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Depreciation Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetCost">Asset Cost (₹)</Label>
              <Input 
                id="assetCost" 
                type="number" 
                placeholder="Enter asset cost"
                value={assetCost}
                onChange={(e) => setAssetCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salvageValue">Salvage Value (₹)</Label>
              <Input 
                id="salvageValue" 
                type="number" 
                placeholder="Enter salvage value"
                value={salvageValue}
                onChange={(e) => setSalvageValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usefulLife">Useful Life (Years)</Label>
              <Input 
                id="usefulLife" 
                type="number" 
                placeholder="Enter useful life"
                value={usefulLife}
                onChange={(e) => setUsefulLife(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Depreciation Method</Label>
              <Select value={depreciationMethod} onValueChange={setDepreciationMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slm">Straight Line Method</SelectItem>
                  <SelectItem value="wdv">Written Down Value</SelectItem>
                  <SelectItem value="db">Double Declining Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full"
              onClick={handleCalculateDepreciation}
              disabled={calculating}
            >
              {calculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="mr-2 h-4 w-4" />
              )}
              {calculating ? "Calculating..." : "Calculate Depreciation"}
            </Button>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Annual Depreciation:</span>
                <span className="font-semibold">
                  ₹{calculationResult?.annualDepreciation?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Depreciation:</span>
                <span className="font-semibold">
                  ₹{calculationResult?.monthlyDepreciation?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Book Value (Year 1):</span>
                <span className="font-semibold">
                  ₹{calculationResult?.bookValueYear1?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depreciation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={depreciationTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  formatter={(value) => `₹${(Number(value) / 100000).toFixed(2)}L`}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                label: "Capitalization", 
                value: loading ? "..." : `₹${(depreciationData?.capitalization || 0).toLocaleString()}`, 
                color: "text-primary" 
              },
              { 
                label: "Accumulated Depreciation", 
                value: loading ? "..." : `₹${(depreciationData?.accumulatedDepreciation || 0).toLocaleString()}`, 
                color: "text-warning" 
              },
              { 
                label: "Net Book Value", 
                value: loading ? "..." : `₹${(depreciationData?.netBookValue || 0).toLocaleString()}`, 
                color: "text-success" 
              },
              { 
                label: "Revaluation Reserve", 
                value: loading ? "..." : `₹${(depreciationData?.revaluationReserve || 0).toLocaleString()}`, 
                color: "text-accent-foreground" 
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Depreciation by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading depreciation data...</span>
              </div>
            ) : depreciationData?.byCategory ? (
              depreciationData.byCategory.map((item: any) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              [
                { category: "IT Equipment", amount: "₹42.5L", percentage: 48 },
                { category: "Furniture", amount: "₹18.2L", percentage: 21 },
                { category: "Vehicles", amount: "₹15.8L", percentage: 18 },
                { category: "Property", amount: "₹9.1L", percentage: 13 },
              ].map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">{item.amount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
