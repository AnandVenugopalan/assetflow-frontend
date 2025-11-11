import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
export default function Valuation() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Valuation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Asset valuation details and calculations will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
