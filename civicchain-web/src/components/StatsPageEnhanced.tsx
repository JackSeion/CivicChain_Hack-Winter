import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  TrendingUp, 
  AlertCircle, 
  Lightbulb, 
  Sparkles, 
  CloudRain, 
  Zap, 
  CheckCircle, 
  FileText, 
  Clock, 
  ThumbsUp, 
  Activity, 
  Calendar, 
  BarChart3, 
  ArrowUp,
  ArrowDown,
  Target,
} from "lucide-react";
import { useState, useEffect } from "react";
import { 
  getMonthlyTrends, 
  MonthlyTrend, 
  getAnalyticsData, 
  AnalyticsData, 
  getComplaintStats, 
  ComplaintStats 
} from "../utils/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatsPageProps {
  municipalId: string;
}

export function StatsPageEnhanced({ municipalId }: StatsPageProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [complaintStats, setComplaintStats] = useState<ComplaintStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [municipalId]);

  async function loadData() {
    try {
      const [monthly, analytics, stats] = await Promise.all([
        getMonthlyTrends(municipalId),
        getAnalyticsData(municipalId),
        getComplaintStats(municipalId),
      ]);
      setMonthlyData(monthly);
      setAnalyticsData(analytics);
      setComplaintStats(stats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate additional metrics
  const getAdditionalMetrics = () => {
    if (!analyticsData) return null;

    const categoryStats = analyticsData.categoryStats;
    let totalResolutionDays = 0;
    let totalResolvedCount = 0;

    Object.values(categoryStats).forEach(stats => {
      totalResolutionDays += stats.totalDays;
      totalResolvedCount += stats.resolvedCount;
    });

    const avgResolutionTime = totalResolvedCount > 0 
      ? (totalResolutionDays / totalResolvedCount).toFixed(1) 
      : '0';

    const resolutionRate = analyticsData.totalComplaints > 0
      ? ((analyticsData.resolvedComplaints / analyticsData.totalComplaints) * 100).toFixed(1)
      : '0';

    return {
      avgResolutionTime,
      resolutionRate,
    };
  };

  const additionalMetrics = getAdditionalMetrics();

  // Generate AI insights from real data
  const generateInsights = () => {
    if (!analyticsData || !monthlyData.length) return [];

    const insights: any[] = [];
    const categoryStats = analyticsData.categoryStats;
    
    // Find best performing category
    let bestCategory = '';
    let bestScore = 0;
    let fastestResolution = Infinity;
    
    Object.entries(categoryStats).forEach(([catId, stats]) => {
      if (stats.resolvedCount > 0) {
        const avgDays = stats.totalDays / stats.resolvedCount;
        const resolutionRate = (stats.resolved / stats.total) * 100;
        if (resolutionRate > bestScore || (resolutionRate === bestScore && avgDays < fastestResolution)) {
          bestScore = resolutionRate;
          bestCategory = catId;
          fastestResolution = avgDays;
        }
      }
    });

    // Best performing category insight
    if (bestCategory && categoryStats[bestCategory]) {
      const stats = categoryStats[bestCategory];
      const avgDays = stats.resolvedCount > 0 ? (stats.totalDays / stats.resolvedCount).toFixed(1) : '0';
      const categoryName = bestCategory.charAt(0).toUpperCase() + bestCategory.slice(1);
      
      insights.push({
        icon: Zap,
        title: `${categoryName} Department Excellence`,
        description: `${categoryName} department achieves fastest resolution time (${avgDays} days avg) with ${bestScore.toFixed(0)}% efficiency score. This serves as a best practice model.`,
        metric: `${avgDays} days`,
        trend: "best",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      });
    }

    // Analyze trends - find category with highest growth
    if (monthlyData.length >= 2) {
      const currentMonth = monthlyData[monthlyData.length - 1];
      const previousMonth = monthlyData[monthlyData.length - 2];
      
      const categories = ['roads', 'waste', 'streetlights', 'water', 'sewage', 'others'];
      let maxGrowth = 0;
      let maxGrowthCategory = '';
      
      categories.forEach(cat => {
        const current = currentMonth[cat] || 0;
        const previous = previousMonth[cat] || 0;
        if (previous > 0) {
          const growth = ((current - previous) / previous) * 100;
          if (growth > maxGrowth) {
            maxGrowth = growth;
            maxGrowthCategory = cat;
          }
        }
      });

      if (maxGrowthCategory && maxGrowth > 20) {
        const categoryName = maxGrowthCategory.charAt(0).toUpperCase() + maxGrowthCategory.slice(1);
        insights.push({
          icon: AlertCircle,
          title: `${categoryName} Complaints Trending Up`,
          description: `${categoryName} complaints increased by ${maxGrowth.toFixed(0)}% this month. Recommend investigating root causes and allocating additional resources.`,
          metric: `+${maxGrowth.toFixed(0)}%`,
          trend: "warning",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        });
      }
    }

    // Verification rate insight
    if (analyticsData.verificationRate > 0) {
      insights.push({
        icon: CheckCircle,
        title: "Strong Citizen Engagement",
        description: `${analyticsData.verificationRate.toFixed(1)}% of resolved complaints verified by citizens. High verification indicates community trust and quality work.`,
        metric: `${analyticsData.verificationRate.toFixed(0)}%`,
        trend: "best",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      });
    }

    // Overall trend insight
    if (monthlyData.length >= 2) {
      const recent = monthlyData[monthlyData.length - 1];
      const older = monthlyData[monthlyData.length - 2];
      
      const recentTotal = recent.roads + recent.waste + recent.streetlights + recent.water + recent.sewage + recent.others;
      const olderTotal = older.roads + older.waste + older.streetlights + older.water + older.sewage + older.others;
      
      if (olderTotal > 0) {
        const change = ((recentTotal - olderTotal) / olderTotal) * 100;
        
        if (change < 0) {
          insights.push({
            icon: TrendingUp,
            title: "Overall Improvement Trend",
            description: `${Math.abs(change).toFixed(0)}% month-over-month decline suggests improving infrastructure and citizen satisfaction.`,
            metric: `${change.toFixed(0)}%`,
            trend: "down",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
          });
        }
      }
    }

    return insights.slice(0, 4);
  };

  const insights = generateInsights();

  // Category distribution
  const getCategoryDistribution = () => {
    if (!analyticsData) return [];
    
    const categories = [
      { name: 'Roads', id: 'roads', color: '#3b82f6' },
      { name: 'Waste', id: 'waste', color: '#10b981' },
      { name: 'Streetlights', id: 'streetlights', color: '#f59e0b' },
      { name: 'Water', id: 'water', color: '#06b6d4' },
      { name: 'Sewage', id: 'sewage', color: '#8b5cf6' },
      { name: 'Others', id: 'others', color: '#64748b' },
    ];

    return categories.map(cat => ({
      name: cat.name,
      value: analyticsData.categoryStats[cat.id]?.total || 0,
      color: cat.color,
    })).filter(c => c.value > 0);
  };

  const categoryDistribution = getCategoryDistribution();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const hasData = monthlyData.length > 0 || (analyticsData && analyticsData.totalComplaints > 0);

  if (!hasData) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time insights and performance metrics</p>
            </div>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-2">No Data Available</h2>
          <p className="text-gray-600">Analytics will appear once complaints are submitted</p>
        </Card>
      </div>
    );
  }

  // Calculate monthly average
  const monthlyAvg = monthlyData.length > 0 
    ? Math.round(monthlyData.reduce((sum, m) => 
        sum + m.roads + m.waste + m.streetlights + m.water + m.sewage + m.others, 0
      ) / monthlyData.length)
    : 0;

  // Calculate trend
  let overallTrend = 0;
  if (monthlyData.length >= 2) {
    const recent = monthlyData[monthlyData.length - 1];
    const older = monthlyData[monthlyData.length - 2];
    const recentTotal = recent.roads + recent.waste + recent.streetlights + recent.water + recent.sewage + recent.others;
    const olderTotal = older.roads + older.waste + older.streetlights + older.water + older.sewage + older.others;
    if (olderTotal > 0) {
      overallTrend = ((recentTotal - olderTotal) / olderTotal) * 100;
    }
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">
              Real-time insights • {complaintStats?.total || 0} total complaints analyzed
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <Badge className="bg-white bg-opacity-20 text-white border-0">Total</Badge>
            </div>
            <div className="text-4xl mb-2">{complaintStats?.total || 0}</div>
            <div className="text-sm text-blue-100">All Complaints</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <Badge className="bg-white bg-opacity-20 text-white border-0">Pending</Badge>
            </div>
            <div className="text-4xl mb-2">{complaintStats?.pending || 0}</div>
            <div className="text-sm text-orange-100">Awaiting Action</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <Badge className="bg-white bg-opacity-20 text-white border-0">{additionalMetrics?.resolutionRate}%</Badge>
            </div>
            <div className="text-4xl mb-2">{complaintStats?.resolved || 0}</div>
            <div className="text-sm text-green-100">Resolved</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ThumbsUp className="w-7 h-7 text-white" />
              </div>
              <Badge className="bg-white bg-opacity-20 text-white border-0">Verified</Badge>
            </div>
            <div className="text-4xl mb-2">{complaintStats?.verified || 0}</div>
            <div className="text-sm text-purple-100">Citizen Verified</div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="text-3xl mb-1">{additionalMetrics?.avgResolutionTime || '0'}</div>
              <div className="text-sm text-gray-600">Avg Resolution Days</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-cyan-600" />
            </div>
            <div className="flex-1">
              <div className="text-3xl mb-1">{monthlyAvg}</div>
              <div className="text-sm text-gray-600">Monthly Average</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
              {overallTrend < 0 ? (
                <ArrowDown className="w-8 h-8 text-green-600" />
              ) : (
                <ArrowUp className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className={`text-3xl mb-1 ${overallTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overallTrend > 0 ? '+' : ''}{overallTrend.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Monthly Trend</div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl">AI-Powered Insights</h2>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              Real-time
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Card 
                  key={index} 
                  className={`p-6 border-l-4 ${insight.borderColor} hover:shadow-xl transition-all bg-white`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl ${insight.bgColor} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className={`w-8 h-8 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base">{insight.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${insight.color} border-current`}
                        >
                          {insight.metric}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}</div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends Chart */}
        {monthlyData.length > 0 && (
          <Card className="p-6 lg:col-span-2 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl mb-1">Monthly Complaint Trends</h2>
                <p className="text-sm text-gray-600">Last {monthlyData.length} months performance</p>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11 }} 
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="roads" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 5 }}
                  name="Roads"
                />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 5 }}
                  name="Waste"
                />
                <Line 
                  type="monotone" 
                  dataKey="water" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  dot={{ r: 5 }}
                  name="Water"
                />
                <Line 
                  type="monotone" 
                  dataKey="streetlights" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 5 }}
                  name="Streetlights"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Category Distribution */}
        {categoryDistribution.length > 0 && (
          <Card className="p-6 bg-white shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl mb-1">Category Distribution</h2>
              <p className="text-sm text-gray-600">Total complaints by type</p>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {categoryDistribution.slice(0, 3).map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-gray-600">{cat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
