import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProcurementApi } from "@/lib/api/procurement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Defined columns matching enum plus a combined 'COMPLETED' state
const KANBAN_COLUMNS = [
  { id: 'DRAFT', title: 'Draft', color: 'bg-gray-100' },
  { id: 'SUBMITTED', title: 'Submitted', color: 'bg-blue-100' },
  { id: 'UNDER_REVIEW', title: 'In Review', color: 'bg-yellow-100' },
  { id: 'CLARIFICATION_REQUESTED', title: 'Need Info', color: 'bg-red-100' },
  { id: 'PENDING_FINANCE_APPROVAL', title: 'Finance Approval', color: 'bg-orange-100' },
  { id: 'FINANCE_APPROVED', title: 'Finance Approved', color: 'bg-emerald-100' },
  { id: 'PO_GENERATED', title: 'PO Generated', color: 'bg-indigo-100' },
  { id: 'ORDERED', title: 'Ordered', color: 'bg-purple-100' },
  { id: 'DELIVERED', title: 'Completed', color: 'bg-green-100' }
];

export default function Procurement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await ProcurementApi.getAll();
      setRequests(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to fetch requests" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getRequestsForColumn = (status: string) => {
    if (status === 'DELIVERED') {
      return requests.filter(r => r.status === 'DELIVERED' || r.status === 'COMPLETED');
    }
    return requests.filter(r => r.status === status);
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Procurement Dashboard</h2>
            <p className="text-muted-foreground">Manage and track procurement requests</p>
          </div>
          <Button onClick={() => navigate("/procurement/add")} className="gap-2">
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>

        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="kanban" className="space-y-4">
            <TabsList>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kanban" className="m-0">
              <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                {KANBAN_COLUMNS.map(col => {
                  const columnItems = getRequestsForColumn(col.id);
                  return (
                    <div key={col.id} className={`flex-shrink-0 w-80 rounded-lg p-3 flex flex-col ${col.color}`}>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-semibold text-sm uppercase text-gray-700">{col.title}</h3>
                        <Badge variant="secondary" className="bg-white/50">{columnItems.length}</Badge>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {columnItems.map(req => (
                          <Card 
                            key={req.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/procurement/requests/${req.id}`)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-medium leading-none">{req.itemName}</CardTitle>
                                <span className="text-xs text-muted-foreground">#{req.id.slice(0,6)}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                              <p>Qty: {req.quantity}</p>
                              <p>Dept: {req.department}</p>
                            </CardContent>
                          </Card>
                        ))}
                        {columnItems.length === 0 && (
                          <div className="h-20 flex items-center justify-center text-sm text-gray-500 italic border-2 border-dashed border-gray-300 rounded-lg">
                            No requests
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="m-0">
               {/* Simplified list view fallback if they dont want Kanban */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {requests.map((request) => (
                   <Card key={request.id} className="hover:shadow-md transition-shadow">
                     <CardHeader className="pb-2">
                       <div className="flex items-center justify-between">
                         <CardTitle className="text-xl">{request.itemName}</CardTitle>
                         <Badge>{request.status}</Badge>
                       </div>
                     </CardHeader>
                     <CardContent className="pb-2">
                       <p className="text-sm text-muted-foreground mb-4">{request.requestTitle}</p>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         <div><span className="font-medium">Qty:</span> {request.quantity}</div>
                         <div><span className="font-medium">Dept:</span> {request.department}</div>
                       </div>
                     </CardContent>
                     <CardFooter>
                       <Button variant="outline" className="w-full gap-2" onClick={() => navigate(`/procurement/requests/${request.id}`)}>
                         <Eye className="h-4 w-4" /> View Details
                       </Button>
                     </CardFooter>
                   </Card>
                 ))}
               </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}