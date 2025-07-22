
export interface VitalSignData {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenSat: number;
  timestamp: string;
}

export interface PatientBaseline {
  heartRate: { mean: number; std: number; min: number; max: number };
  systolic: { mean: number; std: number; min: number; max: number };
  diastolic: { mean: number; std: number; min: number; max: number };
  temperature: { mean: number; std: number; min: number; max: number };
  oxygenSat: { mean: number; std: number; min: number; max: number };
  dataPoints: number;
}

export interface AIInsight {
  type: 'anomaly' | 'trend' | 'prediction' | 'correlation' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  metric?: string;
  value?: number;
  explanation: string;
}

export interface HealthRiskScore {
  overall: number;
  cardiovascular: number;
  respiratory: number;
  metabolic: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'deteriorating';
}

export class AIAnalysisEngine {
  private patientBaselines: Map<string, PatientBaseline> = new Map();

  // Level 1: Statistical Analysis Functions
  
  calculateZScore(value: number, mean: number, std: number): number {
    if (std === 0) return 0;
    return Math.abs((value - mean) / std);
  }

  calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(avg);
    }
    return result;
  }

  calculateStandardDeviation(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    
    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
  }

  // Level 2: Baseline Learning and Personalization

  updatePatientBaseline(patientId: string, data: VitalSignData[]): PatientBaseline {
    if (data.length === 0) {
      return this.getDefaultBaseline();
    }

    const heartRates = data.map(d => d.heartRate);
    const systolics = data.map(d => d.bloodPressure.systolic);
    const diastolics = data.map(d => d.bloodPressure.diastolic);
    const temperatures = data.map(d => d.temperature);
    const oxygenSats = data.map(d => d.oxygenSat);

    const baseline: PatientBaseline = {
      heartRate: this.calculateBaslineStats(heartRates),
      systolic: this.calculateBaslineStats(systolics),
      diastolic: this.calculateBaslineStats(diastolics),
      temperature: this.calculateBaslineStats(temperatures),
      oxygenSat: this.calculateBaslineStats(oxygenSats),
      dataPoints: data.length
    };

    this.patientBaselines.set(patientId, baseline);
    return baseline;
  }

  private calculateBaslineStats(data: number[]) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const std = this.calculateStandardDeviation(data);
    const min = Math.min(...data);
    const max = Math.max(...data);
    return { mean, std, min, max };
  }

  private getDefaultBaseline(): PatientBaseline {
    return {
      heartRate: { mean: 75, std: 15, min: 60, max: 90 },
      systolic: { mean: 120, std: 20, min: 90, max: 140 },
      diastolic: { mean: 80, std: 10, min: 60, max: 90 },
      temperature: { mean: 37.0, std: 0.5, min: 36.5, max: 37.5 },
      oxygenSat: { mean: 98, std: 2, min: 95, max: 100 },
      dataPoints: 0
    };
  }

  // Level 2: Anomaly Detection with AI

  detectAnomalies(patientId: string, currentData: VitalSignData, historicalData: VitalSignData[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const baseline = this.patientBaselines.get(patientId) || this.getDefaultBaseline();

    // Z-score based anomaly detection
    const hrZScore = this.calculateZScore(currentData.heartRate, baseline.heartRate.mean, baseline.heartRate.std);
    const sysZScore = this.calculateZScore(currentData.bloodPressure.systolic, baseline.systolic.mean, baseline.systolic.std);
    const tempZScore = this.calculateZScore(currentData.temperature, baseline.temperature.mean, baseline.temperature.std);
    const o2ZScore = this.calculateZScore(currentData.oxygenSat, baseline.oxygenSat.mean, baseline.oxygenSat.std);

    if (hrZScore > 2) {
      insights.push({
        type: 'anomaly',
        severity: hrZScore > 3 ? 'critical' : 'high',
        title: 'Heart Rate Anomaly',
        description: `Heart rate (${currentData.heartRate} BPM) is significantly different from your baseline`,
        confidence: Math.min(95, hrZScore * 25),
        metric: 'heartRate',
        value: currentData.heartRate,
        explanation: `Your typical heart rate range is ${Math.round(baseline.heartRate.mean - baseline.heartRate.std)}-${Math.round(baseline.heartRate.mean + baseline.heartRate.std)} BPM. Current reading is ${hrZScore.toFixed(1)} standard deviations from normal.`
      });
    }

    if (sysZScore > 2) {
      insights.push({
        type: 'anomaly',
        severity: sysZScore > 3 ? 'critical' : 'high',
        title: 'Blood Pressure Anomaly',
        description: `Systolic pressure (${Math.round(currentData.bloodPressure.systolic)} mmHg) is unusual for you`,
        confidence: Math.min(95, sysZScore * 25),
        metric: 'bloodPressure',
        value: currentData.bloodPressure.systolic,
        explanation: `Your typical systolic range is ${Math.round(baseline.systolic.mean - baseline.systolic.std)}-${Math.round(baseline.systolic.mean + baseline.systolic.std)} mmHg.`
      });
    }

    // Correlation analysis
    if (historicalData.length >= 10) {
      const recentData = historicalData.slice(-10);
      const heartRates = recentData.map(d => d.heartRate);
      const systolics = recentData.map(d => d.bloodPressure.systolic);
      
      const correlation = this.calculateCorrelation(heartRates, systolics);
      if (Math.abs(correlation) > 0.7) {
        insights.push({
          type: 'correlation',
          severity: 'medium',
          title: 'Strong HR-BP Correlation Detected',
          description: `Unusual correlation between heart rate and blood pressure`,
          confidence: Math.abs(correlation) * 100,
          explanation: `Heart rate and blood pressure show ${correlation > 0 ? 'positive' : 'negative'} correlation of ${Math.abs(correlation).toFixed(2)}, which may indicate stress or medication effects.`
        });
      }
    }

    return insights;
  }

  // Level 2: Predictive Analytics

  predictNextValue(data: number[], periods: number = 1): { prediction: number; confidence: number } {
    if (data.length < 3) {
      return { prediction: data[data.length - 1] || 0, confidence: 30 };
    }

    // Simple linear regression for trend prediction
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const prediction = slope * (n + periods - 1) + intercept;
    
    // Calculate confidence based on R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - (slope * i + intercept), 2), 0);
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);
    const confidence = Math.max(30, Math.min(90, rSquared * 100));

    return { prediction, confidence };
  }

  // Level 2: Risk Assessment

  calculateHealthRiskScore(patientId: string, currentData: VitalSignData, historicalData: VitalSignData[]): HealthRiskScore {
    const baseline = this.patientBaselines.get(patientId) || this.getDefaultBaseline();
    
    // Cardiovascular risk factors
    let cardiovascularRisk = 0;
    const hrZScore = this.calculateZScore(currentData.heartRate, baseline.heartRate.mean, baseline.heartRate.std);
    const sysZScore = this.calculateZScore(currentData.bloodPressure.systolic, baseline.systolic.mean, baseline.systolic.std);
    const diaZScore = this.calculateZScore(currentData.bloodPressure.diastolic, baseline.diastolic.mean, baseline.diastolic.std);
    
    cardiovascularRisk = Math.min(100, (hrZScore + sysZScore + diaZScore) * 15);

    // Respiratory risk
    const o2ZScore = this.calculateZScore(currentData.oxygenSat, baseline.oxygenSat.mean, baseline.oxygenSat.std);
    const respiratoryRisk = Math.min(100, o2ZScore * 25);

    // Metabolic risk
    const tempZScore = this.calculateZScore(currentData.temperature, baseline.temperature.mean, baseline.temperature.std);
    const metabolicRisk = Math.min(100, tempZScore * 20);

    // Overall risk (weighted average)
    const overall = (cardiovascularRisk * 0.5 + respiratoryRisk * 0.3 + metabolicRisk * 0.2);

    // Trend analysis
    let trend: 'improving' | 'stable' | 'deteriorating' = 'stable';
    if (historicalData.length >= 5) {
      const recentRisks = historicalData.slice(-5).map(data => {
        const hr = this.calculateZScore(data.heartRate, baseline.heartRate.mean, baseline.heartRate.std);
        const sys = this.calculateZScore(data.bloodPressure.systolic, baseline.systolic.mean, baseline.systolic.std);
        return (hr + sys) * 15;
      });
      
      const { prediction } = this.predictNextValue(recentRisks);
      const currentRisk = cardiovascularRisk;
      
      if (prediction > currentRisk + 10) trend = 'deteriorating';
      else if (prediction < currentRisk - 10) trend = 'improving';
    }

    return {
      overall: Math.round(overall),
      cardiovascular: Math.round(cardiovascularRisk),
      respiratory: Math.round(respiratoryRisk),
      metabolic: Math.round(metabolicRisk),
      confidence: baseline.dataPoints > 10 ? 85 : Math.min(70, baseline.dataPoints * 7),
      trend
    };
  }

  // Generate AI recommendations
  generateRecommendations(patientId: string, currentData: VitalSignData, riskScore: HealthRiskScore, insights: AIInsight[]): AIInsight[] {
    const recommendations: AIInsight[] = [];

    if (riskScore.overall > 60) {
      recommendations.push({
        type: 'recommendation',
        severity: 'high',
        title: 'Consider Medical Consultation',
        description: 'Your overall health risk score is elevated',
        confidence: riskScore.confidence,
        explanation: `Your risk score of ${riskScore.overall}% suggests increased health concerns. Consider consulting with a healthcare provider for proper evaluation.`
      });
    }

    if (currentData.heartRate > 100 && riskScore.cardiovascular > 40) {
      recommendations.push({
        type: 'recommendation',
        severity: 'medium',
        title: 'Heart Rate Management',
        description: 'Consider relaxation techniques or light exercise',
        confidence: 75,
        explanation: 'Elevated heart rate combined with cardiovascular risk factors may benefit from stress management techniques.'
      });
    }

    if (currentData.oxygenSat < 96) {
      recommendations.push({
        type: 'recommendation',
        severity: 'high',
        title: 'Oxygen Monitoring',
        description: 'Monitor oxygen levels closely and consider deep breathing exercises',
        confidence: 80,
        explanation: 'Low oxygen saturation requires attention and may benefit from breathing exercises or medical evaluation.'
      });
    }

    return recommendations;
  }
}
