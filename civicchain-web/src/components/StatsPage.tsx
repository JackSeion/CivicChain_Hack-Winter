import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, AlertCircle, Lightbulb, Sparkles, CloudRain, Zap, Target, CheckCircle, FileText, Clock, AlertTriangle, ThumbsUp, Activity, Calendar, BarChart3, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { getMonthlyTrends, MonthlyTrend, getAnalyticsData, AnalyticsData, getComplaintStats, ComplaintStats } from "../utils/api";

interface StatsPageProps {
  municipalId: string;
}

export function StatsPage({ municipalId }: StatsPageProps) {
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
      console.log('Monthly data:', monthly);
      console.log('Analytics data:', analytics);
      console.log('Stats data:', stats);
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
    
    // Find best performing category (highest resolution rate and fastest resolution)
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
        description: `${categoryName} department achieves fastest resolution time (${avgDays} days avg) with ${bestScore.toFixed(0)}% efficiency score. AI identifies this as best practice model for other departments.`,
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
          description: `${categoryName} complaints increased by ${maxGrowth.toFixed(0)}% this month. AI recommends investigating root causes and allocating additional resources to address the surge.`,
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
        title: "Citizen Verification Success",
        description: `${analyticsData.verificationRate.toFixed(1)}% of resolved complaints verified by citizens. High verification rate indicates strong community engagement and quality resolution work.`,
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
            title: "Overall Complaint Trend Improving",
            description: `${Math.abs(change).toFixed(0)}% month-over-month decline in complaints suggests improving infrastructure quality and citizen satisfaction with municipal response.`,
            metric: `${change.toFixed(0)}%`,
            trend: "down",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
          });
        }
      }
    }

    // Add monsoon/seasonal insight if roads complaints are high
    const currentMonth = monthlyData[monthlyData.length - 1];
    if (currentMonth && currentMonth.roads > 0) {
      const totalCurrent = currentMonth.roads + currentMonth.waste + currentMonth.streetlights + 
                          currentMonth.water + currentMonth.sewage + currentMonth.others;
      const roadsPercentage = (currentMonth.roads / totalCurrent) * 100;
      
      if (roadsPercentage > 30) {
        insights.push({
          icon: CloudRain,
          title: "Road Infrastructure Needs Attention",
          description: `Road & pothole complaints represent ${roadsPercentage.toFixed(0)}% of all complaints. This high percentage may indicate seasonal impacts or infrastructure degradation. Preventive maintenance recommended.`,
          metric: `${roadsPercentage.toFixed(0)}%`,
          trend: "warning",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        });
      }
    }

    return insights.slice(0, 4); // Return top 4 insights
  };

  const insights = generateInsights();

  // Calculate category distribution from analytics data
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
  const total = categoryDistribution.reduce((sum, item) => sum + item.value, 0);

  // Generate predictions based on trends
  const getPredictiveInsights = () => {
    if (monthlyData.length < 2) return [];

    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    
    const predictions = [];
    
    // Roads prediction
    if (currentMonth.roads > 0) {
      const trend = previousMonth.roads > 0 ? (currentMonth.roads - previousMonth.roads) / previousMonth.roads : 0;
      const predicted = Math.round(currentMonth.roads * (1 + trend));
      const confidence = Math.min(95, 75 + Math.abs(trend) * 20);
      
      predictions.push({
        category: "Roads & Potholes",
        currentMonth: currentMonth.roads,
        predicted: Math.max(0, predicted),
        confidence: Math.round(confidence),
      });
    }

    // Water prediction
    if (currentMonth.water > 0) {
      const trend = previousMonth.water > 0 ? (currentMonth.water - previousMonth.water) / previousMonth.water : 0;
      const predicted = Math.round(currentMonth.water * (1 + trend * 0.8)); // Dampen prediction
      const confidence = Math.min(90, 70 + Math.abs(trend) * 15);
      
      predictions.push({
        category: "Water Supply",
        currentMonth: currentMonth.water,
        predicted: Math.max(0, predicted),
        confidence: Math.round(confidence),
      });
    }

    // Sewage prediction
    if (currentMonth.sewage > 0) {
      const trend = previousMonth.sewage > 0 ? (currentMonth.sewage - previousMonth.sewage) / previousMonth.sewage : 0;
      const predicted = Math.round(currentMonth.sewage * (1 + trend * 0.7)); // More dampening
      const confidence = Math.min(88, 65 + Math.abs(trend) * 15);
      
      predictions.push({
        category: "Sewage",
        currentMonth: currentMonth.sewage,
        predicted: Math.max(0, predicted),
        confidence: Math.round(confidence),
      });
    }

    return predictions.slice(0, 3);
  };

  const predictiveInsights = getPredictiveInsights();

  // Get max value for scaling
  const maxValue = Math.max(...monthlyData.map(d => 
    Math.max(d.roads, d.waste, d.streetlights, d.water, d.sewage, d.others)
  ), 1);

  const categories = [
    { key: 'roads', name: 'Roads', color: '#3b82f6' },
    { key: 'waste', name: 'Waste', color: '#10b981' },
    { key: 'streetlights', name: 'Streetlights', color: '#f59e0b' },
    { key: 'water', name: 'Water', color: '#06b6d4' },
    { key: 'sewage', name: 'Sewage', color: '#8b5cf6' },
    { key: 'others', name: 'Others', color: '#64748b' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <div className="text-lg text-gray-600">Loading analytics data...</div>
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
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1>AI-Powered Analytics</h1>
          </div>
          <p className="text-gray-600">Smart insights and predictive trends based on real complaint data</p>
        </div>
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-2">No Analytics Data Available</h2>
          <p className="text-gray-600 mb-4">
            There isn't enough complaint data yet to generate AI insights and analytics.
          </p>
          <p className="text-sm text-gray-500">
            Analytics will be available once complaints are submitted and processed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1>AI-Powered Analytics</h1>
        </div>
        <p className="text-gray-600">Smart insights and predictive trends based on real complaint data</p>
      </div>

      {/* Comprehensive Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Complaints */}
        <Card className="p-6 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Total</Badge>
          </div>
          <div className="text-3xl mb-1">{complaintStats?.total || 0}</div>
          <div className="text-sm text-gray-600">Total Complaints</div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <div className="text-xs text-gray-500">All time received</div>
          </div>
        </Card>

        {/* Pending Complaints */}
        <Card className="p-6 border-l-4 border-orange-500 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>
          </div>
          <div className="text-3xl mb-1">{complaintStats?.pending || 0}</div>
          <div className="text-sm text-gray-600">Awaiting Resolution</div>
          <div className="mt-3 pt-3 border-t border-orange-100">
            <div className="text-xs text-gray-500">
              {complaintStats && complaintStats.total > 0 
                ? `${((complaintStats.pending / complaintStats.total) * 100).toFixed(1)}% of total`
                : '0% of total'}
            </div>
          </div>
        </Card>

        {/* Resolved Complaints */}
        <Card className="p-6 border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>
          </div>
          <div className="text-3xl mb-1">{complaintStats?.resolved || 0}</div>
          <div className="text-sm text-gray-600">Successfully Resolved</div>
          <div className="mt-3 pt-3 border-t border-green-100">
            <div className="text-xs text-gray-500">
              {additionalMetrics 
                ? `${additionalMetrics.resolutionRate}% resolution rate`
                : '0% resolution rate'}
            </div>
          </div>
        </Card>

        {/* Verified Complaints */}
        <Card className="p-6 border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Verified</Badge>
          </div>
          <div className="text-3xl mb-1">{complaintStats?.verified || 0}</div>
          <div className="text-sm text-gray-600">Citizen Verified</div>
          <div className="mt-3 pt-3 border-t border-purple-100">
            <div className="text-xs text-gray-500">
              {complaintStats && complaintStats.resolved > 0
                ? `${((complaintStats.verified / complaintStats.resolved) * 100).toFixed(1)}% verified`
                : '0% verified'}
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Average Resolution Time */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl mb-1">
                {additionalMetrics?.avgResolutionTime || '0'} days
              </div>
              <div className="text-sm text-gray-600">Avg Resolution Time</div>
            </div>
          </div>
        </Card>

        {/* Monthly Average */}
        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-cyan-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl mb-1">
                {monthlyData.length > 0 
                  ? Math.round(monthlyData.reduce((sum, m) => 
                      sum + m.roads + m.waste + m.streetlights + m.water + m.sewage + m.others, 0
                    ) / monthlyData.length)
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Monthly Average</div>
            </div>
          </div>
        </Card>

        {/* Active Categories */}
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-pink-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl mb-1">
                {categoryDistribution.length}
              </div>
              <div className="text-sm text-gray-600">Active Categories</div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Grid */}
      {insights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2>Key Insights</h2>
            <Badge className="bg-purple-100 text-purple-800">AI Powered</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Card key={index} className={`p-6 border-l-4 ${insight.borderColor} hover:shadow-lg transition-all`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg">{insight.title}</h3>
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
            })}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Trends - LINE CHART */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2>Monthly Complaint Trends</h2>
            <Badge variant="outline">Last 7 Months</Badge>
          </div>
          
          {monthlyData.length > 0 ? (
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-200">
                {categories.map(cat => (
                  <div key={cat.key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </div>
                ))}
              </div>
              
              {/* Line Chart */}
              <div className="relative" style={{ height: '320px' }}>
                {/* Y-axis */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500" style={{ width: '40px' }}>
                  <span>{maxValue}</span>
                  <span>{Math.round(maxValue * 0.75)}</span>
                  <span>{Math.round(maxValue * 0.5)}</span>
                  <span>{Math.round(maxValue * 0.25)}</span>
                  <span>0</span>
                </div>
                
                {/* Grid lines */}
                <div className="absolute" style={{ left: '50px', right: '0', top: '0', bottom: '40px' }}>
                  <div className="relative h-full">
                    {[0, 25, 50, 75, 100].map((percent) => (
                      <div 
                        key={percent}
                        className="absolute w-full border-t border-gray-200"
                        style={{ top: `${100 - percent}%` }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Line Chart SVG */}
                <div className="absolute" style={{ left: '50px', right: '0', top: '0', bottom: '40px' }}>
                  <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    {/* Draw lines for each category */}
                    {categories.map(cat => {
                      const points = monthlyData.map((data, index) => {
                        const x = ((index + 0.5) / monthlyData.length) * 100;
                        const value = data[cat.key];
                        const y = maxValue > 0 ? 100 - ((value / maxValue) * 100) : 100;
                        return { x, y, value };
                      });
                      
                      const pathData = points.map((point, index) => 
                        `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`
                      ).join(' ');
                      
                      return (
                        <g key={cat.key}>
                          {/* Line */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke={cat.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all hover:stroke-[3.5px]"
                          />
                          
                          {/* Data points */}
                          {points.map((point, index) => (
                            <g key={index}>
                              <circle
                                cx={`${point.x}%`}
                                cy={`${point.y}%`}
                                r="4"
                                fill="white"
                                stroke={cat.color}
                                strokeWidth="2"
                                className="cursor-pointer hover:r-6 transition-all"
                              />
                              {/* Tooltip on hover */}
                              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                <rect
                                  x={`calc(${point.x}% - 30px)`}
                                  y={`calc(${point.y}% - 30px)`}
                                  width="60"
                                  height="20"
                                  fill="#1f2937"
                                  rx="4"
                                />
                                <text
                                  x={`${point.x}%`}
                                  y={`calc(${point.y}% - 16px)`}
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize="11"
                                  fontWeight="500"
                                >
                                  {point.value}
                                </text>
                              </g>
                            </g>
                          ))}
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute flex items-start justify-around" style={{ left: '50px', right: '0', bottom: '0', height: '40px' }}>
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly totals summary */}
              <div className="grid grid-cols-7 gap-2 pt-4 border-t border-gray-200">
                {monthlyData.map((data, index) => {
                  const monthTotal = data.roads + data.waste + data.streetlights + data.water + data.sewage + data.others;
                  return (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{data.month}</div>
                      <div className="text-sm">{monthTotal}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for the last 7 months
            </div>
          )}
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h2 className="mb-6">Current Distribution</h2>
          
          {total > 0 ? (
            <>
              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {categoryDistribution.map((item, index) => {
                      const percentage = (item.value / total) * 100;
                      const circumference = 2 * Math.PI * 40;
                      const dashArray = `${(percentage / 100) * circumference} ${circumference}`;
                      const prevPercentages = categoryDistribution
                        .slice(0, index)
                        .reduce((sum, i) => sum + (i.value / total) * 100, 0);
                      const rotation = (prevPercentages / 100) * 360;
                      
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="20"
                          strokeDasharray={dashArray}
                          style={{
                            transformOrigin: '50% 50%',
                            transform: `rotate(${rotation}deg)`,
                          }}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl text-gray-900">{total}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                {categoryDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm">{item.value} ({Math.round((item.value / total) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No complaints data available
            </div>
          )}
        </Card>
      </div>

      {/* Predictive Analytics */}
      {predictiveInsights.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-purple-600" />
            <h2>AI Predictions for Next Month</h2>
            <Badge className="bg-purple-600 text-white">Predictive Model</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {predictiveInsights.map((insight, index) => (
              <Card key={index} className="p-5 bg-white">
                <div className="mb-3">
                  <h3 className="text-lg mb-1">{insight.category}</h3>
                  <p className="text-sm text-gray-500">Based on historical patterns</p>
                </div>
                <div className="flex items-end gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current</p>
                    <div className="text-2xl text-gray-700">{insight.currentMonth}</div>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Predicted</p>
                    <div className="text-2xl text-purple-600">{insight.predicted}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{insight.confidence}% confidence</span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Category Comparison */}
      {monthlyData.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-6">Category-wise Comparison (Current Month)</h2>
          <div className="h-96">
            <div className="flex items-end justify-around h-full gap-4 pb-8">
              {categories.map((cat) => {
                const lastMonth = monthlyData[monthlyData.length - 1];
                const value = lastMonth[cat.key];
                const maxVal = Math.max(...categories.map(c => lastMonth[c.key]), 1);
                const height = (value / maxVal) * 100;
                
                return (
                  <div key={cat.key} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div className="text-sm mb-2">{value}</div>
                      <div
                        className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          backgroundColor: cat.color,
                          height: `${height}%`,
                          minHeight: '20px',
                        }}
                        title={`${cat.name}: ${value} complaints`}
                      />
                    </div>
                    <div className="text-xs text-gray-600 text-center mt-2">{cat.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
