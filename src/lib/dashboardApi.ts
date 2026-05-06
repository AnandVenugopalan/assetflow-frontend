import api from "@/lib/api";

// Types for Asset Utilization Dashboard
export interface AssetMetrics {
  totalAssets: number;
  totalAssetsChange: number;
  totalAssetsChangePercent: string;
  utilizationRate: number;
  utilizationRateChange: number;
  utilizationRateChangePercent: string;
  availableAssets: number;
  availableAssetsChange: number;
  availableAssetsChangePercent: string;
  inMaintenanceAssets: number;
  inMaintenanceChange: number;
  inMaintenanceChangePercent: string;
  idleAssets: number;
  idleAssetsChange: number;
  idleAssetsChangePercent: string;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface InventoryCategoryItem {
  category: string;
  inventory: number;
  allocated: number;
  available: number;
}

export interface DepartmentUsageItem {
  department: string;
  assetCount: number;
  utilizationRate: number;
}

export interface AssetAgingItem {
  ageGroup: string;
  count: number;
}

export interface IdleCategoryItem {
  category: string;
  idleCount: number;
}

export interface AssetUtilizationResponse {
  metrics: AssetMetrics;
  statusDistribution: StatusDistributionItem[];
  inventoryByCategory: InventoryCategoryItem[];
  departmentWiseAssetUsage: DepartmentUsageItem[];
  assetAgingAnalysis: AssetAgingItem[];
  topIdleAssetCategories: IdleCategoryItem[];
  lastUpdated?: string;
}

// Types for Maintenance & Asset Health Dashboard
export interface MaintenanceMetrics {
  totalRequests: number;
  totalRequestsChange: number;
  totalRequestsChangePercent: string;
  openRequests: number;
  openRequestsChange: number;
  openRequestsChangePercent: string;
  maintenanceCost: number;
  maintenanceCostChange: number;
  maintenanceCostChangePercent: string;
  totalAssets: number;
  totalAssetsChange: number;
  totalAssetsChangePercent: string;
  closureRate: number;
  closureRateChange: number;
  closureRateChangePercent: string;
  avgResolutionTime: number;
  avgResolutionTimeChange: number;
  avgResolutionTimeChangePercent: string;
}

export interface RequestStatusItem {
  status: string;
  count: number;
  percentage: number;
}

export interface PriorityItem {
  priority: string;
  count: number;
}

export interface TrendItem {
  month: string;
  value: number;
}

export interface RepairFailureItem {
  assetId: string;
  assetName: string;
  failureCount: number;
  cost: number;
}

export interface CostPerAssetItem {
  assetName: string;
  cost: number;
}

export interface GapNoteItem {
  note: string;
}

export interface MaintenanceHealthResponse {
  metrics: MaintenanceMetrics;
  requestStatusDistribution: RequestStatusItem[];
  priorityDistribution: PriorityItem[];
  monthlyMaintenanceTrend: TrendItem[];
  maintenanceCostTrend: TrendItem[];
  avgResolutionTimeTrend: TrendItem[];
  repairFailures: RepairFailureItem[];
  assetHealthScore: Array<{
    health: string;
    count: number;
  }>;
  maintenanceCostPerAsset: CostPerAssetItem[];
  gapCoverageNotes: GapNoteItem[];
  lastUpdated?: string;
}

// Types for Procurement & Cost Intelligence Dashboard
export interface ProcurementMetrics {
  totalSpend: number;
  totalSpendChange: number;
  totalSpendChangePercent: string;
  totalRequests: number;
  totalRequestsChange: number;
  totalRequestsChangePercent: string;
  approvalRate: number;
  approvalRateChange: number;
  approvalRateChangePercent: string;
  avgRequestValue: number;
  avgRequestValueChange: number;
  avgRequestValueChangePercent: string;
  pendingRequests: number;
  pendingRequestsChange: number;
  pendingRequestsChangePercent: string;
  closureRate: number;
  closureRateChange: number;
  closureRateChangePercent: string;
}

export interface RequestStatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface MonthlySpendItem {
  month: string;
  spend: number;
  requests: number;
}

export interface CategoryWiseSpendItem {
  category: string;
  spend: number;
}

export interface VendorPerformanceItem {
  vendorId: string;
  vendorName: string;
  cost: number;
  rating: number;
}

export interface TopPurchasedItem {
  category: string;
  count: number;
}

export interface VendorSummaryItem {
  vendorId: string;
  vendorName: string;
  totalSpend: number;
  rating: number;
  ratingDisplay: string;
}

export interface DepartmentSpendItem {
  department: string;
  spend: number;
}

export interface PipelineStageItem {
  stage: string;
  value: number;
}

export interface GapCoverageNoteItem {
  note: string;
}

export interface ProcurementCostResponse {
  metrics: ProcurementMetrics;
  requestStatusDistribution: RequestStatusDistributionItem[];
  monthlySpendTrend: MonthlySpendItem[];
  categoryWiseSpend: CategoryWiseSpendItem[];
  vendorPerformance: VendorPerformanceItem[];
  topPurchasedCategories: TopPurchasedItem[];
  vendorSummary: VendorSummaryItem[];
  departmentWiseSpend: DepartmentSpendItem[];
  pendingPipelineValueByStage: PipelineStageItem[];
  gapCoverageNotes: GapCoverageNoteItem[];
  lastUpdated?: string;
}

// API Service for Asset Utilization Dashboard
export const fetchAssetUtilizationData = async (): Promise<AssetUtilizationResponse> => {
  try {
    const response = await api.get("/dashboard/asset-utilization");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch asset utilization data:", error);
    throw new Error("Failed to load asset utilization data");
  }
};

// API Service for Maintenance & Asset Health Dashboard
export const fetchMaintenanceHealthData = async (): Promise<MaintenanceHealthResponse> => {
  try {
    const response = await api.get("/dashboard/maintenance-asset-health");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch maintenance health data:", error);
    throw new Error("Failed to load maintenance health data");
  }
};

// API Service for Procurement & Cost Intelligence Dashboard
export const fetchProcurementCostData = async (): Promise<ProcurementCostResponse> => {
  try {
    const response = await api.get("/dashboard/procurement-cost-intelligence");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch procurement cost data:", error);
    throw new Error("Failed to load procurement cost data");
  }
};

// Optional: Fetch all dashboard data in parallel
export const fetchAllDashboardData = async () => {
  try {
    const [assetData, maintenanceData, procurementData] = await Promise.all([
      fetchAssetUtilizationData(),
      fetchMaintenanceHealthData(),
      fetchProcurementCostData(),
    ]);

    return {
      asset: assetData,
      maintenance: maintenanceData,
      procurement: procurementData,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
};
