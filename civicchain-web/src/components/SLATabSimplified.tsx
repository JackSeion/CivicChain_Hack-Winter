import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Clock,
  Activity,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SLATabProps {
  delayRisks: any[];
  departmentLoad: any[];
  delayPredictionSummary: any;
  categoryDelayProbability: any[];
  delayTrendData: any[];
}

export function SLATabSimplified({
  delayRisks,
  departmentLoad,
  delayPredictionSummary,
  categoryDelayProbability,
  delayTrendData,
}: SLATabProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  if (!delayRisks || delayRisks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl mb-2">No Pending Complaints</h2>
        <p className="text-gray-600">All complaints are being handled on time!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3. PREDICTED DELAY COUNT BOX */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-red-600 mb-1">Likely to Delay Today</div>
              <div className="text-4xl mb-1">{delayPredictionSummary.likelyToDelayToday}</div>
              <div className="text-xs text-gray-600">complaints</div>
            </div>
            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-orange-600 mb-1">This Week's Predicted Delays</div>
              <div className="text-4xl mb-1">{delayPredictionSummary.thisWeekPredictedDelays}</div>
              <div className="text-xs text-gray-600">complaints</div>
            </div>
            <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-yellow-600 mb-1">High Risk Complaints</div>
              <div className="text-4xl mb-1">{delayPredictionSummary.highRiskComplaints}</div>
              <div className="text-xs text-gray-600">complaints</div>
            </div>
            <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* 1. COMPLAINT DELAY RISK TABLE */}
      <Card className="p-6 shadow-lg bg-white">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base mb-1">📍 Complaint Delay Risk Table</h3>
            <p className="text-xs text-gray-600">Main view showing delay risk for all pending complaints</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-4">Complaint ID</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Assigned Team</th>
                <th className="text-left py-3 px-4">Risk of Delay</th>
                <th className="text-left py-3 px-4">Current Status</th>
                <th className="text-left py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {delayRisks.slice(0, 15).map((risk: any, idx: number) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    risk.riskLevel === 'high'
                      ? 'bg-red-50'
                      : risk.riskLevel === 'medium'
                      ? 'bg-yellow-50'
                      : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <Badge variant="outline">#{risk.complaintId}</Badge>
                  </td>
                  <td className="py-4 px-4 capitalize">{risk.category}</td>
                  <td className="py-4 px-4">{risk.assignedTeam}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {risk.riskLevel === 'high' ? (
                        <span className="text-lg">🔴</span>
                      ) : risk.riskLevel === 'medium' ? (
                        <span className="text-lg">🟡</span>
                      ) : (
                        <span className="text-lg">🟢</span>
                      )}
                      <Badge
                        className={
                          risk.riskLevel === 'high'
                            ? 'bg-red-600 text-white border-0'
                            : risk.riskLevel === 'medium'
                            ? 'bg-yellow-600 text-white border-0'
                            : 'bg-green-600 text-white border-0'
                        }
                      >
                        {risk.riskLevel.toUpperCase()} ({risk.riskOfDelay}%)
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="capitalize">
                      {risk.currentStatus.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedComplaint(risk)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2. DEPARTMENT LOAD CHART */}
      {departmentLoad.length > 0 && (
        <Card className="p-6 shadow-lg bg-white">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">🔥 Department Load Chart</h3>
              <p className="text-xs text-gray-600">
                Shows which departments are overloaded - high load + slow speed = high delay risk
              </p>
            </div>
          </div>

          {/* Table View */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Current Open Complaints</th>
                  <th className="text-left py-3 px-4">Avg Time to Resolve</th>
                  <th className="text-left py-3 px-4">Delay Risk</th>
                </tr>
              </thead>
              <tbody>
                {departmentLoad.map((dept: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`border-b hover:bg-gray-50 ${
                      dept.delayRisk === 'high'
                        ? 'bg-red-50'
                        : dept.delayRisk === 'medium'
                        ? 'bg-yellow-50'
                        : ''
                    }`}
                  >
                    <td className="py-4 px-4">{dept.department}</td>
                    <td className="py-4 px-4">
                      <div className="text-2xl">{dept.currentOpenComplaints}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xl">{dept.avgTimeToResolve} days</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={
                          dept.delayRisk === 'high'
                            ? 'bg-red-600 text-white border-0'
                            : dept.delayRisk === 'medium'
                            ? 'bg-yellow-600 text-white border-0'
                            : 'bg-green-600 text-white border-0'
                        }
                      >
                        {dept.delayRisk.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart View */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentLoad}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="currentOpenComplaints" fill="#f59e0b" name="Open Complaints" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 4. DELAY TREND CHART */}
      {delayTrendData.length > 0 && (
        <Card className="p-6 shadow-lg bg-white">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">⏳ Delay Trend Chart (Past vs Predicted)</h3>
              <p className="text-xs text-gray-600">
                Historical vs predicted resolution time - gives officers a quick idea of weekly performance
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={delayTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="historicalAvg"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#3b82f6' }}
                name="Historical Average"
              />
              <Line
                type="monotone"
                dataKey="predictedAvg"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b' }}
                strokeDasharray="5 5"
                name="Predicted Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 5. CATEGORY-WISE DELAY PROBABILITY */}
      {categoryDelayProbability.length > 0 && (
        <Card className="p-6 shadow-lg bg-white">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base mb-1">🟨 Category-Wise Delay Probability</h3>
              <p className="text-xs text-gray-600">Useful for planning workforce allocation</p>
            </div>
          </div>

          {/* Table View */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Delay Probability</th>
                  <th className="text-left py-3 px-4">Avg Resolution Days</th>
                </tr>
              </thead>
              <tbody>
                {categoryDelayProbability.map((cat: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 capitalize">{cat.category}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-[200px]">
                          <div
                            className={`h-3 rounded-full ${
                              cat.delayProbability >= 60
                                ? 'bg-red-500'
                                : cat.delayProbability >= 40
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${cat.delayProbability}%` }}
                          ></div>
                        </div>
                        <span className="text-lg">{cat.delayProbability}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xl">{cat.avgResolutionDays}</span> days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDelayProbability}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, delayProbability }) => `${category}: ${delayProbability}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="delayProbability"
              >
                {categoryDelayProbability.map((entry: any, index: number) => {
                  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 6. COMPLAINT DETAILS POPUP */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl mb-2">Complaint #{selectedComplaint.complaintId}</h3>
                  <Badge className="bg-blue-100 text-blue-700 capitalize">{selectedComplaint.category}</Badge>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Department</div>
                  <div className="text-base">{selectedComplaint.assignedTeam}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        selectedComplaint.riskLevel === 'high'
                          ? 'bg-red-600 text-white border-0 text-base px-3 py-1'
                          : selectedComplaint.riskLevel === 'medium'
                          ? 'bg-yellow-600 text-white border-0 text-base px-3 py-1'
                          : 'bg-green-600 text-white border-0 text-base px-3 py-1'
                      }
                    >
                      {selectedComplaint.riskLevel.toUpperCase()} ({selectedComplaint.riskOfDelay}%)
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Days Pending</div>
                  <div className="text-2xl">{selectedComplaint.daysPending} days</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Reasons for High Risk:</div>
                  <ul className="space-y-2">
                    {selectedComplaint.reasons.map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💡 <span className="font-medium">Tip:</span> This transparency helps officers understand why
                    certain complaints are flagged as high-risk and prioritize accordingly.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
