import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar } from "lucide-react";
import { Tabs } from "@/components/bi-dashboard/Tabs";
import { AssetUtilizationTab } from "@/components/bi-dashboard/AssetUtilizationTab";
import { MaintenanceHealthTab } from "@/components/bi-dashboard/MaintenanceHealthTab";
import { ProcurementCostTab } from "@/components/bi-dashboard/ProcurementCostTab";

const tabs = [
  {
    id: "utilization",
    label: "Asset Utilization Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: "maintenance",
    label: "Maintenance & Asset Health Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: "procurement",
    label: "Procurement & Cost Intelligence Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

export default function BIDashboard() {
  const [activeTab, setActiveTab] = useState("utilization");

  const renderTabContent = () => {
    switch (activeTab) {
      case "utilization":
        return <AssetUtilizationTab />;
      case "maintenance":
        return <MaintenanceHealthTab />;
      case "procurement":
        return <ProcurementCostTab />;
      default:
        return <AssetUtilizationTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">BI Dashboard</h1>
            <p className="text-gray-600 mt-2">Business Intelligence & Insights</p>
          </div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex gap-3"
          >
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Last 30 days</span>
            </button>
            <button className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
              Export
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation and Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {renderTabContent()}
        </Tabs>
      </motion.div>
    </div>
  );
}
