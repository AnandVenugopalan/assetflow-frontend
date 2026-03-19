import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import jsQR from "jsqr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  Camera,
  Info,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

export default function ScanQR() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanMode, setScanMode] = useState<"camera" | "upload">("camera");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Handle QR scan result
  const handleScan = async (data: any) => {
    if (data && isScanning) {
      const scannedQRCode = data.text || data;
      
      // Stop scanning temporarily to prevent multiple scans
      setIsScanning(false);
      setScanResult(scannedQRCode);
      
      // Fetch asset details using the QR code
      await fetchAssetDetails(scannedQRCode);
    }
  };

  // Handle scan error
  const handleError = (err: any) => {
    setCameraError("Unable to access camera. Please ensure camera permissions are granted.");
  };

  // Fetch asset details by QR code
  const fetchAssetDetails = async (qrCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/assets/qr/${qrCode}`);
      setAssetData(response.data);
      toast.success("Asset details loaded successfully!");
    } catch (err: any) {
      // If asset not found (404), offer to create new asset
      if (err.response?.status === 404) {
        setError(`Asset not found. You can create a new asset with this QR code.`);
      } else {
        const errorMsg = err.response?.data?.message || "Asset not found. Please try scanning again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
      
      setAssetData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setScanResult(null);
    setAssetData(null);
    setError(null);
    setIsScanning(true);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsScanning(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);
      
      // Create an image element to decode the QR code
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (!context) {
          toast.error("Failed to process image");
          setIsLoading(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          const scannedQRCode = code.data;
          setScanResult(scannedQRCode);
          
          // Fetch asset details using the scanned QR code
          fetchAssetDetails(scannedQRCode);
        } else {
          setIsLoading(false);
          setError("No QR code found in the image. Please try another image.");
          toast.error("No QR code detected in the uploaded image");
        }
      };

      img.onerror = () => {
        setIsLoading(false);
        toast.error("Failed to load image");
      };

      img.src = imageData;
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast.error("Failed to read file");
    };

    reader.readAsDataURL(file);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Navigate to full asset details
  const viewFullDetails = () => {
    if (assetData?.id) {
      navigate(`/assets/${assetData.id}`);
    }
  };

  // Navigate to asset register with search for scanned asset
  const goToAssetRegister = () => {
    if (assetData?.id) {
      navigate(`/assets?search=${assetData.id}`);
    }
  };

  // Create new asset with scanned QR code
  const createNewAssetWithQR = () => {
    if (scanResult) {
      navigate("/assets/add", { state: { qrCode: scanResult } });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      IN_USE: "bg-blue-100 text-blue-800 border-blue-200",
      MAINTENANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      RETIRED: "bg-gray-100 text-gray-800 border-gray-200",
      AVAILABLE: "bg-cyan-100 text-cyan-800 border-cyan-200",
      DISPOSED: "bg-red-100 text-red-800 border-red-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">QR Code Scanner</h1>
          <p className="text-muted-foreground">Scan asset QR codes to view details</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scanner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Scan or upload a QR code to view asset details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="camera" className="space-y-4" onValueChange={(value) => setScanMode(value as "camera" | "upload")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              {/* Camera Tab */}
              <TabsContent value="camera" className="space-y-4">
                {isScanning && scanMode === "camera" ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
                      <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: "100%", height: "100%" }}
                        constraints={{
                          video: { facingMode: "environment" }
                        }}
                      />
                      
                      {/* Scanner overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-4 border-white/50 rounded-lg">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>

                    {cameraError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{cameraError}</AlertDescription>
                      </Alert>
                    )}

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Align the QR code within the frame. The scan will happen automatically.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      {isLoading ? (
                        <div className="text-center space-y-2">
                          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Loading asset details...</p>
                        </div>
                      ) : assetData ? (
                        <div className="text-center space-y-2">
                          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                          <p className="text-lg font-semibold">Asset Scanned Successfully!</p>
                        </div>
                      ) : error ? (
                        <div className="text-center space-y-2">
                          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                          <p className="text-lg font-semibold">Scan Failed</p>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      onClick={resetScanner}
                      className="w-full"
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Scan Another QR Code
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-4">
                {!scanResult && scanMode === "upload" ? (
                  <div className="space-y-4">
                    <div 
                      className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Upload QR Code Image</p>
                      <p className="text-sm text-muted-foreground mb-4">Click to browse or drag and drop</p>
                      <Button variant="outline" size="sm">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Upload an image containing a QR code from your device gallery or files.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedImage && (
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {isLoading && (
                      <div className="text-center py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Processing image...</p>
                      </div>
                    )}

                    {assetData && !isLoading && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          QR code detected and asset loaded successfully!
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && !isLoading && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={resetScanner}
                      className="w-full"
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Upload Another Image
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Asset Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
            <CardDescription>
              Details of the scanned asset will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult && !assetData && (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No asset scanned yet. Use the camera or upload an image with a QR code to begin.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Fetching asset information...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                {scanResult && (
                  <Button
                    onClick={createNewAssetWithQR}
                    className="w-full"
                  >
                    Create Asset with This QR
                  </Button>
                )}
              </div>
            )}

            {assetData && !isLoading && (
              <div className="space-y-6">
                {/* Asset Header */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{assetData.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(assetData.status)}>
                      {assetData.status}
                    </Badge>
                    {assetData.category && (
                      <Badge variant="outline">{assetData.category}</Badge>
                    )}
                  </div>
                </div>

                {/* Asset Information */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Asset ID</p>
                      <p className="font-medium">{assetData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="font-medium">{assetData.serialNumber || "N/A"}</p>
                    </div>
                  </div>

                  {assetData.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{assetData.location}</p>
                    </div>
                  )}

                  {assetData.purchaseDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">
                        {new Date(assetData.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {assetData.purchasePrice && (
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Price</p>
                      <p className="font-medium">
                        ${Number(assetData.purchasePrice).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {assetData.assignedTo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{assetData.assignedTo}</p>
                    </div>
                  )}

                  {assetData.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium text-sm">{assetData.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    onClick={viewFullDetails}
                    className="w-full"
                  >
                    View Full Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    onClick={goToAssetRegister}
                    variant="secondary"
                    className="w-full"
                  >
                    Go to Asset Register
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    onClick={resetScanner}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Scan Another Asset
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera Scanning
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Select the "Camera" tab</li>
                <li>Grant camera permissions when prompted</li>
                <li>Position the QR code within the camera frame</li>
                <li>The scanner will automatically detect the code</li>
                <li>View asset details instantly</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Image Upload
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Select the "Upload" tab</li>
                <li>Click to browse or drag an image</li>
                <li>Choose an image containing a QR code</li>
                <li>The system will automatically decode it</li>
                <li>Asset details will be displayed</li>
              </ol>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Click "View Full Details" to see complete asset information, or scan/upload another QR code to check different assets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
