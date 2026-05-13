import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPIBoxProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: string;
  unit?: string;
  index?: number;
}

export function KPIBox({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  change,
  unit = "",
  index = 0,
}: KPIBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {change && (
            <p className={`mt-2 text-sm font-medium ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`${bgColor} rounded-xl p-3`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}
