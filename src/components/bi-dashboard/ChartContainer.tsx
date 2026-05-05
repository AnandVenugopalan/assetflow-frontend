import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  index?: number;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  index = 0,
}: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="w-full overflow-x-auto">
        {children}
      </div>
    </motion.div>
  );
}
