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
} from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "../utils/api";
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
    | "escalations"
    | "analytics"
    | "compliance"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [stateStats, setStateStats] = useState<api.StateStats | null>(null);
  const [municipalStats, setMunicipalStats] = useState<api.MunicipalStats[]>([]);
  const [deptPerformance, setDeptPerformance] = useState<api.StateDepartmentPerformance[]>([]);
  const [historicalTrends, setHistoricalTrends] = useState<api.YearlyTrend[]>([]);
  const [forecast, setForecast] = useState<api.CategoryForecast[]>([]);

  useEffect(() => {
    loadStateData();
  }, [stateId]);

  const loadStateData = async () => {
    try {
      setLoading(true);
      const [stats, munStats, deptPerf, trends, forecastData] = await Promise.all([
        api.getStateStats(stateId),
        api.getMunicipalStatsForState(stateId),
        api.getStateDepartmentPerformance(stateId),
        api.getStateHistoricalTrends(stateId),
        api.getStateForecast(stateId),
      ]);
      setStateStats(stats);
      setMunicipalStats(munStats);
      setDeptPerformance(deptPerf);
      setHistoricalTrends(trends);
      setForecast(forecastData);
    } catch (error) {
      console.error('Error loading state data:', error);
    } finally {
      setLoading(false);
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

  // Calculate escalations (municipalities with low performance or high pending)
  const escalations = municipalStats.filter(
    (m) => m.score < 70 || m.pending > (m.totalComplaints * 0.3)
  );

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
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-md">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-sm text-green-800">All Systems Operational</span>
            <Badge className="bg-green-600 text-white border-0 text-xs">Live</Badge>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
            Real-time Data
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-2 flex flex-wrap gap-2">
        {[
          { id: "overview", label: "Statewide Overview", icon: BarChart3 },
          { id: "comparison", label: "Municipal Comparison", icon: Target },
          { id: "departments", label: "Departments", icon: Users },
          { id: "escalations", label: "Risk Monitoring", icon: AlertTriangle },
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

      {selectedTab === "escalations" && (
        <div className="space-y-6">
          {escalations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {escalations.map((municipal, idx) => {
                const severity =
                  municipal.score < 60 || municipal.pending > municipal.totalComplaints * 0.4
                    ? "critical"
                    : "high";
                const issue =
                  municipal.score < 60
                    ? "Low overall performance score"
                    : "High pending complaint load";
                const pendingRate = (municipal.pending / municipal.totalComplaints) * 100;

                return (
                  <Card
                    key={idx}
                    className={`p-6 border-l-4 ${
                      severity === "critical"
                        ? "border-red-500 bg-red-50"
                        : "border-orange-500 bg-orange-50"
                    } shadow-xl`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            severity === "critical" ? "bg-red-600" : "bg-orange-600"
                          }`}
                        >
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base mb-1">{municipal.municipalName}</h3>
                          <Badge
                            className={`${
                              severity === "critical" ? "bg-red-600" : "bg-orange-600"
                            } text-white border-0 text-xs`}
                          >
                            {severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-base mb-2">{issue}</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        Performance Score: {municipal.score}% • Pending: {municipal.pending} (
                        {pendingRate.toFixed(0)}%)
                      </p>
                      <p className="text-sm text-gray-700">
                        Average resolution time: {municipal.avgResolutionTime.toFixed(1)} days
                      </p>
                      {municipal.score < 60 && (
                        <p className="text-sm text-gray-700">
                          Recommendation: Immediate resource allocation and performance review required.
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 bg-white shadow-xl">
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl mb-2">No Critical Issues</h3>
                <p className="text-gray-600">All municipalities are performing within acceptable parameters.</p>
              </div>
            </Card>
          )}

          {/* High Pressure Zones */}
          <Card className="p-6 bg-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl">High-Pressure Zones</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {municipalStats
                .filter(
                  (m) =>
                    m.pending > m.totalComplaints * 0.25 || m.score < 75
                )
                .map((municipal) => (
                  <div
                    key={municipal.municipalId}
                    className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200"
                  >
                    <h3 className="text-base mb-3">{municipal.municipalName}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pending Load</span>
                        <span className="text-red-600">{municipal.pending}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Performance</span>
                        <span className="text-orange-600">{municipal.score}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Resolution</span>
                        <span>{municipal.avgResolutionTime.toFixed(1)} days</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
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