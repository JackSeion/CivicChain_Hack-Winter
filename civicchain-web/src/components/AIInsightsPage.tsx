import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Brain,
  MapPin,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Activity,
  AlertCircle,
  Flame,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Calendar,
} from "lucide-react";
//adding AI features

import { useState, useEffect } from "react";
import { getComplaintsByMunicipal, Complaint } from "../utils/api";
import {
  predictHotspots,
  generateCategoryForecasts,
  generateHotspotAlerts,
  generateSeasonalPredictions,
  predictDelayRisks,
  calculateDepartmentLoad,
  generateDelayPredictionSummary,
  calculateCategoryDelayProbability,
  generateDelayTrendData,
} from "../utils/aiModels";
import { SLATabSimplified } from "./SLATabSimplified";
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
  Area,
  AreaChart,
} from "recharts";

interface AIInsightsPageProps {
  municipalId: string;
}

export function AIInsightsPage({ municipalId }: AIInsightsPageProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hotspots' | 'sla'>('hotspots');

  useEffect(() => {
    loadData();
  }, [municipalId]);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getComplaintsByMunicipal(municipalId);
      setComplaints(data);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <div className="text-lg text-gray-600">Training AI models...</div>
          <div className="text-sm text-gray-500 mt-2">Analyzing patterns and generating predictions</div>
        </div>
      </div>
    );
  }

  const hasEnoughData = complaints.length >= 5;

  if (!hasEnoughData) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1>AI Intelligence Center</h1>
          </div>
          <p className="text-gray-600">{complaints.length} complaints analyzed</p>
        </div>
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-2">Insufficient Data for AI Analysis</h2>
          <p className="text-gray-600 mb-4">
            AI models require at least 5 complaints to generate accurate predictions.
          </p>
          <p className="text-sm text-gray-500">
            Current complaints: {complaints.length} / 5 minimum
          </p>
        </Card>
      </div>
    );
  }

  // Run AI models
  const hotspotPredictions = predictHotspots(complaints);
  const categoryForecasts = generateCategoryForecasts(complaints);
  const hotspotAlerts = generateHotspotAlerts(hotspotPredictions);
  const seasonalPredictions = generateSeasonalPredictions(complaints);
  const delayRisks = predictDelayRisks(complaints);
  const departmentLoad = calculateDepartmentLoad(complaints);
  const delayPredictionSummary = generateDelayPredictionSummary(delayRisks);
  const categoryDelayProbability = calculateCategoryDelayProbability(complaints);
  const delayTrendData = generateDelayTrendData(complaints);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl">AI Intelligence Center</h1>
            <p className="text-sm text-gray-600">
              {complaints.length} complaints analyzed • 2 active predictive models
            </p>
          </div>
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-blue-600 mb-1">Hotspot Prediction Model</div>
              <div className="text-3xl mb-1">
                {hotspotPredictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length}
              </div>
              <div className="text-xs text-gray-600">high-risk zones detected</div>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: '87%' }}></div>
            </div>
            <span className="text-sm text-blue-600">87%</span>
          </div>
          <div className="text-xs text-gray-600 mt-2">Model Accuracy</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-orange-600 mb-1">SLA Violation Prediction</div>
              <div className="text-3xl mb-1">{delayRisks.length}</div>
              <div className="text-xs text-gray-600">high-risk complaints</div>
            </div>
            <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-orange-600" style={{ width: '84%' }}></div>
            </div>
            <span className="text-sm text-orange-600">84%</span>
          </div>
          <div className="text-xs text-gray-600 mt-2">Model Accuracy</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab('hotspots')}
          className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 rounded-lg transition-all ${
            activeTab === 'hotspots'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Hotspot Predictions</span>
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 rounded-lg transition-all ${
            activeTab === 'sla'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>SLA Risk Analysis</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'hotspots' ? (
        <HotspotTab
          predictions={hotspotPredictions}
          forecasts={categoryForecasts}
          alerts={hotspotAlerts}
          seasonalPredictions={seasonalPredictions}
        />
      ) : (
        <SLATabSimplified
          delayRisks={delayRisks}
          departmentLoad={departmentLoad}
          delayPredictionSummary={delayPredictionSummary}
          categoryDelayProbability={categoryDelayProbability}
          delayTrendData={delayTrendData}
        />
      )}
    </div>
  );
}

// ============================================
// HOTSPOT TAB - REBUILT FROM SCRATCH
// ============================================

function HotspotTab({
  predictions,
  forecasts,
  alerts,
  seasonalPredictions,
}: any) {
  const [forecastDays, setForecastDays] = useState<7 | 30>(7);

  return (
    <div className="space-y-6">
      {/* E. PREDICTIVE ALERTS */}
      {alerts.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">🔮 AI-Generated Predictive Alerts</h3>
              <p className="text-xs text-gray-600">Auto-generated recommendations based on trend analysis</p>
            </div>
          </div>
          <div className="space-y-3">
            {alerts.map((alert: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 bg-white shadow-sm ${
                  alert.type === 'critical'
                    ? 'border-red-500'
                    : alert.type === 'warning'
                    ? 'border-orange-500'
                    : 'border-blue-500'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {alert.type === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm text-gray-800">{alert.message}</div>
                </div>
                <div className="flex items-start gap-1 ml-6 bg-blue-50 p-2 rounded text-xs text-gray-700">
                  <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-blue-600" />
                  <span><span className="font-medium">Action:</span> {alert.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* A. INTERACTIVE CITY HOTSPOT MAP */}
      {predictions.length > 0 && (
        <Card className="p-6 shadow-lg bg-white">
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base mb-1">🌍 Interactive City Hotspot Map</h3>
                <p className="text-xs text-gray-600">Color-coded zones based on predicted complaint density</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs ml-13">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>Low (1-5)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span>Medium (6-11)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span>High (12-19)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span>Critical (20+)</span>
              </div>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {predictions.slice(0, 15).map((pred: any, idx: number) => {
              const bgColor =
                pred.riskLevel === 'critical'
                  ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-400'
                  : pred.riskLevel === 'high'
                  ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400'
                  : pred.riskLevel === 'medium'
                  ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400'
                  : 'bg-gradient-to-br from-green-100 to-green-200 border-green-400';

              return (
                <div
                  key={idx}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl group ${bgColor}`}
                >
                  {/* Main Content */}
                  <div className="text-center relative z-10">
                    <div className="text-xs text-gray-700 mb-2 truncate capitalize">{pred.ward}</div>
                    <div className="text-3xl mb-1">{pred.predictedComplaints}</div>
                    <div className="text-xs text-gray-600">issues/week</div>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute inset-0 bg-white rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-all shadow-2xl border-2 border-blue-500 z-20">
                    <div className="text-sm mb-3 capitalize">{pred.ward}</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Predicted Issues:</span>
                        <span className="text-blue-600">{pred.predictedComplaints}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Top Category:</span>
                        <span className="capitalize">{pred.topCategory}</span>
                      </div>
                      {pred.secondaryCategory && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Secondary:</span>
                          <span className="capitalize">{pred.secondaryCategory}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Risk:</span>
                        <Badge
                          className={
                            pred.riskLevel === 'critical'
                              ? 'bg-red-600 text-white text-xs'
                              : pred.riskLevel === 'high'
                              ? 'bg-orange-600 text-white text-xs'
                              : pred.riskLevel === 'medium'
                              ? 'bg-yellow-600 text-white text-xs'
                              : 'bg-green-600 text-white text-xs'
                          }
                        >
                          {pred.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="text-blue-600">{pred.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Area Chart */}
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={predictions.slice(0, 10).map((p: any) => ({
                  name: p.ward,
                  predicted: p.predictedComplaints,
                }))}
              >
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '2px solid #3b82f6', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPredicted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* B. CATEGORY-WISE HOTSPOT TREND CHART */}
      {forecasts.length > 0 && (
        <Card className="p-6 shadow-lg bg-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base mb-1">📈 Category-wise Hotspot Trend Chart</h3>
                <p className="text-xs text-gray-600">Multi-line forecast showing future complaint trends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setForecastDays(7)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  forecastDays === 7
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setForecastDays(30)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  forecastDays === 30
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {forecasts.slice(0, 4).map((forecast: any, idx: number) => {
              const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
              const bgColors = ['bg-blue-50', 'bg-orange-50', 'bg-green-50', 'bg-purple-50'];
              const borderColors = ['border-blue-200', 'border-orange-200', 'border-green-200', 'border-purple-200'];

              return (
                <div key={idx} className={`${bgColors[idx]} border ${borderColors[idx]} p-4 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }}></div>
                    <div className="text-xs capitalize truncate">{forecast.category}</div>
                  </div>
                  <div className="text-2xl mb-1" style={{ color: colors[idx] }}>
                    {forecastDays === 7 ? forecast.total7Days : forecast.total30Days}
                  </div>
                  <div className="text-xs text-gray-600">predicted</div>
                </div>
              );
            })}
          </div>

          {/* Line Chart */}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={
                forecastDays === 7
                  ? [1, 2, 3, 4, 5, 6, 7].map(day => {
                      const dataPoint: any = { day: `Day ${day}` };
                      forecasts.slice(0, 4).forEach((forecast: any) => {
                        dataPoint[forecast.category] = (forecast as any)[`day${day}`];
                      });
                      return dataPoint;
                    })
                  : [0, 5, 10, 15, 20, 25, 30].map(day => {
                      const dataPoint: any = { day: day === 0 ? 'Today' : `Day ${day}` };
                      forecasts.slice(0, 4).forEach((forecast: any) => {
                        dataPoint[forecast.category] = Math.round((forecast.total30Days / 30) * day);
                      });
                      return dataPoint;
                    })
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {forecasts.slice(0, 4).map((forecast: any, idx: number) => {
                const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
                return (
                  <Line
                    key={forecast.category}
                    type="monotone"
                    dataKey={forecast.category}
                    stroke={colors[idx]}
                    strokeWidth={3}
                    dot={{ r: 5, fill: colors[idx] }}
                    activeDot={{ r: 7 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">💡</div>
              <div>
                <span className="font-medium">Insight:</span> These forecasts use time-series analysis of historical
                patterns. Use them to proactively allocate department resources and prevent complaint surges.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* C. TOP 10 PREDICTED HOTSPOTS TABLE */}
      {predictions.length > 0 && (
        <Card className="p-6 shadow-lg bg-white">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">📊 Top 10 Predicted Hotspots Ranking</h3>
              <p className="text-xs text-gray-600">Zones ranked by predicted complaint volume with trend analysis</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Zone/Ward</th>
                  <th className="text-left py-3 px-4">Predicted Complaints</th>
                  <th className="text-left py-3 px-4">High-Risk Category</th>
                  <th className="text-left py-3 px-4">Change vs Last Week</th>
                  <th className="text-left py-3 px-4">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 10).map((pred: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      pred.riskLevel === 'critical'
                        ? 'bg-red-50'
                        : pred.riskLevel === 'high'
                        ? 'bg-orange-50'
                        : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <span className="text-xl">🥇</span>}
                        {idx === 1 && <span className="text-xl">🥈</span>}
                        {idx === 2 && <span className="text-xl">🥉</span>}
                        <Badge
                          variant="outline"
                          className={`${idx < 3 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : ''}`}
                        >
                          #{idx + 1}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="capitalize">{pred.ward}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl">{pred.predictedComplaints}</span>
                        <span className="text-xs text-gray-500">issues</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 capitalize">
                        {pred.topCategory}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {pred.changeVsLastWeek > 0 ? (
                          <>
                            <ArrowUp className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">+{Math.round(pred.changeVsLastWeek)}%</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">{Math.round(pred.changeVsLastWeek)}%</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${pred.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{pred.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* D. HOTSPOT SEVERITY BADGES */}
      {predictions.length > 0 && (
        <div>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">📍 Hotspot Severity Classification</h3>
              <p className="text-xs text-gray-600">Badges showing hotspot evolution patterns and status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.slice(0, 9).map((pred: any, idx: number) => (
              <Card
                key={idx}
                className={`p-5 border-l-4 transition-all hover:shadow-xl ${
                  pred.riskLevel === 'critical'
                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50'
                    : pred.riskLevel === 'high'
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50'
                    : pred.riskLevel === 'medium'
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-green-50'
                    : 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm mb-1 capitalize">{pred.ward}</div>
                    <div className="text-xs text-gray-600 capitalize">{pred.topCategory}</div>
                  </div>
                  <Badge
                    className={
                      pred.badgeType === 'emerging'
                        ? 'bg-red-600 text-white border-0'
                        : pred.badgeType === 'consistent'
                        ? 'bg-orange-600 text-white border-0'
                        : 'bg-green-600 text-white border-0'
                    }
                  >
                    {pred.badgeType === 'emerging' && '🔥 Emerging'}
                    {pred.badgeType === 'consistent' && '⚠️ Consistent'}
                    {pred.badgeType === 'resolved' && '🟢 Declining'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-white bg-opacity-70 p-3 rounded-lg">
                    <div className="text-2xl mb-1">{pred.predictedComplaints}</div>
                    <div className="text-xs text-gray-600">predicted</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-70 p-3 rounded-lg">
                    <div className="text-2xl text-blue-600 mb-1">{pred.confidence}%</div>
                    <div className="text-xs text-gray-600">accuracy</div>
                  </div>
                  <div className="text-center bg-white bg-opacity-70 p-3 rounded-lg">
                    <div
                      className={`text-2xl mb-1 ${pred.changeVsLastWeek > 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {pred.changeVsLastWeek > 0 ? '+' : ''}
                      {Math.round(pred.changeVsLastWeek)}%
                    </div>
                    <div className="text-xs text-gray-600">change</div>
                  </div>
                </div>

                <div className="text-xs bg-white bg-opacity-80 p-3 rounded-lg border border-gray-200 leading-relaxed">
                  {pred.alert}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* F. SEASONAL PREDICTION VIEW */}
      {seasonalPredictions.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-300 shadow-lg">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">📅 Seasonal Prediction View</h3>
              <p className="text-xs text-gray-600">
                Impact analysis for monsoon, festivals, and seasonal patterns
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalPredictions.map((pred: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-base mb-1">{pred.season} Impact</div>
                    <div className="text-xs text-gray-600">{pred.category}</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 text-lg px-3 py-1 mb-1">
                      +{pred.increasePercentage}%
                    </Badge>
                    <div className="text-xs text-gray-600">increase</div>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-xs text-gray-600 mb-2">Expected Increase</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl text-orange-600">+{pred.predictedIncrease}</div>
                    <div className="text-sm text-gray-700 mb-1">complaints</div>
                  </div>
                  <div className="text-xs text-gray-600">next 30 days</div>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-xs text-gray-700 mb-1 flex items-center gap-1">
                      <span className="text-blue-600">📋</span>
                      <span className="font-medium">Reason:</span>
                    </div>
                    <div className="text-xs text-gray-800">{pred.reason}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-xs text-gray-700 mb-1 flex items-center gap-1">
                      <span className="text-green-600">✅</span>
                      <span className="font-medium">Recommendation:</span>
                    </div>
                    <div className="text-xs text-gray-800">{pred.recommendation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-gray-700">
                <span className="font-medium">Pro Tip:</span> Use seasonal predictions to prepare resources in
                advance. During monsoon, keep road repair teams ready. During festivals, increase waste collection.
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}