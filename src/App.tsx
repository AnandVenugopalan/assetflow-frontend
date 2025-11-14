import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Procurement from "./pages/Procurement";
import Maintenance from "./pages/Maintenance";
import NewMaintenance from "./pages/NewMaintenance";
import ITAssets from "./pages/ITAssets";
import Properties from "./pages/Properties";
import Depreciation from "./pages/Depreciation";
import Commissioning from "./pages/Commissioning";
import Operation from "./pages/Operation";
import Audit from "./pages/Audit";
import Valuation from "./pages/Valuation";
import Disposal from "./pages/Disposal";
import Requests from "./pages/Requests";
import NewRequest from "./pages/NewRequest";
import Allocation from "./pages/Allocation";
import Login from "./pages/Login";
import AddAsset from "./pages/AddAsset";
import AssetDetail from "./pages/AssetDetail";
import AddITAsset from "./pages/AddITAsset";
import AddProperty from "./pages/AddProperty";
import NewDisposalRequest from "./pages/NewDisposalRequest";
import NewAllocation from "./pages/NewAllocation";
import TransferAsset from "./pages/TransferAsset";
import AddProcurement from "./pages/AddProcurement";
import ViewProcurementRequest from "./pages/ViewProcurementRequest";
import MyAssets from "./pages/MyAssets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/assets" element={<AppLayout><Assets /></AppLayout>} />
              <Route path="/assets/add" element={<AppLayout><AddAsset /></AppLayout>} />
              <Route path="/assets/:id" element={<AppLayout><AssetDetail /></AppLayout>} />
              <Route path="/procurement" element={<AppLayout><Procurement /></AppLayout>} />
              <Route path="/procurement/add" element={<AppLayout><AddProcurement /></AppLayout>} />
              <Route path="/procurement/requests/:id" element={<AppLayout><ViewProcurementRequest /></AppLayout>} />
              <Route path="/maintenance" element={<AppLayout><Maintenance /></AppLayout>} />
              <Route path="/maintenance/new" element={<AppLayout><NewMaintenance /></AppLayout>} />
              <Route path="/allocation" element={<AppLayout><Allocation /></AppLayout>} />
              <Route path="/allocation/new" element={<AppLayout><NewAllocation /></AppLayout>} />
              <Route path="/allocation/transfer" element={<AppLayout><TransferAsset /></AppLayout>} />
              <Route path="/my-assets" element={<AppLayout><MyAssets /></AppLayout>} />
              <Route path="/it-assets" element={<AppLayout><ITAssets /></AppLayout>} />
              <Route path="/it-assets/add" element={<AppLayout><AddITAsset /></AppLayout>} />
              <Route path="/properties" element={<AppLayout><Properties /></AppLayout>} />
              <Route path="/properties/add" element={<AppLayout><AddProperty /></AppLayout>} />
              <Route path="/commissioning" element={<AppLayout><Commissioning /></AppLayout>} />
              <Route path="/operation" element={<AppLayout><Operation /></AppLayout>} />
              <Route path="/audit" element={<AppLayout><Audit /></AppLayout>} />
              <Route path="/valuation" element={<AppLayout><Valuation /></AppLayout>} />
              <Route path="/depreciation" element={<AppLayout><Depreciation /></AppLayout>} />
              <Route path="/disposal" element={<AppLayout><Disposal /></AppLayout>} />
              <Route path="/disposal/new" element={<AppLayout><NewDisposalRequest /></AppLayout>} />
              <Route path="/requests" element={<AppLayout><Requests /></AppLayout>} />
              <Route path="/requests/new" element={<AppLayout><NewRequest /></AppLayout>} />
              <Route path="/notifications" element={<AppLayout><div className="flex h-96 items-center justify-center"><p className="text-xl text-muted-foreground">Notifications Module - Coming Soon</p></div></AppLayout>} />
              <Route path="/settings" element={<AppLayout><div className="flex h-96 items-center justify-center"><p className="text-xl text-muted-foreground">Settings Module - Coming Soon</p></div></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
