import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

// Mock assets with status = "In-use" or "Maintenance Done"
const auditableAssets = [
  { id: "Laptop-104", name: "Laptop-104" },
  { id: "Chair-22", name: "Chair-22" },
  { id: "Printer-7", name: "Printer-7" },
];

const conditions = ["Good", "Moderate", "Damaged"];
const verificationStatuses = ["Verified", "Not Found", "Moved"];

export default function Audit() {
  const [asset, setAsset] = useState("");
  const [condition, setCondition] = useState("");
  const [verification, setVerification] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call API to record audit
    alert(`Audit recorded for ${asset}: Condition=${condition}, Verification=${verification}, Remarks=${remarks}`);
    // Reset form
    setAsset("");
    setCondition("");
    setVerification("");
    setRemarks("");
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Asset Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Select Asset</label>
              <select
                className="w-full rounded border px-2 py-2 text-sm"
                value={asset}
                onChange={e => setAsset(e.target.value)}
                required
              >
                <option value="" disabled>Select asset...</option>
                {auditableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Physical Condition</label>
              <select
                className="w-full rounded border px-2 py-2 text-sm"
                value={condition}
                onChange={e => setCondition(e.target.value)}
                required
              >
                <option value="" disabled>Select condition...</option>
                {conditions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verification Status</label>
              <select
                className="w-full rounded border px-2 py-2 text-sm"
                value={verification}
                onChange={e => setVerification(e.target.value)}
                required
              >
                <option value="" disabled>Select status...</option>
                {verificationStatuses.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <Textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter remarks"
                rows={3}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" className="gradient-primary">Record Audit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
