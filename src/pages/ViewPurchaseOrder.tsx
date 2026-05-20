import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2, Printer, Building2, Calendar, FileText, CheckCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOrdersApi } from "@/lib/api/purchaseOrders";

export default function ViewPurchaseOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true);
        const data = await PurchaseOrdersApi.getOne(id!);
        setPo(data);
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to load Purchase Order" });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPO();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!po) return null;

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Screen Only Header - Hidden during print */}
        <div className="flex items-center justify-between print:hidden mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/purchase-orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Purchase Order</h2>
              <p className="text-muted-foreground">{po.poNumber}</p>
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>

        {/* Printable PO Area */}
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border print:shadow-none print:border-none print:p-0 print:m-0">
          
          {/* PO Header */}
          <div className="flex justify-between items-start border-b pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">PURCHASE ORDER</h1>
              <p className="text-slate-500 mt-2">AssetNexus Enterprise</p>
              <p className="text-slate-500">123 Business Tower, Tech Park</p>
              <p className="text-slate-500">contact@assetnexus.com</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-700">{po.poNumber}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm">
                <span className="text-slate-500 font-medium">PO Date:</span>
                <span className="text-slate-800 font-semibold">{new Date(po.date).toLocaleDateString()}</span>
                <span className="text-slate-500 font-medium">Requested By:</span>
                <span className="text-slate-800 font-semibold">{po.procurementRequest?.department || 'Internal'}</span>
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="text-emerald-600 font-bold">{po.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10">
            {/* Vendor Details */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Vendor / Supplier</h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 h-full">
                <h4 className="text-lg font-bold text-slate-800 mb-1">{po.vendor?.name}</h4>
                {po.vendor?.address && <p className="text-slate-600 text-sm mb-1">{po.vendor.address}</p>}
                {po.vendor?.contactPerson && <p className="text-slate-600 text-sm">Attn: {po.vendor.contactPerson}</p>}
                {po.vendor?.email && <p className="text-slate-600 text-sm">{po.vendor.email}</p>}
                {po.vendor?.phone && <p className="text-slate-600 text-sm">{po.vendor.phone}</p>}
                {po.vendor?.gstNumber && <p className="text-slate-600 text-sm font-medium mt-2">GSTIN: {po.vendor.gstNumber}</p>}
              </div>
            </div>

            {/* Shipping Details */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Shipping/Delivery Terms</h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 h-full">
                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Ship To:</span>
                  <span className="text-slate-800">AssetNexus HQ Store</span>
                  <span className="text-slate-500 font-medium">Delivery Date:</span>
                  <span className="text-slate-800 font-semibold">{new Date(po.expectedDelivery).toLocaleDateString()}</span>
                  <span className="text-slate-500 font-medium">Payment Terms:</span>
                  <span className="text-slate-800">{po.paymentTerms || 'Net 30 Days'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {/* Since in our schema PO ties to exactly 1 ProcurementRequest, we display that as a single line item for now */}
                  <tr>
                    <td className="p-4 text-center text-slate-400">1</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{po.procurementRequest?.itemName || 'Requested Item'}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{po.procurementRequest?.technicalSpecs || po.procurementRequest?.justification}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                        {po.procurementRequest?.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium">{po.procurementRequest?.quantity || 1}</td>
                    <td className="p-4 text-right font-bold text-slate-800">₹{po.approvedAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-8 items-end">
            <div>
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Terms & Conditions</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  1. Please supply items strictly as per specifications.<br/>
                  2. Mention PO Number on all invoices and packages.<br/>
                  3. Delivery subject to quality inspection upon arrival.
                </p>
              </div>
              <div className="border-t border-slate-300 w-64 pt-2">
                <p className="text-sm font-bold text-slate-700 text-center">Authorized Signatory</p>
                <p className="text-xs text-slate-500 text-center uppercase tracking-wider mt-1">Finance / Procurement Head</p>
              </div>
            </div>
            
            <div className="bg-slate-800 text-white rounded-lg p-6 flex justify-between items-center shadow-md">
              <div>
                <span className="text-slate-400 text-sm uppercase tracking-wider font-bold block mb-1">Grand Total</span>
                <span className="text-xs text-slate-300">(All taxes included as applicable)</span>
              </div>
              <div className="text-3xl font-bold">
                ₹{po.approvedAmount.toLocaleString()}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:hidden {
              display: none !important;
            }
            .max-w-4xl, .max-w-4xl * {
              visibility: visible;
            }
            .max-w-4xl {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page { margin: 1cm; size: A4; }
          }
        `}
      </style>
    </AppLayout>
  );
}