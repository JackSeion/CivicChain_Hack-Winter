 import { Card } from "./ui/card";
import { Brain } from "lucide-react";
import { Button } from "./ui/button";

interface AIInsightsPageProps {
  municipalId: string;
}

export function AIInsightsPage({ municipalId }: AIInsightsPageProps) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1>AI Intelligence Center</h1>
        </div>
        <p className="text-gray-600">Advanced AI-powered insights and predictions</p>
      </div>

      <Card className="p-12 text-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Coming Soon</h2>
        
        
      </Card>
    </div>
  );
}
