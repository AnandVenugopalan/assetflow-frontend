import React, { useState, useEffect } from 'react';
import { QrCode, Download, Loader2, ArrowLeft, Eye, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface Batch {
  id: string;
  batchNumber: number;
  startNumber: string;
  endNumber: string;
  quantity: number;
  createdAt: string;
  generatedBy?: string;
  isActive: boolean;
}

export default function AdminGenerateQR() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoadingBatches(true);
    try {
      const response = await api.get('/assets/qr-codes/batches');
      setBatches(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      // Not critical - show silent fail
      toast.error('Could not load batch history');
      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const isValidQuantity = quantity >= 1 && quantity <= 100;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidQuantity) {
      setError("Please enter a number between 1 and 100.");
      toast.error("Invalid quantity. Must be between 1 and 100.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Call backend API to generate and get PDF
      const response = await api.post(
        '/assets/qr-codes/generate',
        { quantity },
        {
          responseType: 'blob', // Important: get binary response
        }
      );

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ?.split('filename="')[1]
        ?.split('"')[0] 
        || `qr-codes-batch-${Date.now()}.pdf`;

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success feedback
      toast.success(`✓ ${quantity} QR Codes generated and downloaded successfully!`);
      
      // Reset form
      setQuantity(1);
      
      // Refresh batch list
      await fetchBatches();

    } catch (error: any) {
      console.error("Generation failed:", error);
      
      // Determine error message
      let errorMsg = 'Failed to generate QR codes';
      
      if (error?.response?.status === 400) {
        errorMsg = error?.response?.data?.message || 'Quantity must be between 1 and 100';
      } else if (error?.response?.status === 401) {
        errorMsg = 'You are not authorized. Please login again.';
      } else if (error?.response?.status === 403) {
        errorMsg = "You don't have permission. Admin role required.";
      } else if (error?.response?.status === 500) {
        errorMsg = 'Server error. Please contact support.';
      } else if (error.message === 'Network Error') {
        errorMsg = 'Connection failed. Please try again.';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRedownloadBatch = async (batch: Batch) => {
    try {
      const response = await api.get(
        `/assets/qr-codes/batches/${batch.id}/download`,
        { responseType: 'blob' }
      );

      const filename = `qr-codes-batch-${batch.batchNumber}.pdf`;
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Download failed:', err);
      toast.error('Failed to download batch. Please try again.');
    }
  };

  const formatNumber = (num: string | number) => {
    return String(num).padStart(6, '0');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generate QR Codes</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Create bulk QR codes for asset stickers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card - Left Side */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  QR Code Batch Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Input Field */}
                  <div className="space-y-3">
                    <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Number of QR Codes
                    </Label>
                    <Input 
                      id="quantity"
                      type="number" 
                      min="1" 
                      max="100" 
                      value={quantity} 
                      onChange={(e) => {
                        setQuantity(parseInt(e.target.value) || 1);
                        setError(null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="Enter number between 1 and 100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter a value between 1 and 100 codes per batch.
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Info Alert */}
                  <Alert className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                    <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <AlertDescription className="text-indigo-700 dark:text-indigo-300 ml-2 text-xs">
                      <strong>How it works:</strong> Generate a PDF with unique QR stickers, print them, and apply to physical assets.
                    </AlertDescription>
                  </Alert>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isGenerating || !isValidQuantity}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white py-6 text-base font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        Generate & Download PDF
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info Section */}
            <Card className="mt-6 bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">📋</span>
                    Batch Details
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li>• <strong>Grid Layout:</strong> 3 columns per page</li>
                    <li>• <strong>Size Per Code:</strong> 55mm × 65mm</li>
                    <li>• <strong>Auto-pagination:</strong> Multiple pages if needed</li>
                    <li>• <strong>Format:</strong> High-quality PDF</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch History - Right Side */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 dark:text-white">Batch History</CardTitle>
                  <button
                    onClick={fetchBatches}
                    disabled={isLoadingBatches}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RotateCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${isLoadingBatches ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingBatches ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : batches.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableHead className="text-slate-700 dark:text-slate-300">Batch #</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300">Range</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300 text-center">Qty</TableHead>
                          <TableHead className="text-slate-700 dark:text-slate-300">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batches.map((batch) => (
                          <TableRow key={batch.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <TableCell className="font-semibold text-slate-900 dark:text-white">
                              #{batch.batchNumber}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                              {formatNumber(batch.startNumber)} - {formatNumber(batch.endNumber)}
                            </TableCell>
                            <TableCell className="text-center text-slate-900 dark:text-white font-semibold">
                              {batch.quantity}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(batch.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-slate-600 dark:text-slate-400">No batches generated yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Generate your first batch to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
