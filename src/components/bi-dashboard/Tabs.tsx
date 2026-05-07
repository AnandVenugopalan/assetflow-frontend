import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: TabsProps) {
  return (
    <div>
      {/* Tab Navigation - Modern 3D Style */}
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all overflow-hidden group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: isActive ? 0 : -4,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Layer */}
                <motion.div
                  className={`absolute inset-0 rounded-xl transition-all`}
                  initial={false}
                  animate={{
                    background: isActive
                      ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                      : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    boxShadow: isActive
                      ? "0 20px 25px -5px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Shine Effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    animate={{
                      opacity: [0, 0.2, 0],
                      x: [-100, 100],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center gap-2 z-10">
                  {tab.icon && (
                    <motion.span
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900"
                      }`}
                      animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      {tab.icon}
                    </motion.span>
                  )}
                  <span
                    className={`transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>

                {/* Border Glow Effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-blue-400 pointer-events-none"
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(96, 165, 250, 0.3)",
                        "0 0 20px rgba(96, 165, 250, 0.6)",
                        "0 0 10px rgba(96, 165, 250, 0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with Smooth Transition */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.98 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
