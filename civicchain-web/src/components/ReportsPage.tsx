import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Download, FileText, Calendar, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { categories } from "../data/dummyData";
import { 
  generateDailySummaryPDF, 
  generateMonthlyAnalyticsPDF, 
  generateCategoryReportPDF,
  generateWeeklyPerformancePDF 
} from "../utils/pdfGenerator";
import { toast } from "sonner@2.0.3";

interface Complaint {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  votes: number;
  submittedDate: string;
  status: 'pending' | 'verified' | 'resolved';
  photo: string;
  resolutionImage?: string;
  resolvedDate?: string;
}

interface ReportsPageProps {
  complaints: Complaint[];
  loading?: boolean;
  municipalName?: string;
}

export function ReportsPage({ complaints, loading, municipalName = 'Municipal Corporation' }: ReportsPageProps) {
  const handleDownloadReport = (reportId: string) => {
    try {
      switch (reportId) {
        case 'daily':
          generateDailySummaryPDF(complaints, municipalName);
          toast.success('Daily Summary Report downloaded successfully!');
          break;
        case 'weekly':
          generateWeeklyPerformancePDF(complaints, municipalName);
          toast.success('Weekly Performance Report downloaded successfully!');
          break;
        case 'monthly':
          generateMonthlyAnalyticsPDF(complaints, municipalName);
          toast.success('Monthly Analytics Report downloaded successfully!');
          break;
        case 'category':
          generateDailySummaryPDF(complaints, municipalName);
          toast.success('Category-wise Report downloaded successfully!');
          break;
        default:
          toast.error('Unknown report type');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  const handleDownloadCategoryReport = (categoryId: string, categoryName: string) => {
    try {
      const categoryComplaints = complaints.filter(c => c.category === categoryId);
      generateCategoryReportPDF(categoryComplaints, categoryName, municipalName);
      toast.success(`${categoryName} report downloaded successfully!`);
    } catch (error) {
      console.error('Error generating category PDF:', error);
      toast.error('Failed to generate category report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports data...</p>
        </div>
      </div>
    );
  }

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const verifiedCount = complaints.filter(c => c.status === 'verified').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalCount = complaints.length;

  const reportTypes = [
    {
      id: 'daily',
      title: 'Daily Summary Report',
      description: 'Complete overview of today\'s complaint activities',
      icon: Calendar,
      color: 'blue',
      format: 'PDF',
    },
    {
      id: 'weekly',
      title: 'Weekly Performance Report',
      description: 'Department-wise performance metrics for the week',
      icon: TrendingUp,
      color: 'green',
      format: 'Excel',
    },
    {
      id: 'monthly',
      title: 'Monthly Analytics Report',
      description: 'Comprehensive monthly trends and insights',
      icon: BarChart3,
      color: 'purple',
      format: 'PDF',
    },
    {
      id: 'category',
      title: 'Category-wise Report',
      description: 'Detailed breakdown by complaint categories',
      icon: FileText,
      color: 'amber',
      format: 'Excel',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Reports & Export</h1>
        <p className="text-gray-600">Generate and download detailed complaint reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">{totalCount}</div>
          <p className="text-sm text-gray-600">Total Complaints</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl text-amber-600 mb-2">{pendingCount}</div>
          <p className="text-sm text-gray-600">Pending</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl text-blue-600 mb-2">{verifiedCount}</div>
          <p className="text-sm text-gray-600">In Progress</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl text-green-600 mb-2">{resolvedCount}</div>
          <p className="text-sm text-gray-600">Resolved</p>
        </Card>
      </div>

      {/* Report Templates */}
      <div className="mb-8">
        <h2 className="mb-6">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const colorClasses = {
              blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
              green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-800' },
              purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
              amber: { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' },
            };
            const colors = colorClasses[report.color as keyof typeof colorClasses];

            return (
              <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3>{report.title}</h3>
                      <Badge className={colors.badge}>{report.format}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download {report.format}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h2 className="mb-6">Category-wise Breakdown</h2>
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryComplaints = complaints.filter(c => c.category === category.id);
            const categoryPending = categoryComplaints.filter(c => c.status === 'pending').length;
            const categoryResolved = categoryComplaints.filter(c => c.status === 'resolved').length;
            const categoryTotal = categoryComplaints.length;
            const resolutionRate = categoryTotal > 0 ? Math.round((categoryResolved / categoryTotal) * 100) : 0;

            return (
              <div key={category.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-3xl">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3>{category.name}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Total: <span className="font-semibold">{categoryTotal}</span></span>
                      <span className="text-amber-600">Pending: <span className="font-semibold">{categoryPending}</span></span>
                      <span className="text-green-600">Resolved: <span className="font-semibold">{categoryResolved}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ width: `${resolutionRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">{resolutionRate}%</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadCategoryReport(category.id, category.name)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
