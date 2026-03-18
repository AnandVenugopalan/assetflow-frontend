import React, { useState } from 'react';
import { QrCode, Download, Loader2, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

export default function AdminGenerateQR() {
  const navigate = useNavigate();
  const [count, setCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (count < 1 || count > 100) {
      toast.error("Please enter a number between 1 and 100.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call backend API to generate QR codes
      const response = await api.post('/qr-codes/generate', { count });
      const qrCodes = response.data.qrCodes || [];
      
      if (!qrCodes || qrCodes.length === 0) {
        throw new Error('No QR codes received from backend');
      }
      
      // Generate PDF with QR codes
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      doc.setFontSize(16);
      doc.text("AMS – Unassigned QR Codes", 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

      const cols = 3;
      const startX = 20;
      const startY = 35;
      const cellWidth = 55;
      const cellHeight = 65;
      const marginX = 5;
      const marginY = 5;

      let col = 0;
      let row = 0;

      for (const qrCode of qrCodes) {
        const x = startX + col * (cellWidth + marginX);
        const y = startY + row * (cellHeight + marginY);

        // Draw Border for sticker
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, cellWidth, cellHeight);

        // Generate QR Data URL
        const qrUrl = await QRCode.toDataURL(qrCode.code, {
          width: 300,
          margin: 1,
          type: 'image/png',
          errorCorrectionLevel: 'H'
        });
        doc.addImage(qrUrl, 'PNG', x + 7.5, y + 5, 40, 40);

        // Display QR Code ID
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${qrCode.code}`, x + cellWidth/2, y + 50, { align: 'center' });

        col++;
        if (col >= cols) {
          col = 0;
          row++;
          if (startY + (row + 1) * (cellHeight + marginY) > 270) {
            doc.addPage();
            row = 0;
          }
        }
      }

      doc.save(`AMS_QR_Batch_${Date.now()}.pdf`);
      toast.success(`${qrCodes.length} QR Codes generated and downloaded successfully.`);
      setCount(1);

    } catch (error: any) {
      console.error("Generation failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      toast.error(`Failed to generate QR codes: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
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

        {/* Main Card */}
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
                <Label htmlFor="count" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Number of QR Codes
                </Label>
                <Input 
                  id="count"
                  type="number" 
                  min="1" 
                  max="100" 
                  value={count} 
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="Enter number between 1 and 100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter a value between 1 and 100 codes per batch.
                </p>
              </div>

              {/* Info Alert */}
              <Alert className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <AlertDescription className="text-indigo-700 dark:text-indigo-300 ml-2 text-sm">
                  <strong>How it works:</strong> Generate a PDF with unique QR stickers, print them, and apply to physical assets. Staff can then scan them to register asset details.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white py-6 text-base font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>• <strong>Grid Layout:</strong> 3 columns per page for optimal printing</li>
                <li>• <strong>Size Per Code:</strong> 55mm × 65mm with borders</li>
                <li>• <strong>Auto-pagination:</strong> New page added automatically when needed</li>
                <li>• <strong>Format:</strong> PDF file with high-quality QR codes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
