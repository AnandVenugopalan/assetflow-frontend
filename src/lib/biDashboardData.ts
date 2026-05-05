// Asset Utilization Dashboard Data
export const assetUtilizationKPIs = {
  totalAssets: 1250,
  utilizationRate: 78.5,
  availableAssets: 275,
  assetsInMaintenance: 45,
  idleAssets: 89,
};

export const assetStatusData = [
  { name: "Available", value: 275, fill: "#10b981" },
  { name: "Allocated", value: 890, fill: "#3b82f6" },
  { name: "Maintenance", value: 85, fill: "#f59e0b" },
];

export const inventoryByCategory = [
  { category: "Laptops", inventory: 450, allocated: 380 },
  { category: "Desks", inventory: 320, allocated: 245 },
  { category: "Chairs", inventory: 280, allocated: 210 },
  { category: "Monitors", inventory: 380, allocated: 310 },
  { category: "Printers", inventory: 120, allocated: 95 },
  { category: "Servers", inventory: 85, allocated: 78 },
];

export const departmentAssetUsage = [
  { name: "Sales", usage: 245 },
  { name: "IT", usage: 180 },
  { name: "HR", usage: 125 },
  { name: "Finance", usage: 165 },
  { name: "Operations", usage: 210 },
  { name: "Marketing", usage: 95 },
  { name: "Legal", usage: 68 },
];

export const assetAging = [
  { range: "0-1 years", count: 520 },
  { range: "1-3 years", count: 480 },
  { range: "3+ years", count: 250 },
];

export const topIdleCategories = [
  { category: "Printers", idle: 25 },
  { category: "Scanners", idle: 18 },
  { category: "Projectors", idle: 12 },
  { category: "Monitors", idle: 20 },
];

// Maintenance & Asset Health Dashboard Data
export const maintenanceKPIs = {
  totalRequests: 485,
  openRequests: 67,
  closureRate: 86.2,
  totalMaintenanceCost: 125430,
  criticalAssets: 12,
};

export const maintenanceRequestStatus = [
  { name: "Open", value: 67, fill: "#ef4444" },
  { name: "Closed", value: 385, fill: "#10b981" },
  { name: "In Progress", value: 33, fill: "#f59e0b" },
];

export const monthlyMaintenanceTrend = [
  { month: "Jan", requests: 42, cost: 8500 },
  { month: "Feb", requests: 38, cost: 7800 },
  { month: "Mar", requests: 45, cost: 9200 },
  { month: "Apr", requests: 52, cost: 10600 },
  { month: "May", requests: 48, cost: 9800 },
  { month: "Jun", requests: 55, cost: 11200 },
];

export const priorityDistribution = [
  { priority: "Critical", count: 28 },
  { priority: "High", count: 92 },
  { priority: "Medium", count: 215 },
  { priority: "Low", count: 150 },
];

export const maintenanceCostTrend = [
  { month: "Jan", cost: 8500 },
  { month: "Feb", cost: 7800 },
  { month: "Mar", cost: 9200 },
  { month: "Apr", cost: 10600 },
  { month: "May", cost: 9800 },
  { month: "Jun", cost: 11200 },
];

export const topHighCostAssets = [
  { asset: "Server A", cost: 8500 },
  { asset: "HVAC System", cost: 6200 },
  { asset: "Elevator", cost: 5800 },
  { asset: "Generator", cost: 4500 },
  { asset: "Backup System", cost: 3800 },
];

export const repeatFailures = [
  { asset: "Printer HP-12", failures: 8 },
  { asset: "AC Unit-5", failures: 6 },
  { asset: "Monitor LG-23", failures: 5 },
  { asset: "Transformer T-2", failures: 4 },
];

export const assetHealthScore = [
  { health: "Healthy", count: 678 },
  { health: "Medium", count: 412 },
  { health: "Critical", count: 160 },
];

// Procurement & Cost Intelligence Dashboard Data
export const procurementKPIs = {
  totalSpend: 875420,
  totalRequests: 1250,
  approvalRate: 92.3,
  avgRequestValue: 700.34,
  pendingRequests: 87,
};

export const procurementRequestStatus = [
  { name: "Approved", value: 968, fill: "#10b981" },
  { name: "Pending", value: 87, fill: "#f59e0b" },
  { name: "Rejected", value: 75, fill: "#ef4444" },
  { name: "Draft", value: 120, fill: "#e5e7eb" },
];

export const monthlySpendTrend = [
  { month: "Jan", spend: 65000, requests: 95 },
  { month: "Feb", spend: 72000, requests: 110 },
  { month: "Mar", spend: 68500, requests: 105 },
  { month: "Apr", spend: 81200, requests: 125 },
  { month: "May", spend: 75800, requests: 118 },
  { month: "Jun", spend: 82920, requests: 130 },
];

export const categoryWiseSpend = [
  { category: "IT Equipment", spend: 285000 },
  { category: "Furniture & Fixtures", spend: 195600 },
  { category: "Office Supplies", spend: 142500 },
  { category: "Vehicles", spend: 125800 },
  { category: "Machinery", spend: 98520 },
];

export const vendorPerformance = [
  { vendor: "TechCorp Ltd", cost: 45000, rating: 4.5 },
  { vendor: "Supply House", cost: 62000, rating: 4.2 },
  { vendor: "Global Trade", cost: 38000, rating: 4.8 },
  { vendor: "ProVision Inc", cost: 51000, rating: 4.3 },
  { vendor: "Quality Supplier", cost: 72000, rating: 4.6 },
  { vendor: "Budget Deals", cost: 85000, rating: 3.8 },
];

export const topPurchasedCategories = [
  { category: "Laptops", purchases: 245 },
  { category: "Office Chairs", purchases: 180 },
  { category: "Monitors", purchases: 165 },
  { category: "Desks", purchases: 140 },
  { category: "Keyboards", purchases: 125 },
];
