import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Package,
  Check,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: string;
  imageUrl?: string;
  createdAt?: string;
  lastVerifiedDate?: string;
  location?: string;
  department?: string;
}

type ViewType = 'HOME' | 'DETAIL';

export default function AdminAssetVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pagination constants
  const ITEMS_PER_PAGE = 5;

  // State Management
  const [view, setView] = useState<ViewType>('HOME');
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch All Assets on Mount
  useEffect(() => {
    fetchAllAssets();
  }, []);

  // Fetch initial asset list
  const fetchAllAssets = async () => {
    setIsSearching(true);
    try {
      const response = await api.get(`/assets`);
      setAssets(response.data || []);
      setFilteredAssets(response.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Fetch error:', error);
      // Mock data for demo
      const mockData = [
        {
          id: '1',
          name: 'Laptop Dell XPS',
          serialNumber: 'DELL-XPS-001',
          category: 'IT Equipment',
          status: 'IN_OPERATION',
          imageUrl: 'https://images.unsplash.com/photo-1588872657840-790ff3bde7de?w=400&h=400&fit=crop',
          location: 'Building A - Floor 2',
          department: 'IT Department',
          createdAt: '2024-01-15',
          lastVerifiedDate: '2026-03-10',
        },
        {
          id: '2',
          name: 'Canon Printer',
          serialNumber: 'CANON-PRN-002',
          category: 'Office Equipment',
          status: 'IN_OPERATION',
          imageUrl: 'https://images.unsplash.com/photo-1609033227505-5876f6aa4e90?w=400&h=400&fit=crop',
          location: 'Building B - Floor 1',
          department: 'Admin',
          createdAt: '2024-02-20',
          lastVerifiedDate: '2026-02-28',
        },
        {
          id: '3',
          name: 'Office Chair (Executive)',
          serialNumber: 'CHAIR-EXC-003',
          category: 'Furniture',
          status: 'IN_OPERATION',
          location: 'Building A - Floor 3',
          department: 'Management',
          createdAt: '2024-03-01',
          lastVerifiedDate: null,
        },
        {
          id: '4',
          name: 'Monitor LG 27"',
          serialNumber: 'LG-MON-004',
          category: 'IT Equipment',
          status: 'IN_OPERATION',
          imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
          location: 'Building A - Floor 2',
          department: 'IT Department',
          createdAt: '2024-01-10',
          lastVerifiedDate: '2026-03-05',
        },
        {
          id: '5',
          name: 'Keyboard Mechanical',
          serialNumber: 'KEEB-MEC-005',
          category: 'IT Equipment',
          status: 'MAINTENANCE',
          location: 'Building B - Storage',
          department: 'IT Department',
          createdAt: '2024-02-15',
          lastVerifiedDate: null,
        },
        {
          id: '6',
          name: 'Mouse Logitech',
          serialNumber: 'MOUSE-LG-006',
          category: 'IT Equipment',
          status: 'IN_OPERATION',
          location: 'Building A - Floor 1',
          department: 'Operations',
          createdAt: '2024-02-10',
          lastVerifiedDate: '2026-02-20',
        },
      ];
      setAssets(mockData);
      setFilteredAssets(mockData);
      setCurrentPage(1);
      toast.error('Using sample data. API unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Search and Filter
  const handleSearchAndFilter = (query: string, status: string) => {
    let filtered = assets;

    // Apply search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        asset.id.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (status !== 'ALL') {
      filtered = filtered.filter(asset => asset.status === status);
    }

    setFilteredAssets(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    handleSearchAndFilter(value, filterStatus);
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    handleSearchAndFilter(searchInput, status);
  };

  // Mark Asset as Verified
  const handleVerify = async () => {
    if (!selectedAsset) return;

    setIsVerifying(true);
    try {
      const response = await api.patch(`/assets/${selectedAsset.id}/verify`, {
        remarks: `Verified by ${user?.name || 'Admin'} on ${new Date().toLocaleDateString()}`,
        condition: 'GOOD',
      });

      toast.success(`✓ "${selectedAsset.name}" verified successfully`);
      setView('HOME');
      setSelectedAsset(null);
      
      // Refresh the list to get updated verification status from backend
      setTimeout(() => {
        fetchAllAssets();
      }, 300);
    } catch (error: any) {
      toast.error('Failed to verify asset');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  // ==================== HOME VIEW ====================
  if (view === 'HOME') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-foreground">Asset Verification</h1>
              <span className="text-sm text-muted-foreground">
                Admin Verification Panel
              </span>
            </div>
            <p className="text-muted-foreground mt-2">
              Review and verify assets in your inventory
            </p>
          </div>

          {/* Search & Filter Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Search className="w-5 h-5" />
                Search & Filter Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div>
                  <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                    Search by Name, ID, or Serial
                  </Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="e.g., Laptop, DELL-001, or XPS..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="mt-2 w-full bg-background border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                    Filter by Status
                  </Label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {['ALL', 'IN_OPERATION', 'MAINTENANCE', 'COMMISSIONED', 'DISPOSAL'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          filterStatus === status
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status === 'ALL' ? 'All Assets' : status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Assets Grid with Pagination */}
          {!isSearching && filteredAssets.length > 0 && (
            <>
              {/* Pagination Info */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAssets.length)}</span> of <span className="font-semibold">{filteredAssets.length}</span> assets
                </p>
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {filteredAssets
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setView('DETAIL');
                      }}
                      className="text-left bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary transition-all group"
                    >
                      {/* Asset Image */}
                      <div className="w-full h-40 rounded-lg bg-muted overflow-hidden flex items-center justify-center mb-4 group-hover:opacity-90 transition-opacity">
                        {asset.imageUrl ? (
                          <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>

                      {/* Asset Info */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-foreground line-clamp-1">{asset.name}</h3>
                        <p className="text-xs text-muted-foreground">{asset.serialNumber}</p>

                        <div className="flex items-center gap-2 flex-wrap pt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${
                              asset.status === 'IN_OPERATION'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            }`}
                          >
                            {asset.status?.replace('_', ' ')}
                          </Badge>
                          {asset.lastVerifiedDate ? (
                            <div className="flex items-center gap-1 text-xs text-success">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-warning">
                              <Clock className="w-3 h-3" />
                              Pending
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 space-y-1">
                          {asset.location && <p>📍 {asset.location}</p>}
                          {asset.department && <p>🏢 {asset.department}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Pagination Controls */}
              {Math.ceil(filteredAssets.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(filteredAssets.length / ITEMS_PER_PAGE) }).map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-8 h-8 rounded-md text-sm font-semibold transition-colors ${
                          currentPage === index + 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(Math.ceil(filteredAssets.length / ITEMS_PER_PAGE), currentPage + 1))}
                    disabled={currentPage === Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isSearching && filteredAssets.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No assets found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Info Alert */}
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300 ml-2 text-sm">
              Click on any asset to view details and mark as verified. Pending verification shows a ⏱️ icon.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ==================== DETAIL VIEW ====================
  if (view === 'DETAIL' && selectedAsset) {
    const isAlreadyVerified = !!selectedAsset.lastVerifiedDate;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero Image Section */}
        <div className="relative h-80 bg-secondary flex items-center justify-center overflow-hidden">
          {selectedAsset.imageUrl ? (
            <>
              <img
                src={selectedAsset.imageUrl}
                alt={selectedAsset.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </>
          ) : (
            <>
              <Package className="text-muted-foreground w-24 h-24" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            </>
          )}

          {/* Back Button */}
          <button
            onClick={() => {
              setView('HOME');
              setSelectedAsset(null);
            }}
            className="absolute top-6 left-6 bg-white/10 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Asset Info Overlay */}
          <div className="absolute bottom-6 left-6 text-white max-w-[80%]">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedAsset.status === 'IN_OPERATION'
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-warning/10 text-warning border-warning/20'
                }`}
              >
                {selectedAsset.status?.replace('_', ' ')}
              </Badge>
              {isAlreadyVerified && (
                <Badge className="bg-success/10 text-success border-success/20 text-xs font-bold">
                  ✓ VERIFIED
                </Badge>
              )}
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-1">{selectedAsset.name}</h2>
            <p className="text-muted-foreground font-mono text-sm">{selectedAsset.id}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 p-6 -mt-6 bg-card rounded-t-3xl relative z-10 flex flex-col shadow-lg">
          <div className="space-y-6 mb-8">
            {/* Asset Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Serial</p>
                  <p className="font-semibold text-foreground truncate">{selectedAsset.serialNumber}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                  <p className="font-semibold text-foreground truncate">{selectedAsset.category}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                  <p className="font-semibold text-foreground truncate">{selectedAsset.location || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Department</p>
                  <p className="font-semibold text-foreground truncate">{selectedAsset.department || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Created</p>
                  <p className="font-semibold text-foreground truncate">
                    {selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card className={`${
                isAlreadyVerified 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-warning/10 border-warning/20'
              }`}>
                <CardContent className="pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {isAlreadyVerified ? 'Last Verified' : 'Verification Status'}
                  </p>
                  <p className={`font-semibold truncate ${
                    isAlreadyVerified
                      ? 'text-success'
                      : 'text-warning'
                  }`}>
                    {isAlreadyVerified 
                      ? new Date(selectedAsset.lastVerifiedDate!).toLocaleDateString()
                      : 'Not Verified'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alert if already verified */}
          {isAlreadyVerified && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300 ml-2 text-sm">
                This asset has already been verified. You can verify again to update the verification date.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {isAlreadyVerified ? 'Verify Again' : 'Mark as Verified'}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
