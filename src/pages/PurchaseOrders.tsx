import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Loader2, FileText, Search, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOrdersApi } from "@/lib/api/purchaseOrders";
import { Input } from "@/components/ui/input";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await PurchaseOrdersApi.getAll();
      setOrders(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to fetch POs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.vendor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
            <p className="text-muted-foreground">Track and manage generated procurement orders</p>
          </div>
          <Button onClick={() => navigate("/procurement")} variant="outline">
             View All Procurements
          </Button>
        </div>

        <div className="flex items-center space-x-2 bg-background p-2 rounded-lg border shadow-sm w-full max-w-md">
          <Search className="h-5 w-5 text-muted-foreground ml-2" />
          <Input 
            placeholder="Search by PO number or Vendor..." 
            className="border-0 shadow-none focus-visible:ring-0 px-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((po) => (
              <Card key={po.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-slate-50 border-b relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-transparent rounded-bl-full opacity-50"></div>
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <CardTitle className="text-lg font-bold text-indigo-900">{po.poNumber}</CardTitle>
                      <p className="text-sm text-slate-500 font-medium">{new Date(po.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={po.status === 'ISSUED' ? 'default' : 'secondary'} className="bg-indigo-600 text-white hover:bg-indigo-700">
                      {po.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="font-semibold text-right max-w-[60%] truncate" title={po.vendor?.name}>{po.vendor?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span className="font-medium text-slate-700">{new Date(po.expectedDelivery).toLocaleDateString()}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Total Amount:</span>
                    <span className="text-lg font-bold text-emerald-600">₹{po.approvedAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-3 flex gap-2">
                  <Button variant="ghost" className="w-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800" onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filteredOrders.length === 0 && (
              <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500">No purchase orders found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}