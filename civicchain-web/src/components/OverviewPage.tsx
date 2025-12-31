import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Activity, Loader2 } from "lucide-react";
import { categories } from "../data/dummyData";

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

interface OverviewPageProps {
  complaints: Complaint[];
  loading?: boolean;
}

export function OverviewPage({ complaints, loading }: OverviewPageProps) {
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const verifiedCount = complaints.filter(c => c.status === 'verified').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalCount = complaints.length;
  const resolutionRate = Math.round((resolvedCount / totalCount) * 100);

  // Get recent complaints (last 5)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
    .slice(0, 5);

  // Get urgent complaints (pending with high votes)
  const urgentComplaints = complaints
    .filter(c => c.status === 'pending')
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Real-time municipal complaint system insights</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-800">System Active - All Departments Online</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="outline" className="text-blue-600">Total</Badge>
          </div>
          <div className="text-3xl text-gray-900 mb-1">{totalCount}</div>
          <p className="text-sm text-gray-600">All Complaints</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <Badge variant="outline" className="text-amber-600">Pending</Badge>
          </div>
          <div className="text-3xl text-gray-900 mb-1">{pendingCount}</div>
          <p className="text-sm text-gray-600">Awaiting Verification</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="outline" className="text-blue-600">Active</Badge>
          </div>
          <div className="text-3xl text-gray-900 mb-1">{verifiedCount}</div>
          <p className="text-sm text-gray-600">In Progress</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="outline" className="text-green-600">{resolutionRate}%</Badge>
          </div>
          <div className="text-3xl text-gray-900 mb-1">{resolvedCount}</div>
          <p className="text-sm text-gray-600">Resolved</p>
        </Card>
      </div>

      {/* Category Quick Stats */}
      <Card className="p-6 mb-8">
        <h2 className="mb-6">Category Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const categoryComplaints = complaints.filter(c => c.category === category.id);
            const pending = categoryComplaints.filter(c => c.status === 'pending').length;
            const total = categoryComplaints.length;
            
            return (
              <div key={category.id} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-2xl mb-1">{total}</div>
                <p className="text-xs text-gray-600 mb-2">{category.name}</p>
                {pending > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    {pending} pending
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent Complaints */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2>Urgent Complaints</h2>
            <Badge className="bg-red-100 text-red-800">High Priority</Badge>
          </div>
          <div className="space-y-3">
            {urgentComplaints.length > 0 ? (
              urgentComplaints.map((complaint) => (
                <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm flex-1">{complaint.title}</h3>
                    <Badge className="bg-amber-100 text-amber-800 text-xs">
                      {complaint.votes} votes
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{complaint.location}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No urgent complaints</p>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2>Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentComplaints.map((complaint) => {
              const date = new Date(complaint.submittedDate);
              const timeAgo = getTimeAgo(date);
              
              const statusConfig = {
                pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
                verified: { label: 'Verified', className: 'bg-blue-100 text-blue-800' },
                resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
              };
              
              return (
                <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm flex-1">{complaint.title}</h3>
                    <Badge className={`${statusConfig[complaint.status].className} text-xs`}>
                      {statusConfig[complaint.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{complaint.location}</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
