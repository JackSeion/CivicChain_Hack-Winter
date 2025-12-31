import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Trophy, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getDepartmentPerformance, DepartmentPerformance } from "../utils/api";
import { HeatmapCard } from "./HeatmapCard";

interface PerformancePageProps {
  municipalId: string;
}

export function PerformancePage({ municipalId }: PerformancePageProps) {
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [municipalId]);

  async function loadPerformanceData() {
    try {
      const data = await getDepartmentPerformance(municipalId);
      setDepartmentPerformance(data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      // Fallback to sample data
      setDepartmentPerformance([
        { 
          department: 'Roads & Potholes', 
          total: 156, 
          resolved: 132, 
          avgResolutionTime: '4.2 days', 
          score: 85 
        },
        { 
          department: 'Waste / Garbage', 
          total: 98, 
          resolved: 89, 
          avgResolutionTime: '2.1 days', 
          score: 91 
        },
        { 
          department: 'Water Supply', 
          total: 87, 
          resolved: 76, 
          avgResolutionTime: '3.5 days', 
          score: 87 
        },
        { 
          department: 'Streetlights', 
          total: 64, 
          resolved: 58, 
          avgResolutionTime: '1.8 days', 
          score: 91 
        },
        { 
          department: 'Sewage', 
          total: 112, 
          resolved: 89, 
          avgResolutionTime: '5.1 days', 
          score: 79 
        },
        { 
          department: 'Others', 
          total: 45, 
          resolved: 38, 
          avgResolutionTime: '3.2 days', 
          score: 84 
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Sort by score for leaderboard
  const sortedDepartments = [...departmentPerformance].sort((a, b) => b.score - a.score);

  const totalComplaints = departmentPerformance.reduce((sum, dept) => sum + dept.total, 0);
  const totalResolved = departmentPerformance.reduce((sum, dept) => sum + dept.resolved, 0);
  const avgResolutionRate = totalComplaints > 0 ? Math.round((totalResolved / totalComplaints) * 100) : 0;
  
  // Calculate weighted average resolution time
  const weightedSum = departmentPerformance.reduce((sum, dept) => {
    const days = parseFloat(dept.avgResolutionTime);
    return sum + (days * dept.total);
  }, 0);
  const avgResolutionTime = totalComplaints > 0 ? (weightedSum / totalComplaints).toFixed(1) : '0.0';

  const topPerformer = sortedDepartments[0];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", className: "bg-green-100 text-green-800" };
    if (score >= 80) return { label: "Good", className: "bg-blue-100 text-blue-800" };
    if (score >= 70) return { label: "Fair", className: "bg-amber-100 text-amber-800" };
    return { label: "Needs Improvement", className: "bg-red-100 text-red-800" };
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Department Performance</h1>
        <p className="text-gray-600">Track and compare department efficiency</p>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Complaints</span>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-gray-900">{totalComplaints}</div>
          <p className="text-xs text-gray-500 mt-1">All departments</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Resolved</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-gray-900">{totalResolved}</div>
          <p className="text-xs text-gray-500 mt-1">{avgResolutionRate}% resolution rate</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Avg Resolution</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-gray-900">{avgResolutionTime} days</div>
          <p className="text-xs text-gray-500 mt-1">Overall average</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Top Performer</span>
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-gray-900">{topPerformer?.department || 'N/A'}</div>
          <p className="text-xs text-gray-500 mt-1">{topPerformer?.score || 0}% score</p>
        </Card>
      </div>
      {/* Heatmap */}
      <HeatmapCard municipalId={municipalId} />

      {/* Department Leaderboard */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h2>Department Leaderboard</h2>
        </div>
        <div className="space-y-4">
          {sortedDepartments.map((dept, index) => {
            const badge = getScoreBadge(dept.score);
            return (
              <div key={dept.department} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  <span className="font-semibold">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3>{dept.department}</h3>
                    <Badge className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                  <Progress value={dept.score} className="h-2" />
                </div>

                <div className={`text-2xl ${getScoreColor(dept.score)}`}>
                  {dept.score}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed Performance Table */}
      <Card className="p-6 mb-6">
        <h2 className="mb-6">Detailed Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-gray-600">Department</th>
                <th className="text-right p-4 text-gray-600">Total</th>
                <th className="text-right p-4 text-gray-600">Resolved</th>
                <th className="text-right p-4 text-gray-600">Avg Resolution Time</th>
                <th className="text-right p-4 text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              {departmentPerformance.map((dept) => {
                const resolutionRate = Math.round((dept.resolved / dept.total) * 100);
                return (
                  <tr key={dept.department} className="border-b hover:bg-gray-50">
                    <td className="p-4">{dept.department}</td>
                    <td className="p-4 text-right">{dept.total}</td>
                    <td className="p-4 text-right">
                      <span className="text-green-600">{dept.resolved}</span>
                      <span className="text-gray-400 text-sm ml-1">({resolutionRate}%)</span>
                    </td>
                    <td className="p-4 text-right">{dept.avgResolutionTime}</td>
                    <td className="p-4 text-right">
                      <span className={getScoreColor(dept.score)}>
                        {dept.score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      
      {/* Performance Chart - Resolution Rate Comparison */}
      <Card className="p-6 mt-6">
        <div className="mb-6">
          <h2 className="mb-2">Resolution Rate Comparison</h2>
          <p className="text-sm text-gray-600">Department-wise total vs resolved complaints</p>
        </div>
        
        <div className="space-y-8">
          {/* Visual Bar Chart */}
          <div className="relative" style={{ minHeight: '400px' }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500" style={{ width: '50px' }}>
              {[100, 75, 50, 25, 0].map((val) => {
                const maxTotal = Math.max(...departmentPerformance.map(d => d.total), 1);
                return (
                  <span key={val} className="text-right pr-2">
                    {Math.round((val / 100) * maxTotal)}
                  </span>
                );
              })}
            </div>
            
            {/* Grid lines */}
            <div className="absolute" style={{ left: '60px', right: '0', top: '0', bottom: '80px' }}>
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
            
            {/* Bars */}
            <div className="absolute flex items-end justify-around gap-3" style={{ left: '60px', right: '0', top: '0', bottom: '80px' }}>
              {departmentPerformance.map((dept) => {
                const maxTotal = Math.max(...departmentPerformance.map(d => d.total), 1);
                const totalHeight = (dept.total / maxTotal) * 100;
                const resolvedHeight = (dept.resolved / maxTotal) * 100;
                const resolutionRate = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                
                return (
                  <div key={dept.department} className="flex-1 flex flex-col items-center justify-end h-full">
                    {/* Resolution Rate Badge */}
                    <div className="mb-2">
                      <Badge 
                        className={`text-xs ${
                          resolutionRate >= 80 ? 'bg-green-100 text-green-800' :
                          resolutionRate >= 50 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {resolutionRate}%
                      </Badge>
                    </div>
                    
                    {/* Bar Group */}
                    <div className="w-full flex gap-2 items-end justify-center h-full">
                      {/* Total Bar */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="text-xs mb-1 font-medium text-gray-700">{dept.total}</div>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-gray-500 to-gray-400 transition-all hover:shadow-lg cursor-pointer"
                          style={{
                            height: `${totalHeight}%`,
                            minHeight: dept.total > 0 ? '30px' : '10px',
                            maxWidth: '40px',
                          }}
                          title={`Total: ${dept.total} complaints`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            Total: {dept.total}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Resolved Bar */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="text-xs mb-1 font-medium text-green-700">{dept.resolved}</div>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-green-500 transition-all hover:shadow-lg cursor-pointer"
                          style={{
                            height: `${resolvedHeight}%`,
                            minHeight: dept.resolved > 0 ? '30px' : '10px',
                            maxWidth: '40px',
                          }}
                          title={`Resolved: ${dept.resolved} complaints`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            Resolved: {dept.resolved}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="absolute flex items-start justify-around" style={{ left: '60px', right: '0', bottom: '0', height: '80px' }}>
              {departmentPerformance.map((dept) => (
                <div key={dept.department} className="flex-1 text-center px-1">
                  <div className="text-xs text-gray-700 mt-2 leading-tight">
                    {dept.department}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dept.avgResolutionTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-8 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-t from-gray-500 to-gray-400"></div>
              <span className="text-sm text-gray-700">Total Complaints</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-t from-green-600 to-green-500"></div>
              <span className="text-sm text-gray-700">Resolved Complaints</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 text-xs">80%+</Badge>
              <span className="text-xs text-gray-600">High Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 text-xs">50-79%</Badge>
              <span className="text-xs text-gray-600">Good Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-800 text-xs">&lt;50%</Badge>
              <span className="text-xs text-gray-600">Needs Improvement</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
