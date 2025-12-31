import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Activity, 
  Loader2,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Zap,
  ThumbsUp,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
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

export function OverviewPageEnhanced({ complaints, loading }: OverviewPageProps) {
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const verifiedCount = complaints.filter(c => c.status === 'verified').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalCount = complaints.length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Calculate trends (last 7 days vs previous 7 days)
  const now = new Date();
  const last7Days = complaints.filter(c => {
    const daysDiff = Math.floor((now.getTime() - new Date(c.submittedDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  });
  const prev7Days = complaints.filter(c => {
    const daysDiff = Math.floor((now.getTime() - new Date(c.submittedDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 7 && daysDiff <= 14;
  });
  const weeklyTrend = prev7Days.length > 0 
    ? Math.round(((last7Days.length - prev7Days.length) / prev7Days.length) * 100)
    : 0;

  // Get recent complaints (last 5)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
    .slice(0, 5);

  // Get urgent complaints (pending with high votes)
  const urgentComplaints = complaints
    .filter(c => c.status === 'pending')
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  // Calculate average resolution time
  const resolvedWithDates = complaints.filter(c => c.status === 'resolved' && c.resolvedDate);
  const avgResolutionTime = resolvedWithDates.length > 0
    ? Math.round(resolvedWithDates.reduce((sum, c) => {
        const submitDate = new Date(c.submittedDate);
        const resolveDate = new Date(c.resolvedDate!);
        const days = (resolveDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / resolvedWithDates.length)
    : 0;

  // Get top categories
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: complaints.filter(c => c.category === cat.id).length,
    pending: complaints.filter(c => c.category === cat.id && c.status === 'pending').length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl mb-1">Dashboard Overview</h1>
            <p className="text-sm text-gray-600">Real-time municipal complaint system insights</p>
          </div>
        </div>
        
      </div>

      {/* Main Stats Cards - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Complaints */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-100 mb-1">Total</div>
                <Badge className="bg-white bg-opacity-25 text-white border-0 backdrop-blur-sm">
                  All Time
                </Badge>
              </div>
            </div>
            <div className="text-5xl mb-2">{totalCount}</div>
            <div className="text-sm text-blue-100">All Complaints</div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-xs text-blue-100">
                <span>This Week</span>
                <span className="flex items-center gap-1">
                  {last7Days.length}
                  {weeklyTrend !== 0 && (
                    <span className={`flex items-center ml-2 ${weeklyTrend > 0 ? 'text-orange-200' : 'text-green-200'}`}>
                      {weeklyTrend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(weeklyTrend)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs text-orange-100 mb-1">Pending</div>
                <Badge className="bg-white bg-opacity-25 text-white border-0 backdrop-blur-sm">
                  {totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="text-5xl mb-2">{pendingCount}</div>
            <div className="text-sm text-orange-100">Awaiting Action</div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-xs text-orange-100">
                <span>Requires Review</span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  High Priority
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs text-cyan-100 mb-1">Active</div>
                <Badge className="bg-white bg-opacity-25 text-white border-0 backdrop-blur-sm">
                  {totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="text-5xl mb-2">{verifiedCount}</div>
            <div className="text-sm text-cyan-100">In Progress</div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-xs text-cyan-100">
                <span>Being Resolved</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Resolved */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs text-green-100 mb-1">Success Rate</div>
                <Badge className="bg-white bg-opacity-25 text-white border-0 backdrop-blur-sm">
                  {resolutionRate}%
                </Badge>
              </div>
            </div>
            <div className="text-5xl mb-2">{resolvedCount}</div>
            <div className="text-sm text-green-100">Resolved</div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-xs text-green-100">
                <span>Avg Resolution</span>
                <span className="flex items-center gap-1">
                  {avgResolutionTime} days
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
              <ThumbsUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Citizen Engagement</div>
              <div className="text-3xl mb-1">
                {complaints.reduce((sum, c) => sum + c.votes, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Votes</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4 ">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Active Locations</div>
              <div className="text-3xl mb-1">
                {new Set(complaints.map(c => c.location)).size}
              </div>
              <div className="text-xs text-gray-600">Unique Areas</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow border-l-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-pink-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">This Week</div>
              <div className="text-3xl mb-1">{last7Days.length}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                New Complaints
                {weeklyTrend !== 0 && (
                  <span className={`flex items-center ${weeklyTrend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {weeklyTrend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weeklyTrend)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Overview - Enhanced */}
      <Card className="p-6 mb-8 bg-white shadow-xl border-t-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl">Category Overview</h2>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            {categoryCounts.filter(c => c.count > 0).length} Active
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryCounts.map((category) => {
            const percentage = totalCount > 0 ? Math.round((category.count / totalCount) * 100) : 0;
            
            return (
              <div 
                key={category.id} 
                className="relative group text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all border-2 border-gray-200 hover:border-blue-400 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <div className="text-3xl mb-2">{category.count}</div>
                <p className="text-xs text-gray-600 mb-3">{category.name}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{percentage}%</span>
                  {category.pending > 0 && (
                    <Badge className="bg-orange-100 text-orange-800 border-0 text-xs">
                      {category.pending}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bottom Grid - Urgent & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent Complaints */}
        <Card className="p-6 bg-white shadow-xl border-l-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl">Urgent Complaints</h2>
            <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0">
              High Priority
            </Badge>
          </div>
          <div className="space-y-3">
            {urgentComplaints.length > 0 ? (
              urgentComplaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:shadow-md transition-all border border-red-200 hover:border-red-400"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm flex-1 pr-2">{complaint.title}</h3>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {complaint.votes}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {complaint.location}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTimeAgo(new Date(complaint.submittedDate))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No urgent complaints</p>
                <p className="text-xs text-gray-400 mt-1">All complaints are being handled</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 bg-white shadow-xl border-l-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl">Recent Activity</h2>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="space-y-3">
            {recentComplaints.map((complaint) => {
              const date = new Date(complaint.submittedDate);
              const timeAgo = getTimeAgo(date);
              
              const statusConfig = {
                pending: { 
                  label: 'Pending', 
                  className: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
                  bgClass: 'from-orange-50 to-amber-50 border-orange-200'
                },
                verified: { 
                  label: 'In Progress', 
                  className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
                  bgClass: 'from-blue-50 to-cyan-50 border-blue-200'
                },
                resolved: { 
                  label: 'Resolved', 
                  className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
                  bgClass: 'from-green-50 to-emerald-50 border-green-200'
                },
              };
              
              return (
                <div 
                  key={complaint.id} 
                  className={`p-4 bg-gradient-to-r ${statusConfig[complaint.status].bgClass} rounded-xl border hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm flex-1 pr-2">{complaint.title}</h3>
                    <Badge className={`${statusConfig[complaint.status].className} border-0 text-xs`}>
                      {statusConfig[complaint.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {complaint.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {timeAgo}
                    </div>
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

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
