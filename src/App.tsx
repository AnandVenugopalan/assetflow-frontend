import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import OAuthCallback from "./pages/OAuthCallback";
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
import ScanQR from "./pages/ScanQR";
import AdminGenerateQR from "./pages/AdminGenerateQR";
import AdminAssetVerification from "./pages/StaffVerification";
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
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              
              <Route path="/assets" element={<ProtectedRoute><AppLayout><Assets /></AppLayout></ProtectedRoute>} />
              <Route path="/assets/add" element={<ProtectedRoute><AppLayout><AddAsset /></AppLayout></ProtectedRoute>} />
              <Route path="/assets/:id" element={<ProtectedRoute><AppLayout><AssetDetail /></AppLayout></ProtectedRoute>} />
              <Route path="/scan-qr" element={<ProtectedRoute><AppLayout><ScanQR /></AppLayout></ProtectedRoute>} />
              <Route path="/qr-codes/generate" element={<ProtectedRoute><AppLayout><AdminGenerateQR /></AppLayout></ProtectedRoute>} />
              <Route path="/assets/verify" element={<ProtectedRoute><AppLayout><AdminAssetVerification /></AppLayout></ProtectedRoute>} />
              <Route path="/procurement" element={<ProtectedRoute><AppLayout><Procurement /></AppLayout></ProtectedRoute>} />
              <Route path="/procurement/add" element={<ProtectedRoute><AppLayout><AddProcurement /></AppLayout></ProtectedRoute>} />
              <Route path="/procurement/requests/:id" element={<ProtectedRoute><AppLayout><ViewProcurementRequest /></AppLayout></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><AppLayout><Maintenance /></AppLayout></ProtectedRoute>} />
              <Route path="/maintenance/new" element={<ProtectedRoute><AppLayout><NewMaintenance /></AppLayout></ProtectedRoute>} />
              <Route path="/allocation" element={<ProtectedRoute><AppLayout><Allocation /></AppLayout></ProtectedRoute>} />
              <Route path="/allocation/new" element={<ProtectedRoute><AppLayout><NewAllocation /></AppLayout></ProtectedRoute>} />
              <Route path="/allocation/transfer" element={<ProtectedRoute><AppLayout><TransferAsset /></AppLayout></ProtectedRoute>} />
              <Route path="/my-assets" element={<ProtectedRoute><AppLayout><MyAssets /></AppLayout></ProtectedRoute>} />
              <Route path="/it-assets" element={<ProtectedRoute><AppLayout><ITAssets /></AppLayout></ProtectedRoute>} />
              <Route path="/it-assets/add" element={<ProtectedRoute><AppLayout><AddITAsset /></AppLayout></ProtectedRoute>} />
              <Route path="/properties" element={<ProtectedRoute><AppLayout><Properties /></AppLayout></ProtectedRoute>} />
              <Route path="/properties/add" element={<ProtectedRoute><AppLayout><AddProperty /></AppLayout></ProtectedRoute>} />
              <Route path="/commissioning" element={<ProtectedRoute><AppLayout><Commissioning /></AppLayout></ProtectedRoute>} />
              <Route path="/operation" element={<ProtectedRoute><AppLayout><Operation /></AppLayout></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute><AppLayout><Audit /></AppLayout></ProtectedRoute>} />
              <Route path="/valuation" element={<ProtectedRoute><AppLayout><Valuation /></AppLayout></ProtectedRoute>} />
              <Route path="/depreciation" element={<ProtectedRoute><AppLayout><Depreciation /></AppLayout></ProtectedRoute>} />
              <Route path="/disposal" element={<ProtectedRoute><AppLayout><Disposal /></AppLayout></ProtectedRoute>} />
              <Route path="/disposal/new" element={<ProtectedRoute><AppLayout><NewDisposalRequest /></AppLayout></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><AppLayout><Requests /></AppLayout></ProtectedRoute>} />
              <Route path="/requests/new" element={<ProtectedRoute><AppLayout><NewRequest /></AppLayout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><AppLayout><div className="flex h-96 items-center justify-center"><p className="text-xl text-muted-foreground">Notifications Module - Coming Soon</p></div></AppLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppLayout><div className="flex h-96 items-center justify-center"><p className="text-xl text-muted-foreground">Settings Module - Coming Soon</p></div></AppLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
