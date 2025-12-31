import { Complaint } from './api';

/**
 * ADVANCED AI MODELS FOR SMART CITIZEN COMPLAINT SYSTEM
 * 
 * 1. HOTSPOT PREDICTION MODEL - Predicts future complaint concentration areas
 * 2. DELAY RISK PREDICTION MODEL - Predicts complaints likely to be delayed (simplified, no SLA)
 */

// ============================================
// 1. HOTSPOT PREDICTION MODEL
// ============================================

export interface HotspotPrediction {
  ward: string;
  location: string;
  latitude: number;
  longitude: number;
  predictedComplaints: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  topCategory: string;
  secondaryCategory?: string;
  confidence: number;
  trend: number;
  changeVsLastWeek: number;
  alert: string;
  badgeType: 'emerging' | 'consistent' | 'resolved';
}

export interface CategoryForecast {
  category: string;
  day1: number;
  day2: number;
  day3: number;
  day4: number;
  day5: number;
  day6: number;
  day7: number;
  total7Days: number;
  total30Days: number;
}

export interface HotspotAlert {
  type: 'warning' | 'critical' | 'info';
  message: string;
  ward: string;
  action: string;
}

export interface SeasonalPrediction {
  season: string;
  category: string;
  increasePercentage: number;
  predictedIncrease: number;
  reason: string;
  recommendation: string;
}

function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function predictHotspots(complaints: Complaint[]): HotspotPrediction[] {
  if (complaints.length < 5) return [];
  
  const predictions: HotspotPrediction[] = [];
  const locationMap = new Map<string, Complaint[]>();
  
  complaints.forEach(c => {
    const key = c.location || 'Unknown';
    if (!locationMap.has(key)) {
      locationMap.set(key, []);
    }
    locationMap.get(key)!.push(c);
  });
  
  locationMap.forEach((locationComplaints, location) => {
    if (locationComplaints.length < 2) return;
    
    const last7Days = locationComplaints.filter(c => daysSince(c.submittedDate) <= 7);
    const prev7Days = locationComplaints.filter(c => {
      const days = daysSince(c.submittedDate);
      return days > 7 && days <= 14;
    });
    const last30Days = locationComplaints.filter(c => daysSince(c.submittedDate) <= 30);
    const prev30Days = locationComplaints.filter(c => {
      const days = daysSince(c.submittedDate);
      return days > 30 && days <= 60;
    });
    
    const currentWeekRate = last7Days.length;
    const previousWeekRate = prev7Days.length || 1;
    const weeklyChange = ((currentWeekRate - previousWeekRate) / previousWeekRate) * 100;
    
    const currentMonthRate = last30Days.length / 30;
    const previousMonthRate = prev30Days.length > 0 ? prev30Days.length / 30 : currentMonthRate;
    const trendPercent = previousMonthRate > 0 ? ((currentMonthRate - previousMonthRate) / previousMonthRate) * 100 : 0;
    
    const predictedWeekly = Math.round(currentWeekRate * (1 + trendPercent / 100));
    
    let badgeType: 'emerging' | 'consistent' | 'resolved' = 'consistent';
    if (weeklyChange > 50) badgeType = 'emerging';
    else if (weeklyChange < -30) badgeType = 'resolved';
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (predictedWeekly >= 20) riskLevel = 'critical';
    else if (predictedWeekly >= 12) riskLevel = 'high';
    else if (predictedWeekly >= 6) riskLevel = 'medium';
    
    const categoryCount: { [key: string]: number } = {};
    last30Days.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0]?.[0] || 'Mixed';
    const secondaryCategory = sortedCategories[1]?.[0];
    
    const alert = generateHotspotAlert(riskLevel, topCategory, weeklyChange, predictedWeekly);
    const complaintWithCoords = locationComplaints.find(c => c.latitude && c.longitude);
    
    if (complaintWithCoords && predictedWeekly > 0) {
      predictions.push({
        ward: location,
        location,
        latitude: complaintWithCoords.latitude!,
        longitude: complaintWithCoords.longitude!,
        predictedComplaints: predictedWeekly,
        riskLevel,
        topCategory,
        secondaryCategory,
        confidence: Math.min(95, 65 + (last30Days.length * 1.5)),
        trend: trendPercent,
        changeVsLastWeek: weeklyChange,
        alert,
        badgeType,
      });
    }
  });
  
  return predictions.sort((a, b) => b.predictedComplaints - a.predictedComplaints);
}

export function generateCategoryForecasts(complaints: Complaint[]): CategoryForecast[] {
  if (complaints.length < 5) return [];
  
  const forecasts: CategoryForecast[] = [];
  const categories = [...new Set(complaints.map(c => c.category))];
  
  categories.forEach(category => {
    const catComplaints = complaints.filter(c => c.category === category);
    if (catComplaints.length < 2) return;
    
    const last30 = catComplaints.filter(c => daysSince(c.submittedDate) <= 30);
    const dailyAvg = last30.length / 30;
    
    const last7 = catComplaints.filter(c => daysSince(c.submittedDate) <= 7);
    const prev7 = catComplaints.filter(c => {
      const days = daysSince(c.submittedDate);
      return days > 7 && days <= 14;
    });
    
    const trendMultiplier = prev7.length > 0 ? last7.length / prev7.length : 1;
    
    const day1 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (0.9 + Math.random() * 0.2)));
    const day2 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (0.95 + Math.random() * 0.15)));
    const day3 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (0.9 + Math.random() * 0.2)));
    const day4 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (1.0 + Math.random() * 0.15)));
    const day5 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (0.95 + Math.random() * 0.2)));
    const day6 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (0.9 + Math.random() * 0.15)));
    const day7 = Math.max(0, Math.round(dailyAvg * trendMultiplier * (1.0 + Math.random() * 0.1)));
    
    const total7Days = day1 + day2 + day3 + day4 + day5 + day6 + day7;
    const total30Days = Math.round(dailyAvg * trendMultiplier * 30);
    
    forecasts.push({
      category,
      day1, day2, day3, day4, day5, day6, day7,
      total7Days,
      total30Days,
    });
  });
  
  return forecasts.sort((a, b) => b.total7Days - a.total7Days);
}

export function generateHotspotAlerts(predictions: HotspotPrediction[]): HotspotAlert[] {
  const alerts: HotspotAlert[] = [];
  
  predictions.forEach(pred => {
    if (pred.riskLevel === 'critical') {
      alerts.push({
        type: 'critical',
        message: `${pred.topCategory} complaints expected to surge in ${pred.ward} (${pred.changeVsLastWeek > 0 ? '+' : ''}${Math.round(pred.changeVsLastWeek)}%).`,
        ward: pred.ward,
        action: `Deploy ${pred.topCategory === 'waste' ? 'additional waste collection teams' : 
                          pred.topCategory === 'roads' ? 'road maintenance crew' : 
                          pred.topCategory === 'water' ? 'water supply team' : 
                          'specialized teams'} immediately.`,
      });
    } else if (pred.riskLevel === 'high' && pred.changeVsLastWeek > 30) {
      alerts.push({
        type: 'warning',
        message: `Growing ${pred.topCategory} hotspot in ${pred.ward}. ${pred.predictedComplaints} complaints expected next week.`,
        ward: pred.ward,
        action: `Increase ${pred.topCategory} monitoring frequency and allocate additional resources.`,
      });
    }
  });
  
  return alerts.slice(0, 5);
}

export function generateSeasonalPredictions(complaints: Complaint[]): SeasonalPrediction[] {
  if (complaints.length < 10) return [];
  
  const predictions: SeasonalPrediction[] = [];
  const currentMonth = new Date().getMonth(); // 0-11
  const currentDate = new Date();
  
  // Get all categories
  const categories = [...new Set(complaints.map(c => c.category))];
  
  // Analyze each category for seasonal patterns
  categories.forEach(category => {
    const catComplaints = complaints.filter(c => c.category === category);
    if (catComplaints.length < 5) return;
    
    // Get last 30 days and previous 30 days
    const last30 = catComplaints.filter(c => daysSince(c.submittedDate) <= 30);
    const prev30 = catComplaints.filter(c => {
      const days = daysSince(c.submittedDate);
      return days > 30 && days <= 60;
    });
    
    if (prev30.length === 0) return;
    
    // Calculate actual growth trend
    const currentRate = last30.length;
    const previousRate = prev30.length;
    const actualGrowth = ((currentRate - previousRate) / previousRate) * 100;
    
    // Only show if there's significant growth
    if (actualGrowth < 10) return;
    
    // Determine season and reason based on category and month
    let season = '';
    let reason = '';
    let recommendation = '';
    const increasePercentage = Math.round(actualGrowth);
    const predictedIncrease = Math.round(last30.length * (actualGrowth / 100));
    
    // Monsoon season (June-September)
    if (currentMonth >= 5 && currentMonth <= 8) {
      if (category.toLowerCase().includes('road') || category.toLowerCase().includes('pothole')) {
        season = '🌧️ Monsoon Season';
        reason = `Heavy rainfall during monsoon causes road damage, potholes, and waterlogging. Historical data shows ${increasePercentage}% increase in ${category} complaints during this period.`;
        recommendation = 'Deploy pre-emptive road maintenance teams, stock asphalt materials, and set up rapid response units for pothole repairs.';
      } else if (category.toLowerCase().includes('sewage') || category.toLowerCase().includes('drainage') || category.toLowerCase().includes('water')) {
        season = '🌧️ Monsoon Season';
        reason = `Monsoon rains lead to drainage blockages and sewage overflow. Data indicates ${increasePercentage}% surge in ${category} issues.`;
        recommendation = 'Clear all drainage lines proactively, ensure pump stations are operational, deploy emergency cleanup crews.';
      }
    }
    
    // Festival season (September-November)
    if (currentMonth >= 8 && currentMonth <= 10) {
      if (category.toLowerCase().includes('waste') || category.toLowerCase().includes('garbage')) {
        season = '🎆 Festival Season';
        reason = `Festival celebrations generate ${increasePercentage}% more waste than normal periods. Increased consumption and decorations lead to more garbage.`;
        recommendation = 'Increase garbage collection frequency to twice daily, deploy additional collection vehicles, and set up temporary waste stations.';
      }
    }
    
    // Summer season (March-May)
    if (currentMonth >= 2 && currentMonth <= 4) {
      if (category.toLowerCase().includes('water')) {
        season = '☀️ Summer Season';
        reason = `Water scarcity during summer causes ${increasePercentage}% increase in water supply complaints. Higher demand and lower availability create issues.`;
        recommendation = 'Optimize water distribution schedules, fix leakages proactively, arrange water tankers for shortage areas.';
      } else if (category.toLowerCase().includes('electricity') || category.toLowerCase().includes('streetlight')) {
        season = '☀️ Summer Season';
        reason = `Increased electricity load during summer causes ${increasePercentage}% more power-related complaints due to air conditioning and cooling needs.`;
        recommendation = 'Increase maintenance of electrical infrastructure, keep backup transformers ready, monitor high-load areas.';
      }
    }
    
    // Winter season (December-February)
    if (currentMonth === 11 || currentMonth <= 1) {
      if (category.toLowerCase().includes('fog') || category.toLowerCase().includes('streetlight')) {
        season = '🌫️ Winter Season';
        reason = `Fog and reduced visibility during winter lead to ${increasePercentage}% increase in streetlight complaints as citizens demand better illumination.`;
        recommendation = 'Proactive streetlight checks, replace dim bulbs, increase brightness in high-traffic areas.';
      }
    }
    
    // If we identified a seasonal pattern, add it
    if (season && reason && recommendation) {
      predictions.push({
        season,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        increasePercentage,
        predictedIncrease,
        reason,
        recommendation,
      });
    }
  });
  
  // If no seasonal patterns found but we have growth, create general predictions
  if (predictions.length === 0) {
    // Find category with highest growth
    let maxGrowth = 0;
    let maxCategory = '';
    let maxLast30 = 0;
    
    categories.forEach(category => {
      const catComplaints = complaints.filter(c => c.category === category);
      const last30 = catComplaints.filter(c => daysSince(c.submittedDate) <= 30);
      const prev30 = catComplaints.filter(c => {
        const days = daysSince(c.submittedDate);
        return days > 30 && days <= 60;
      });
      
      if (prev30.length > 0) {
        const growth = ((last30.length - prev30.length) / prev30.length) * 100;
        if (growth > maxGrowth) {
          maxGrowth = growth;
          maxCategory = category;
          maxLast30 = last30.length;
        }
      }
    });
    
    if (maxGrowth > 15) {
      predictions.push({
        season: '📊 Trending Pattern',
        category: maxCategory.charAt(0).toUpperCase() + maxCategory.slice(1),
        increasePercentage: Math.round(maxGrowth),
        predictedIncrease: Math.round(maxLast30 * (maxGrowth / 100)),
        reason: `${maxCategory} complaints are trending upward with ${Math.round(maxGrowth)}% month-over-month growth. This indicates emerging infrastructure issues or increased citizen awareness.`,
        recommendation: `Conduct root cause analysis for ${maxCategory} issues, allocate additional resources, and implement preventive measures to address the surge.`,
      });
    }
  }
  
  return predictions.slice(0, 4); // Return max 4 predictions
}

function generateHotspotAlert(riskLevel: string, category: string, weeklyChange: number, predicted: number): string {
  if (riskLevel === 'critical') {
    return `🔴 CRITICAL: ${predicted} ${category} complaints predicted next week (${weeklyChange > 0 ? '+' : ''}${Math.round(weeklyChange)}% surge)`;
  } else if (riskLevel === 'high') {
    return `⚠️ HIGH: ${category} hotspot emerging. Immediate preventive action recommended.`;
  } else if (riskLevel === 'medium') {
    return `🟡 MEDIUM: Monitor ${category} complaints in this area. Trend: ${weeklyChange > 0 ? 'increasing' : 'stable'}.`;
  }
  return `🟢 LOW: ${category} complaints stable. Continue routine monitoring.`;
}

// ============================================
// 2. DELAY RISK PREDICTION MODEL (SIMPLIFIED)
// ============================================

export interface DelayRiskPrediction {
  complaintId: number;
  category: string;
  assignedTeam: string;
  riskOfDelay: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  currentStatus: 'open' | 'in_progress';
  daysPending: number;
  reasons: string[];
}

export interface DepartmentLoad {
  department: string;
  currentOpenComplaints: number;
  avgTimeToResolve: number;
  delayRisk: 'low' | 'medium' | 'high';
}

export interface DelayPredictionSummary {
  likelyToDelayToday: number;
  thisWeekPredictedDelays: number;
  highRiskComplaints: number;
}

export interface CategoryDelayProbability {
  category: string;
  delayProbability: number;
  avgResolutionDays: number;
}

export interface DelayTrendData {
  day: string;
  historicalAvg: number;
  predictedAvg: number;
}

/**
 * Predict delay risk for each pending complaint
 */
export function predictDelayRisks(complaints: Complaint[]): DelayRiskPrediction[] {
  const pending = complaints.filter(c => c.status === 'pending');
  const predictions: DelayRiskPrediction[] = [];
  
  pending.forEach(complaint => {
    const reasons: string[] = [];
    let riskScore = 0;
    
    // 1. Days pending
    const daysPending = daysSince(complaint.submittedDate);
    if (daysPending >= 7) {
      riskScore += 30;
      reasons.push(`Already pending for ${daysPending} days`);
    } else if (daysPending >= 4) {
      riskScore += 15;
      reasons.push(`Pending for ${daysPending} days`);
    }
    
    // 2. Department backlog
    const deptComplaints = complaints.filter(c => c.category === complaint.category && c.status === 'pending');
    if (deptComplaints.length > 20) {
      riskScore += 35;
      reasons.push(`Department backlog: ${deptComplaints.length} open complaints`);
    } else if (deptComplaints.length > 10) {
      riskScore += 20;
      reasons.push(`Department has ${deptComplaints.length} open complaints`);
    }
    
    // 3. Historical average for category
    const resolvedInCategory = complaints.filter(c => 
      c.category === complaint.category && 
      (c.status === 'resolved' || c.status === 'verified') &&
      c.resolvedDate
    );
    
    if (resolvedInCategory.length > 0) {
      const avgDays = resolvedInCategory.reduce((sum, c) => {
        const submitDate = new Date(c.submittedDate);
        const resolveDate = new Date(c.resolvedDate!);
        const days = (resolveDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / resolvedInCategory.length;
      
      if (avgDays > 5) {
        riskScore += 20;
        reasons.push(`Historically slow category (avg ${avgDays.toFixed(1)} days)`);
      }
    }
    
    // 4. High visibility (votes)
    if (complaint.votes > 50) {
      riskScore += 10;
      reasons.push('High public attention (50+ votes)');
    }
    
    // 5. Severity from description
    const severityKeywords = ['urgent', 'emergency', 'critical', 'serious', 'dangerous', 'severe'];
    const hasUrgentWords = severityKeywords.some(word => 
      complaint.description.toLowerCase().includes(word) || 
      complaint.title.toLowerCase().includes(word)
    );
    if (hasUrgentWords) {
      riskScore += 15;
      reasons.push('Severity keywords detected in complaint text');
    }
    
    const riskOfDelay = Math.min(100, Math.max(0, riskScore));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskOfDelay >= 70) riskLevel = 'high';
    else if (riskOfDelay >= 40) riskLevel = 'medium';
    
    const assignedTeam = getAssignedTeam(complaint.category);
    const currentStatus = daysPending > 2 ? 'in_progress' : 'open';
    
    predictions.push({
      complaintId: complaint.id,
      category: complaint.category,
      assignedTeam,
      riskOfDelay: Math.round(riskOfDelay),
      riskLevel,
      currentStatus,
      daysPending,
      reasons,
    });
  });
  
  return predictions.sort((a, b) => b.riskOfDelay - a.riskOfDelay);
}

/**
 * Calculate department load
 */
export function calculateDepartmentLoad(complaints: Complaint[]): DepartmentLoad[] {
  const categories = [...new Set(complaints.map(c => c.category))];
  const loads: DepartmentLoad[] = [];
  
  categories.forEach(category => {
    const deptComplaints = complaints.filter(c => c.category === category);
    const openComplaints = deptComplaints.filter(c => c.status === 'pending').length;
    
    const resolved = deptComplaints.filter(c => 
      (c.status === 'resolved' || c.status === 'verified') && c.resolvedDate
    );
    
    let avgTimeToResolve = 0;
    if (resolved.length > 0) {
      avgTimeToResolve = resolved.reduce((sum, c) => {
        const submitDate = new Date(c.submittedDate);
        const resolveDate = new Date(c.resolvedDate!);
        const days = (resolveDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / resolved.length;
    }
    
    let delayRisk: 'low' | 'medium' | 'high' = 'low';
    if (openComplaints > 20 || avgTimeToResolve > 5) delayRisk = 'high';
    else if (openComplaints > 10 || avgTimeToResolve > 3) delayRisk = 'medium';
    
    loads.push({
      department: getAssignedTeam(category),
      currentOpenComplaints: openComplaints,
      avgTimeToResolve: Number(avgTimeToResolve.toFixed(1)),
      delayRisk,
    });
  });
  
  return loads.sort((a, b) => b.currentOpenComplaints - a.currentOpenComplaints);
}

/**
 * Generate delay prediction summary
 */
export function generateDelayPredictionSummary(predictions: DelayRiskPrediction[]): DelayPredictionSummary {
  const likelyToDelayToday = predictions.filter(p => 
    p.riskLevel === 'high' && p.daysPending >= 3
  ).length;
  
  const thisWeekPredictedDelays = predictions.filter(p => 
    p.riskLevel === 'high' || p.riskLevel === 'medium'
  ).length;
  
  const highRiskComplaints = predictions.filter(p => p.riskLevel === 'high').length;
  
  return {
    likelyToDelayToday,
    thisWeekPredictedDelays,
    highRiskComplaints,
  };
}

/**
 * Calculate category-wise delay probability
 */
export function calculateCategoryDelayProbability(complaints: Complaint[]): CategoryDelayProbability[] {
  const categories = [...new Set(complaints.map(c => c.category))];
  const probabilities: CategoryDelayProbability[] = [];
  
  categories.forEach(category => {
    const catComplaints = complaints.filter(c => c.category === category);
    const resolved = catComplaints.filter(c => 
      (c.status === 'resolved' || c.status === 'verified') && c.resolvedDate
    );
    
    let avgResolutionDays = 0;
    let delayCount = 0;
    
    if (resolved.length > 0) {
      resolved.forEach(c => {
        const submitDate = new Date(c.submittedDate);
        const resolveDate = new Date(c.resolvedDate!);
        const days = (resolveDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24);
        avgResolutionDays += days;
        
        if (days > 5) delayCount++;
      });
      
      avgResolutionDays = avgResolutionDays / resolved.length;
    }
    
    const delayProbability = resolved.length > 0 
      ? (delayCount / resolved.length) * 100 
      : 30; // Default for categories with no history
    
    probabilities.push({
      category,
      delayProbability: Math.round(delayProbability),
      avgResolutionDays: Number(avgResolutionDays.toFixed(1)),
    });
  });
  
  return probabilities.sort((a, b) => b.delayProbability - a.delayProbability);
}

/**
 * Generate delay trend data (past vs predicted)
 */
export function generateDelayTrendData(complaints: Complaint[]): DelayTrendData[] {
  const trendData: DelayTrendData[] = [];
  
  // Calculate historical average for last 7 days
  for (let i = 6; i >= 0; i--) {
    const dayComplaints = complaints.filter(c => {
      const days = daysSince(c.submittedDate);
      return days === i;
    });
    
    const resolved = complaints.filter(c => 
      (c.status === 'resolved' || c.status === 'verified') && c.resolvedDate
    );
    
    let historicalAvg = 0;
    if (resolved.length > 0) {
      historicalAvg = resolved.reduce((sum, c) => {
        const submitDate = new Date(c.submittedDate);
        const resolveDate = new Date(c.resolvedDate!);
        const days = (resolveDate.getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / resolved.length;
    }
    
    trendData.push({
      day: i === 0 ? 'Today' : `${i}d ago`,
      historicalAvg: Number(historicalAvg.toFixed(1)),
      predictedAvg: 0,
    });
  }
  
  // Calculate predicted average for next 7 days
  const pending = complaints.filter(c => c.status === 'pending');
  const avgPendingDays = pending.length > 0
    ? pending.reduce((sum, c) => sum + daysSince(c.submittedDate), 0) / pending.length
    : 3;
  
  for (let i = 1; i <= 7; i++) {
    trendData.push({
      day: `Day ${i}`,
      historicalAvg: 0,
      predictedAvg: Number((avgPendingDays + i * 0.5).toFixed(1)),
    });
  }
  
  return trendData;
}

/**
 * Helper: Get assigned team based on category
 */
function getAssignedTeam(category: string): string {
  const teams: { [key: string]: string } = {
    'waste': 'Sanitation Dept',
    'garbage': 'Sanitation Dept',
    'water': 'Water Dept',
    'sewage': 'Water & Sewage',
    'drainage': 'Water & Sewage',
    'roads': 'PWD',
    'potholes': 'PWD',
    'streetlights': 'Electricity Dept',
    'electricity': 'Electricity Dept',
  };
  
  return teams[category.toLowerCase()] || 'Municipal Office';
}