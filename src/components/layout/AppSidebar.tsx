import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Wrench, Laptop, Building2, TrendingDown, Trash2, FileText, Bell, Settings, LogOut, PlaySquare, CheckSquare, Search, DollarSign } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


// RBAC access matrix
const ACCESS_MATRIX = {
  "Dashboard": ["ADMIN", "MANAGER", "FINANCE", "USER"],
  "Asset Register": ["ADMIN", "MANAGER", "FINANCE", "USER"],
  "Procurement": ["ADMIN"],
  "Commissioning": ["ADMIN"],
  "Allocation": ["ADMIN", "MANAGER"],
  "Operation": ["ADMIN", "MANAGER"],
  "Maintenance": ["ADMIN", "MANAGER", "FINANCE"],
  "Audit": ["ADMIN", "MANAGER", "FINANCE"],
  "IT Assets": ["ADMIN", "MANAGER", "FINANCE"],
  "Properties": ["ADMIN", "MANAGER", "FINANCE"],
  "Valuation": ["FINANCE"],
  "Depreciation": ["FINANCE"],
  "Disposal": ["ADMIN", "FINANCE"],
  "Requests": ["ADMIN", "MANAGER", "FINANCE", "USER"],
};

const navigation = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Asset Register", url: "/assets", icon: Package },
  { title: "Procurement", url: "/procurement", icon: ShoppingCart },
  { title: "Commissioning", url: "/commissioning", icon: CheckSquare },
  { title: "Allocation", url: "/allocation", icon: Users },
  { title: "Operation", url: "/operation", icon: PlaySquare },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Audit", url: "/audit", icon: Search },
  { title: "IT Assets", url: "/it-assets", icon: Laptop },
  { title: "Properties", url: "/properties", icon: Building2 },
  { title: "Valuation", url: "/valuation", icon: DollarSign },
  { title: "Depreciation", url: "/depreciation", icon: TrendingDown },
  { title: "Disposal", url: "/disposal", icon: Trash2 },
  { title: "Requests", url: "/requests", icon: FileText },
];



export function AppSidebar() {
  const navigate = useNavigate();
  // Get user from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    // Listen for login changes
    const handleStorage = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const userRole = user?.role || "USER";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Filter navigation items by role
  const filteredNavigation = navigation.filter(
    (item) => ACCESS_MATRIX[item.title]?.includes(userRole)
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">AssetFlow</h2>
            <p className="text-xs text-sidebar-foreground/70">Asset Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-smooth ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/notifications"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-smooth hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-smooth hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-semibold text-primary-foreground">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : "?"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.name || "Guest"}</p>
            <p className="text-xs text-sidebar-foreground/70">{userRole}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
