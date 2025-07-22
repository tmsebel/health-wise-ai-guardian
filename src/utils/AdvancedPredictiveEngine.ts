
import { VitalSignData, AIInsight } from './AIAnalysisEngine';

export interface HealthEpisodePrediction {
  type: 'cardiac_event' | 'respiratory_distress' | 'hypertensive_crisis' | 'hypoglycemia';
  probability: number;
  timeframe: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  triggers: string[];
  recommendations: string[];
}

export interface MultiModalPrediction {
  metric: string;
  predictions: Array<{
    timestamp: string;
    value: number;
    confidence: number;
    influencingFactors: string[];
  }>;
  crossCorrelations: Array<{
    metric: string;
    correlation: number;
    influence: number;
  }>;
}

export interface InterventionImpact {
  intervention: string;
  expectedOutcomes: Array<{
    metric: string;
    currentValue: number;
    predictedValue: number;
    improvement: number;
    timeframe: string;
    confidence: number;
  }>;
  riskReduction: number;
  feasibility: 'low' | 'medium' | 'high';
}

export class AdvancedPredictiveEngine {
  private episodePatterns: Map<string, number[]> = new Map();
  private interventionHistory: Map<string, any[]> = new Map();

  // Multi-Modal Health Forecasting
  predictMultipleVitals(historicalData: VitalSignData[], periods: number = 6): MultiModalPrediction[] {
    if (historicalData.length < 10) return [];

    const predictions: MultiModalPrediction[] = [];
    const metrics = ['heartRate', 'systolic', 'diastolic', 'temperature', 'oxygenSat'];

    for (const metric of metrics) {
      const values = this.extractMetricValues(historicalData, metric);
      const correlations = this.calculateCrossCorrelations(historicalData, metric);
      
      const metricPredictions = this.generateTimeSeriesPredictions(values, periods);
      
      predictions.push({
        metric,
        predictions: metricPredictions.map((pred, index) => ({
          timestamp: new Date(Date.now() + (index + 1) * 10 * 60 * 1000).toISOString(),
          value: pred.value,
          confidence: pred.confidence,
          influencingFactors: this.identifyInfluencingFactors(correlations, metric)
        })),
        crossCorrelations: correlations
      });
    }

    return predictions;
  }

  // Health Episode Prediction (6-12 hours ahead)
  predictHealthEpisodes(patientId: string, historicalData: VitalSignData[]): HealthEpisodePrediction[] {
    const predictions: HealthEpisodePrediction[] = [];
    
    if (historicalData.length < 20) return predictions;

    // Cardiac Event Prediction
    const cardiacRisk = this.assessCardiacRisk(historicalData);
    if (cardiacRisk.probability > 0.3) {
      predictions.push({
        type: 'cardiac_event',
        probability: cardiacRisk.probability,
        timeframe: '6-12 hours',
        severity: cardiacRisk.probability > 0.7 ? 'critical' : 'high',
        confidence: cardiacRisk.confidence,
        triggers: cardiacRisk.triggers,
        recommendations: [
          'Monitor heart rate and blood pressure closely',
          'Consider contacting healthcare provider',
          'Avoid strenuous activities',
          'Keep emergency medications accessible'
        ]
      });
    }

    // Hypertensive Crisis Prediction
    const hypertensiveRisk = this.assessHypertensiveRisk(historicalData);
    if (hypertensiveRisk.probability > 0.25) {
      predictions.push({
        type: 'hypertensive_crisis',
        probability: hypertensiveRisk.probability,
        timeframe: '3-8 hours',
        severity: hypertensiveRisk.probability > 0.6 ? 'critical' : 'high',
        confidence: hypertensiveRisk.confidence,
        triggers: hypertensiveRisk.triggers,
        recommendations: [
          'Monitor blood pressure every 30 minutes',
          'Reduce sodium intake immediately',
          'Practice stress reduction techniques',
          'Contact healthcare provider if BP exceeds 180/120'
        ]
      });
    }

    // Respiratory Distress Prediction
    const respiratoryRisk = this.assessRespiratoryRisk(historicalData);
    if (respiratoryRisk.probability > 0.2) {
      predictions.push({
        type: 'respiratory_distress',
        probability: respiratoryRisk.probability,
        timeframe: '4-10 hours',
        severity: respiratoryRisk.probability > 0.5 ? 'high' : 'medium',
        confidence: respiratoryRisk.confidence,
        triggers: respiratoryRisk.triggers,
        recommendations: [
          'Monitor oxygen saturation closely',
          'Keep rescue inhaler accessible',
          'Avoid environmental triggers',
          'Practice breathing exercises'
        ]
      });
    }

    return predictions;
  }

  // Intervention Impact Modeling
  modelInterventionImpact(
    currentData: VitalSignData, 
    historicalData: VitalSignData[], 
    interventions: string[]
  ): InterventionImpact[] {
    const impacts: InterventionImpact[] = [];

    for (const intervention of interventions) {
      const impact = this.calculateInterventionImpact(intervention, currentData, historicalData);
      if (impact.riskReduction > 0.1) {
        impacts.push(impact);
      }
    }

    return impacts.sort((a, b) => b.riskReduction - a.riskReduction);
  }

  // Long-term Health Trajectory (weeks/months)
  generateHealthTrajectory(
    patientId: string, 
    historicalData: VitalSignData[], 
    timeframe: 'weeks' | 'months'
  ): Array<{
    date: string;
    predictedValues: Record<string, number>;
    confidence: number;
    trajectory: 'improving' | 'stable' | 'declining';
    milestones: string[];
  }> {
    const trajectory = [];
    const periods = timeframe === 'weeks' ? 12 : 6; // 12 weeks or 6 months
    const intervalDays = timeframe === 'weeks' ? 7 : 30;

    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(Date.now() + i * intervalDays * 24 * 60 * 60 * 1000);
      const predictions = this.predictLongTermValues(historicalData, i * intervalDays);
      
      trajectory.push({
        date: futureDate.toISOString().split('T')[0],
        predictedValues: predictions.values,
        confidence: predictions.confidence,
        trajectory: predictions.trend,
        milestones: this.identifyHealthMilestones(predictions.values, i)
      });
    }

    return trajectory;
  }

  // Helper Methods

  private extractMetricValues(data: VitalSignData[], metric: string): number[] {
    return data.map(d => {
      switch (metric) {
        case 'heartRate': return d.heartRate;
        case 'systolic': return d.bloodPressure.systolic;
        case 'diastolic': return d.bloodPressure.diastolic;
        case 'temperature': return d.temperature;
        case 'oxygenSat': return d.oxygenSat;
        default: return 0;
      }
    });
  }

  private calculateCrossCorrelations(data: VitalSignData[], targetMetric: string) {
    const target = this.extractMetricValues(data, targetMetric);
    const correlations = [];

    const metrics = ['heartRate', 'systolic', 'diastolic', 'temperature', 'oxygenSat'];
    for (const metric of metrics) {
      if (metric === targetMetric) continue;
      
      const values = this.extractMetricValues(data, metric);
      const correlation = this.pearsonCorrelation(target, values);
      
      correlations.push({
        metric,
        correlation: Math.abs(correlation),
        influence: Math.abs(correlation) * 0.8 + Math.random() * 0.2
      });
    }

    return correlations.sort((a, b) => b.influence - a.influence);
  }

  private generateTimeSeriesPredictions(values: number[], periods: number) {
    const predictions = [];
    
    // Use exponential smoothing for predictions
    const alpha = 0.3;
    const beta = 0.2;
    
    let level = values[values.length - 1];
    let trend = values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0;
    
    for (let i = 1; i <= periods; i++) {
      const forecast = level + i * trend;
      const confidence = Math.max(30, 90 - i * 10); // Confidence decreases over time
      
      predictions.push({
        value: Math.max(0, forecast),
        confidence
      });
    }

    return predictions;
  }

  private assessCardiacRisk(data: VitalSignData[]) {
    const recentData = data.slice(-10);
    const heartRates = recentData.map(d => d.heartRate);
    const systolics = recentData.map(d => d.bloodPressure.systolic);
    
    let riskScore = 0;
    const triggers = [];

    // High heart rate variability
    const hrVariability = this.calculateVariability(heartRates);
    if (hrVariability > 20) {
      riskScore += 0.3;
      triggers.push('High heart rate variability');
    }

    // Elevated heart rate trend
    const hrTrend = this.calculateTrend(heartRates);
    if (hrTrend > 5) {
      riskScore += 0.2;
      triggers.push('Increasing heart rate trend');
    }

    // Blood pressure correlation
    const correlation = this.pearsonCorrelation(heartRates, systolics);
    if (Math.abs(correlation) > 0.7) {
      riskScore += 0.2;
      triggers.push('Abnormal HR-BP correlation');
    }

    return {
      probability: Math.min(0.9, riskScore),
      confidence: Math.min(85, triggers.length * 25),
      triggers
    };
  }

  private assessHypertensiveRisk(data: VitalSignData[]) {
    const recentData = data.slice(-10);
    const systolics = recentData.map(d => d.bloodPressure.systolic);
    const diastolics = recentData.map(d => d.bloodPressure.diastolic);
    
    let riskScore = 0;
    const triggers = [];

    // Upward BP trend
    const sysTrend = this.calculateTrend(systolics);
    if (sysTrend > 3) {
      riskScore += 0.4;
      triggers.push('Rising systolic pressure');
    }

    const diaTrend = this.calculateTrend(diastolics);
    if (diaTrend > 2) {
      riskScore += 0.3;
      triggers.push('Rising diastolic pressure');
    }

    // Current elevated readings
    const avgSystolic = systolics.reduce((sum, val) => sum + val, 0) / systolics.length;
    if (avgSystolic > 140) {
      riskScore += 0.3;
      triggers.push('Elevated systolic readings');
    }

    return {
      probability: Math.min(0.9, riskScore),
      confidence: Math.min(85, triggers.length * 20 + 25),
      triggers
    };
  }

  private assessRespiratoryRisk(data: VitalSignData[]) {
    const recentData = data.slice(-10);
    const oxygenSats = recentData.map(d => d.oxygenSat);
    const heartRates = recentData.map(d => d.heartRate);
    
    let riskScore = 0;
    const triggers = [];

    // Declining oxygen saturation
    const o2Trend = this.calculateTrend(oxygenSats);
    if (o2Trend < -1) {
      riskScore += 0.4;
      triggers.push('Declining oxygen saturation');
    }

    // Low oxygen readings
    const avgO2 = oxygenSats.reduce((sum, val) => sum + val, 0) / oxygenSats.length;
    if (avgO2 < 96) {
      riskScore += 0.3;
      triggers.push('Low oxygen saturation');
    }

    // Compensatory heart rate increase
    const hrO2Correlation = this.pearsonCorrelation(heartRates, oxygenSats);
    if (hrO2Correlation < -0.5) {
      riskScore += 0.2;
      triggers.push('Compensatory heart rate response');
    }

    return {
      probability: Math.min(0.8, riskScore),
      confidence: Math.min(80, triggers.length * 20 + 20),
      triggers
    };
  }

  private calculateInterventionImpact(
    intervention: string, 
    current: VitalSignData, 
    historical: VitalSignData[]
  ): InterventionImpact {
    const impacts = {
      'exercise': {
        heartRate: { improvement: -5, timeframe: '2-4 weeks' },
        systolic: { improvement: -8, timeframe: '4-6 weeks' },
        diastolic: { improvement: -5, timeframe: '4-6 weeks' }
      },
      'diet_modification': {
        systolic: { improvement: -12, timeframe: '3-6 weeks' },
        diastolic: { improvement: -8, timeframe: '3-6 weeks' }
      },
      'stress_reduction': {
        heartRate: { improvement: -8, timeframe: '1-3 weeks' },
        systolic: { improvement: -10, timeframe: '2-4 weeks' }
      },
      'medication_adherence': {
        systolic: { improvement: -20, timeframe: '1-2 weeks' },
        diastolic: { improvement: -15, timeframe: '1-2 weeks' }
      }
    };

    const interventionImpacts = impacts[intervention as keyof typeof impacts] || {};
    const expectedOutcomes = [];

    for (const [metric, impact] of Object.entries(interventionImpacts)) {
      const currentValue = this.getCurrentMetricValue(current, metric);
      const predictedValue = currentValue + (impact as any).improvement;
      
      expectedOutcomes.push({
        metric,
        currentValue,
        predictedValue,
        improvement: Math.abs((impact as any).improvement),
        timeframe: (impact as any).timeframe,
        confidence: 75
      });
    }

    return {
      intervention,
      expectedOutcomes,
      riskReduction: expectedOutcomes.reduce((sum, outcome) => 
        sum + (outcome.improvement / outcome.currentValue) * 0.2, 0),
      feasibility: this.assessInterventionFeasibility(intervention)
    };
  }

  private getCurrentMetricValue(data: VitalSignData, metric: string): number {
    switch (metric) {
      case 'heartRate': return data.heartRate;
      case 'systolic': return data.bloodPressure.systolic;
      case 'diastolic': return data.bloodPressure.diastolic;
      case 'temperature': return data.temperature;
      case 'oxygenSat': return data.oxygenSat;
      default: return 0;
    }
  }

  private assessInterventionFeasibility(intervention: string): 'low' | 'medium' | 'high' {
    const feasibilityMap = {
      'stress_reduction': 'high',
      'medication_adherence': 'high',
      'diet_modification': 'medium',
      'exercise': 'medium',
      'lifestyle_change': 'low'
    };
    
    return feasibilityMap[intervention as keyof typeof feasibilityMap] || 'medium';
  }

  private predictLongTermValues(data: VitalSignData[], dayOffset: number) {
    const decay = Math.exp(-dayOffset / 90); // Confidence decays over 90 days
    const confidence = Math.max(20, 85 * decay);
    
    // Simple trend extrapolation with noise reduction
    const values: Record<string, number> = {};
    const metrics = ['heartRate', 'systolic', 'diastolic', 'temperature', 'oxygenSat'];
    
    for (const metric of metrics) {
      const metricValues = this.extractMetricValues(data, metric);
      const trend = this.calculateTrend(metricValues);
      const baseline = metricValues[metricValues.length - 1];
      
      values[metric] = baseline + (trend * dayOffset * 0.1); // Dampened trend
    }

    const overallTrend = this.assessOverallTrend(values);
    
    return { values, confidence, trend: overallTrend };
  }

  private identifyHealthMilestones(values: Record<string, number>, period: number): string[] {
    const milestones = [];
    
    if (values.systolic < 120 && values.diastolic < 80) {
      milestones.push('Optimal blood pressure achieved');
    }
    
    if (values.heartRate >= 60 && values.heartRate <= 100) {
      milestones.push('Heart rate in healthy range');
    }
    
    if (period % 4 === 0) {
      milestones.push('Quarterly health assessment recommended');
    }
    
    return milestones;
  }

  private identifyInfluencingFactors(correlations: any[], metric: string): string[] {
    return correlations
      .filter(c => c.influence > 0.5)
      .slice(0, 3)
      .map(c => `${c.metric} (${Math.round(c.influence * 100)}% influence)`);
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    
    const diffs = [];
    for (let i = 1; i < values.length; i++) {
      diffs.push(Math.abs(values[i] - values[i - 1]));
    }
    
    return diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 3) return 0;
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private assessOverallTrend(values: Record<string, number>): 'improving' | 'stable' | 'declining' {
    // Simple heuristic based on key health indicators
    const hrScore = values.heartRate >= 60 && values.heartRate <= 90 ? 1 : -1;
    const bpScore = values.systolic < 140 && values.diastolic < 90 ? 1 : -1;
    const o2Score = values.oxygenSat >= 95 ? 1 : -1;
    
    const totalScore = hrScore + bpScore + o2Score;
    
    if (totalScore >= 2) return 'improving';
    if (totalScore <= -1) return 'declining';
    return 'stable';
  }
}
