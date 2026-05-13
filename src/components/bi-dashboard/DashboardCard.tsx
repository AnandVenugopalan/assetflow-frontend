import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  index?: number;
}

export function DashboardCard({
  title,
  subtitle,
  children,
  index = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
    </motion.div>
  );
}
