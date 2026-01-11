import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Users,
  Shield,
  Loader2,
  Clock,
  ArrowUp,
  ArrowDown,
  Award,
  Target,
  Sparkles,
  Building2,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "../utils/api";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
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

interface StateOverviewPageEnhancedProps {
  stateId: string;
  stateName: string;
}

export function StateOverviewPageEnhanced({
  stateId,
  stateName,
}: StateOverviewPageEnhancedProps) {
  const [selectedTab, setSelectedTab] = useState<
    | "overview"
    | "comparison"
    | "departments"
    | "escalated"
    | "analytics"
    | "compliance"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [stateStats, setStateStats] = useState<api.StateStats | null>(null);
  const [municipalStats, setMunicipalStats] = useState<api.MunicipalStats[]>([]);
  const [deptPerformance, setDeptPerformance] = useState<api.StateDepartmentPerformance[]>([]);
  const [historicalTrends, setHistoricalTrends] = useState<api.YearlyTrend[]>([]);
  const [forecast, setForecast] = useState<api.CategoryForecast[]>([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState<api.EscalatedComplaint[]>([]);

  useEffect(() => {
    loadStateData();
  }, [stateId]);

  const loadStateData = async () => {
    try {
      setLoading(true);
      const [stats, munStats, deptPerf, trends, forecastData, escalated] = await Promise.all([
        api.getStateStats(stateId),
        api.getMunicipalStatsForState(stateId),
        api.getStateDepartmentPerformance(stateId),
        api.getStateHistoricalTrends(stateId),
        api.getStateForecast(stateId),
        api.getEscalatedComplaints(stateId),
      ]);
      setStateStats(stats);
      setMunicipalStats(munStats);
      setDeptPerformance(deptPerf);
      setHistoricalTrends(trends);
      setForecast(forecastData);
      setEscalatedComplaints(escalated);
    } catch (error) {
      console.error('Error loading state data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeekExplanation = async (complaint: api.EscalatedComplaint) => {
    setActionLoading(complaint.id);
    try {
      const messageText = `ESCALATION INQUIRY - Complaint #${complaint.id}

Dear ${complaint.municipalName} Team,

This complaint has been pending for ${complaint.daysPending} days and has been auto-escalated to the state level.

Complaint Details:
• Category: ${complaint.categoryName}
• Location: ${complaint.location}
• Submitted: ${new Date(complaint.submittedDate).toLocaleDateString()}

Please provide:
1. Current status and actions taken
2. Reasons for delay in resolution
3. Expected timeline for completion
4. Any challenges or resource requirements

This requires immediate attention and explanation.

Regards,
${stateName} State Administration`;

      await api.sendMessage(
        stateId,
        complaint.municipalId,
        'state',
        `${stateName} State`,
        messageText,
        'high',
        'query',
        complaint.id
      );

      toast.success('Explanation request sent', {
        description: `Message sent to ${complaint.municipalName} regarding complaint #${complaint.id}`,
      });
    } catch (error) {
      console.error('Error sending explanation request:', error);
      toast.error('Failed to send message', {
        description: 'Please try again or contact support',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkResolved = async (complaint: api.EscalatedComplaint) => {
    setActionLoading(complaint.id);
    try {
      await api.resolveComplaintByState(complaint.id, `Resolved by ${stateName} State Administration`);
      
      // Remove from escalated list
      setEscalatedComplaints(prev => prev.filter(c => c.id !== complaint.id));
      
      // Refresh state stats
      const stats = await api.getStateStats(stateId);
      setStateStats(stats);

      toast.success('Complaint marked as resolved', {
        description: `Complaint #${complaint.id} has been resolved at state level`,
      });
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error('Failed to resolve complaint', {
        description: 'Please try again or contact support',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !stateStats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading state dashboard...</p>
        </div>
      </div>
    );
  }

  const avgResolutionTime = stateStats.avgResolutionTime;
  const avgPerformance =
    municipalStats.length > 0
      ? municipalStats.reduce((sum, m) => sum + m.score, 0) / municipalStats.length
      : 0;

  const colors = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    cyan: "#06b6d4",
  };

  const COLORS = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.cyan,
    colors.purple,
    colors.danger,
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl mb-1">{stateName} State Dashboard</h1>
            <p className="text-sm text-gray-600">
              Comprehensive governance insights • {stateStats.totalMunicipals} municipalities monitored
            </p>
          </div>
        </div>
        
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-2 flex flex-wrap gap-2">
        {[
          { id: "overview", label: "Statewide Overview", icon: BarChart3 },
          { id: "comparison", label: "Municipal Comparison", icon: Target },
          { id: "departments", label: "Departments", icon: Users },
          { id: "escalated", label: "Escalated Complaints", icon: AlertTriangle },
          { id: "analytics", label: "Analytics & Forecast", icon: TrendingUp },
          { id: "compliance", label: "Compliance", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : tab.id === "escalated"
                  ? "bg-red-600 hover:bg-red-700 text-white hover:shadow-md hover:scale-105"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="space-y-8">
          {/* Key State Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="p-6 relative">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl mb-2">{stateStats.totalComplaints.toLocaleString()}</div>
                <div className="text-sm text-blue-100">Total Complaints</div>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="p-6 relative">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl mb-2">{stateStats.resolved.toLocaleString()}</div>
                <div className="text-sm text-green-100">Resolved</div>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="p-6 relative">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl mb-2">{stateStats.pending.toLocaleString()}</div>
                <div className="text-sm text-orange-100">Pending</div>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="p-6 relative">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl mb-2">{avgResolutionTime.toFixed(1)}</div>
                <div className="text-sm text-purple-100">Avg Days</div>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="p-6 relative">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl mb-2">{avgPerformance.toFixed(0)}%</div>
                <div className="text-sm text-cyan-100">Avg Performance</div>
              </div>
            </Card>
          </div>

          {/* Geographical Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2 bg-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl mb-1">Statewide Municipal Overview</h2>
                  <p className="text-sm text-gray-600">
                    Regional complaint volumes and performance zones
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  {municipalStats.length} Municipals
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {municipalStats.slice(0, 6).map((municipal) => (
                  <div
                    key={municipal.municipalId}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${
                      municipal.score >= 85
                        ? "bg-green-50 border-green-300 hover:border-green-500"
                        : municipal.score >= 70
                        ? "bg-blue-50 border-blue-300 hover:border-blue-500"
                        : "bg-orange-50 border-orange-300 hover:border-orange-500"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base mb-1">{municipal.municipalName}</h3>
                      </div>
                      <Badge
                        className={`${
                          municipal.score >= 85
                            ? "bg-green-600"
                            : municipal.score >= 70
                            ? "bg-blue-600"
                            : "bg-orange-600"
                        } text-white border-0`}
                      >
                        {municipal.score}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Complaints</span>
                        <span className="font-semibold">{municipal.totalComplaints.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-semibold text-orange-600">{municipal.pending}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Avg Days</span>
                        <span className="font-semibold">{municipal.avgResolutionTime.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-xl">
              <h2 className="text-xl mb-6">Performance Rankings</h2>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm">Top Performers</h3>
                </div>
                <div className="space-y-3">
                  {municipalStats.slice(0, 3).map((municipal, idx) => (
                    <div
                      key={municipal.municipalId}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                    >
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{municipal.municipalName}</div>
                        <div className="text-xs text-gray-600">
                          {municipal.score}% • {municipal.avgResolutionTime.toFixed(1)} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm">Needs Attention</h3>
                </div>
                <div className="space-y-3">
                  {[...municipalStats]
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                    .map((municipal) => (
                      <div
                        key={municipal.municipalId}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200"
                      >
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white text-xs">
                          ⚠️
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{municipal.municipalName}</div>
                          <div className="text-xs text-gray-600">
                            {municipal.score}% • {municipal.pending} pending
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Statewide Trends */}
          <Card className="p-6 bg-white shadow-xl">
            <h2 className="text-xl mb-6">Statewide Complaint Volume by Municipal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={municipalStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="municipalName" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalComplaints" fill={colors.primary} name="Total Complaints" />
                <Bar dataKey="resolved" fill={colors.success} name="Resolved" />
                <Bar dataKey="pending" fill={colors.warning} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {selectedTab === "comparison" && (
        <div className="space-y-6">
          <Card className="p-6 bg-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl">Municipal Performance Comparison</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 bg-gray-50">Rank</th>
                    <th className="text-left p-4 bg-gray-50">Municipal</th>
                    <th className="text-right p-4 bg-gray-50">Complaints</th>
                    <th className="text-right p-4 bg-gray-50">Avg Resolution Time</th>
                    <th className="text-right p-4 bg-gray-50">Performance Score</th>
                    <th className="text-right p-4 bg-gray-50">Pending Load</th>
                    <th className="text-center p-4 bg-gray-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {municipalStats.map((municipal, idx) => (
                    <tr
                      key={municipal.municipalId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                            idx === 0
                              ? "bg-yellow-500"
                              : idx === 1
                              ? "bg-gray-400"
                              : idx === 2
                              ? "bg-orange-400"
                              : "bg-gray-300"
                          }`}
                        >
                          {idx + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{municipal.municipalName}</div>
                      </td>
                      <td className="p-4 text-right text-sm">
                        {municipal.totalComplaints.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <Badge
                          className={`${
                            municipal.avgResolutionTime < 3
                              ? "bg-green-100 text-green-800"
                              : municipal.avgResolutionTime < 5
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          } border-0`}
                        >
                          {municipal.avgResolutionTime.toFixed(1)} days
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-sm">{municipal.score}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                municipal.score >= 85
                                  ? "bg-green-600"
                                  : municipal.score >= 70
                                  ? "bg-blue-600"
                                  : "bg-orange-600"
                              }`}
                              style={{ width: `${municipal.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Badge
                          className={`${
                            municipal.pending < (municipal.totalComplaints * 0.2)
                              ? "bg-green-100 text-green-800"
                              : municipal.pending < (municipal.totalComplaints * 0.3)
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          } border-0`}
                        >
                          {municipal.pending}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        {municipal.score >= 85 ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : municipal.score >= 70 ? (
                          <Activity className="w-5 h-5 text-blue-600 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white shadow-xl">
              <h2 className="text-xl mb-6">Performance Score Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={municipalStats.map((m) => ({
                      name: m.municipalName,
                      value: m.score,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {municipalStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white shadow-xl">
              <h2 className="text-xl mb-6">Average Resolution Time Comparison</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[...municipalStats].sort((a, b) => a.avgResolutionTime - b.avgResolutionTime)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="municipalName"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgResolutionTime" fill={colors.purple} name="Avg Days" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {selectedTab === "departments" && (
        <div className="space-y-6">
          <Card className="p-6 bg-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl">Department Performance at State Level</h2>
            </div>

            {deptPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-4 bg-gray-50">Category</th>
                      <th className="text-right p-4 bg-gray-50">Statewide Avg</th>
                      <th className="text-left p-4 bg-gray-50">Worst Municipal</th>
                      <th className="text-left p-4 bg-gray-50">Best Municipal</th>
                      <th className="text-right p-4 bg-gray-50">Total Complaints</th>
                      <th className="text-right p-4 bg-gray-50">Resolved %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptPerformance.map((dept, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="text-sm">{dept.categoryName}</div>
                        </td>
                        <td className="p-4 text-right">
                          <Badge className="bg-blue-100 text-blue-800 border-0">
                            {dept.statewideAvg.toFixed(1)} days
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-red-600">{dept.worstMunicipal}</div>
                          <div className="text-xs text-gray-500">{dept.worstMunicipalAvg.toFixed(1)} days</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-green-600">{dept.bestMunicipal}</div>
                          <div className="text-xs text-gray-500">{dept.bestMunicipalAvg.toFixed(1)} days</div>
                        </td>
                        <td className="p-4 text-right text-sm">
                          {dept.totalComplaints.toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="text-sm">{dept.resolvedPercentage.toFixed(0)}%</div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${dept.resolvedPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No department performance data available
              </div>
            )}
          </Card>

          {deptPerformance.length > 0 && (
            <Card className="p-6 bg-white shadow-xl">
              <h2 className="text-xl mb-6">Department Complaint Volume</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="categoryName" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalComplaints" fill={colors.primary} name="Total Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {selectedTab === "escalated" && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl mb-1">Escalated Complaints</h2>
                <p className="text-sm text-gray-700">
                  Complaints pending for more than 30 days • Auto-escalated from Municipal to State level
                </p>
              </div>
              <Badge className="bg-red-600 text-white border-0 text-lg px-4 py-2">
                {escalatedComplaints.length} Escalated
              </Badge>
            </div>
          </Card>

          {escalatedComplaints.length > 0 ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border-l-4 border-red-600">
                  <div className="text-sm text-gray-600 mb-1">Total Escalated</div>
                  <div className="text-3xl text-red-600">{escalatedComplaints.length}</div>
                </Card>
                <Card className="p-4 bg-white border-l-4 border-orange-600">
                  <div className="text-sm text-gray-600 mb-1">Avg Days Pending</div>
                  <div className="text-3xl text-orange-600">
                    {(escalatedComplaints.reduce((sum, c) => sum + c.daysPending, 0) / escalatedComplaints.length).toFixed(0)}
                  </div>
                </Card>
                <Card className="p-4 bg-white border-l-4 border-purple-600">
                  <div className="text-sm text-gray-600 mb-1">Oldest Complaint</div>
                  <div className="text-3xl text-purple-600">
                    {Math.max(...escalatedComplaints.map(c => c.daysPending))} days
                  </div>
                </Card>
                <Card className="p-4 bg-white border-l-4 border-blue-600">
                  <div className="text-sm text-gray-600 mb-1">Affected Municipals</div>
                  <div className="text-3xl text-blue-600">
                    {new Set(escalatedComplaints.map(c => c.municipalId)).size}
                  </div>
                </Card>
              </div>

              {/* Complaints List */}
              <Card className="p-6 bg-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl">Escalated Complaints Details</h3>
                  <Badge className="bg-orange-100 text-orange-800 border-0">
                    Requires State Intervention
                  </Badge>
                </div>

                <div className="space-y-4">
                  {escalatedComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        {complaint.photo && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-red-300">
                            <img
                              src={complaint.photo}
                              alt={complaint.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-red-600 text-white border-0">
                                  #{complaint.id}
                                </Badge>
                                <Badge className="bg-orange-600 text-white border-0">
                                  {complaint.categoryName}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800 border-0">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {complaint.daysPending} days pending
                                </Badge>
                              </div>
                              <h4 className="text-lg mb-2">{complaint.title}</h4>
                              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                {complaint.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-red-200">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Municipal</div>
                              <div className="text-sm flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-blue-600" />
                                {complaint.municipalName}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Location</div>
                              <div className="text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-red-600" />
                                {complaint.location}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Submitted</div>
                              <div className="text-sm">
                                {new Date(complaint.submittedDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Community Votes</div>
                              <div className="text-sm flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-600" />
                                {complaint.votes} votes
                              </div>
                            </div>
                          </div>

                          {/* Escalation Warning */}
                          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-red-800">
                                <span className="font-semibold">Auto-escalated to State:</span> This complaint has exceeded
                                the 30-day resolution SLA. Municipal intervention has been insufficient. State-level action
                                may be required to ensure timely resolution.
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex items-center gap-3">
                            <Button
                              onClick={() => handleSeekExplanation(complaint)}
                              disabled={actionLoading === complaint.id}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {actionLoading === complaint.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <MessageSquare className="w-4 h-4 mr-2" />
                              )}
                              Seek Explanation
                            </Button>
                            <Button
                              onClick={() => handleMarkResolved(complaint)}
                              disabled={actionLoading === complaint.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === complaint.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                              )}
                              Mark Resolved
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* By Municipal Breakdown */}
              <Card className="p-6 bg-white shadow-xl">
                <h3 className="text-xl mb-6">Escalations by Municipal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(new Set(escalatedComplaints.map(c => c.municipalId))).map(municipalId => {
                    const munComplaints = escalatedComplaints.filter(c => c.municipalId === municipalId);
                    const municipal = munComplaints[0];
                    const avgDays = munComplaints.reduce((sum, c) => sum + c.daysPending, 0) / munComplaints.length;
                    
                    return (
                      <div
                        key={municipalId}
                        className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <h4 className="text-base">{municipal.municipalName}</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Escalated Count</span>
                            <Badge className="bg-red-600 text-white border-0">
                              {munComplaints.length}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Days Pending</span>
                            <span className="text-orange-600">{avgDays.toFixed(0)} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Oldest</span>
                            <span className="text-red-600">
                              {Math.max(...munComplaints.map(c => c.daysPending))} days
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6 bg-white shadow-xl">
              <div className="text-center py-16">
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl mb-2">No Escalated Complaints</h3>
                <p className="text-gray-600 mb-1">
                  All complaints are being resolved within the 30-day SLA
                </p>
                <p className="text-sm text-gray-500">
                  Excellent performance across all municipalities!
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedTab === "analytics" && (
        <div className="space-y-6">
          {/* Historical Trend */}
          {historicalTrends.length > 0 && (
            <Card className="p-6 bg-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl">Historical Complaint Trend & Resolution Performance</h2>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historicalTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="total"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Total Complaints"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="resolved"
                    stroke={colors.success}
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Resolved"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgDays"
                    stroke={colors.purple}
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Avg Resolution Days"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <Card className="p-6 bg-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl">2025 Forecast by Category</h2>
                <Badge className="bg-purple-100 text-purple-800 border-0">AI Predicted</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forecast.map((fc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base">{fc.categoryName}</h3>
                      <Badge className="bg-purple-600 text-white border-0 text-xs">
                        {fc.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="text-2xl text-purple-700">{fc.forecast2025.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-2">Predicted for 2025</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedTab === "compliance" && (
        <div className="space-y-6">
          <Card className="p-6 bg-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl">Municipal Performance Compliance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 bg-gray-50">Municipal</th>
                    <th className="text-right p-4 bg-gray-50">Performance Score</th>
                    <th className="text-right p-4 bg-gray-50">Resolution Rate</th>
                    <th className="text-right p-4 bg-gray-50">Avg Resolution Time</th>
                    <th className="text-center p-4 bg-gray-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {municipalStats.map((municipal) => {
                    const status =
                      municipal.score >= 85
                        ? "excellent"
                        : municipal.score >= 70
                        ? "good"
                        : "needs-improvement";
                    return (
                      <tr key={municipal.municipalId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">{municipal.municipalName}</td>
                        <td className="p-4 text-right">
                          <Badge
                            className={`${
                              municipal.score >= 85
                                ? "bg-green-100 text-green-800"
                                : municipal.score >= 70
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            } border-0`}
                          >
                            {municipal.score}%
                          </Badge>
                        </td>
                        <td className="p-4 text-right">{municipal.resolutionRate.toFixed(1)}%</td>
                        <td className="p-4 text-right">{municipal.avgResolutionTime.toFixed(1)} days</td>
                        <td className="p-4 text-center">
                          <Badge
                            className={`${
                              status === "excellent"
                                ? "bg-green-600"
                                : status === "good"
                                ? "bg-blue-600"
                                : "bg-orange-600"
                            } text-white border-0`}
                          >
                            {status === "excellent"
                              ? "Excellent"
                              : status === "good"
                              ? "Good"
                              : "Needs Improvement"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Performance Score Distribution */}
          <Card className="p-6 bg-white shadow-xl">
            <h2 className="text-xl mb-6">Performance Score Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={municipalStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="municipalName"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill={colors.primary} name="Performance Score" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

    </div>
  );
}