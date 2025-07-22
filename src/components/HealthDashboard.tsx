import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Activity, Thermometer, Droplets, AlertTriangle, TrendingUp, Brain, LogOut, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import PatientSelector from './PatientSelector';
import HealthRiskAssessment from './HealthRiskAssessment';
import AIInsights from './AIInsights';
import PredictiveCharts from './PredictiveCharts';
import { AIAnalysisEngine, VitalSignData, AIInsight, HealthRiskScore } from '@/utils/AIAnalysisEngine';

// Mock real-time data with patient-specific variations
const generateMockData = (patientId?: string) => {
  // Add patient-specific variations
  const baseHR = patientId === '1' ? 85 : patientId === '2' ? 70 : 72; // Higher for hypertensive patient
  const baseBP = patientId === '1' ? { systolic: 135, diastolic: 85 } : { systolic: 120, diastolic: 80 };
  const baseTemp = 37.0;
  
  return {
    heartRate: baseHR + Math.random() * 20,
    bloodPressure: { 
      systolic: baseBP.systolic + Math.random() * 10, 
      diastolic: baseBP.diastolic + Math.random() * 5 
    },
    temperature: baseTemp + Math.random() * 1.1,
    oxygenSat: 97 + Math.random() * 3,
    steps: Math.floor(8000 + Math.random() * 4000),
    timestamp: new Date().toLocaleTimeString()
  };
};

const HealthDashboard = () => {
  const { currentUser, selectedPatient, logout } = useUser();
  const navigate = useNavigate();
  
  const [currentData, setCurrentData] = useState(generateMockData(selectedPatient?.id));
  const [chartData, setChartData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  
  // AI Analysis State
  const [aiEngine] = useState(new AIAnalysisEngine());
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIInsight[]>([]);
  const [healthRiskScore, setHealthRiskScore] = useState<HealthRiskScore>({
    overall: 0,
    cardiovascular: 0,
    respiratory: 0,
    metabolic: 0,
    confidence: 0,
    trend: 'stable'
  });
  const [heartRatePrediction, setHeartRatePrediction] = useState({ value: 0, confidence: 0 });

  // Simulate real-time updates with AI analysis
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockData(selectedPatient?.id);
      setCurrentData(newData);
      
      // Update chart data (keep last 20 points)
      setChartData(prev => {
        const updated = [...prev, newData].slice(-20);
        
        // AI Analysis
        const patientId = selectedPatient?.id || 'default';
        
        // Update baseline with new data
        aiEngine.updatePatientBaseline(patientId, updated);
        
        // Detect anomalies
        const insights = aiEngine.detectAnomalies(patientId, newData, updated);
        setAiInsights(insights);
        
        // Calculate risk score
        const riskScore = aiEngine.calculateHealthRiskScore(patientId, newData, updated);
        setHealthRiskScore(riskScore);
        
        // Generate recommendations
        const recommendations = aiEngine.generateRecommendations(patientId, newData, riskScore, insights);
        setAiRecommendations(recommendations);
        
        // Generate predictions
        if (updated.length >= 5) {
          const heartRates = updated.map(d => d.heartRate);
          const hrPrediction = aiEngine.predictNextValue(heartRates);
          setHeartRatePrediction(hrPrediction);
        }
        
        return updated;
      });

      // Legacy anomaly detection (simplified now that AI handles it)
      const newAnomalies = [];
      const isHighRisk = selectedPatient?.riskLevel === 'high';
      
      if (newData.heartRate > (isHighRisk ? 90 : 100)) {
        newAnomalies.push("Elevated heart rate detected");
      }
      if (newData.bloodPressure.systolic > (isHighRisk ? 130 : 140)) {
        newAnomalies.push("High blood pressure alert");
      }
      if (newData.temperature > 38) {
        newAnomalies.push("Fever detected");
      }
      setAnomalies(newAnomalies);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedPatient?.id, selectedPatient?.riskLevel, aiEngine]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToProfessional = () => {
    navigate('/professional');
  };

  // Show message if no patient selected (for professionals)
  if (currentUser?.role === 'professional' && !selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-background p-6 flex items-center justify-center">
        <Card className="bg-gradient-card shadow-card max-w-md">
          <CardContent className="pt-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No Patient Selected</h2>
            <p className="text-muted-foreground mb-4">
              Please select a patient from the professional dashboard to view their health data.
            </p>
            <Button onClick={handleBackToProfessional} className="bg-gradient-primary">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthMetrics = [
    {
      title: "Heart Rate",
      value: Math.round(currentData.heartRate),
      unit: "BPM",
      icon: Heart,
      color: "health-heart",
      status: currentData.heartRate > 100 ? "warning" : "normal"
    },
    {
      title: "Blood Pressure", 
      value: `${Math.round(currentData.bloodPressure.systolic)}/${Math.round(currentData.bloodPressure.diastolic)}`,
      unit: "mmHg",
      icon: Activity,
      color: "health-pressure",
      status: currentData.bloodPressure.systolic > 140 ? "critical" : "normal"
    },
    {
      title: "Temperature",
      value: currentData.temperature.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      color: "health-temperature",
      status: currentData.temperature > 38 ? "warning" : "normal"
    },
    {
      title: "Oxygen Saturation",
      value: Math.round(currentData.oxygenSat),
      unit: "%",
      icon: Droplets,
      color: "health-oxygen",
      status: currentData.oxygenSat < 95 ? "critical" : "normal"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      normal: "secondary",
      warning: "default",
      critical: "destructive"
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  // Prepare predictive chart data
  const predictiveHeartRateData = chartData.map((data, index) => ({
    timestamp: data.timestamp,
    actual: data.heartRate,
    isActual: true
  }));

  // Add prediction point
  if (heartRatePrediction.value > 0) {
    predictiveHeartRateData.push({
      timestamp: 'Next',
      predicted: heartRatePrediction.value,
      confidence: heartRatePrediction.confidence,
      isActual: false
    });
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Monitoring Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {currentUser?.role === 'professional' 
                ? `Monitoring: ${selectedPatient?.name}` 
                : 'Real-time AI-powered health insights'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser?.role === 'professional' && (
              <Button variant="outline" onClick={handleBackToProfessional}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            <Badge variant="secondary" className="bg-gradient-secondary text-secondary-foreground">
              <Brain className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
            <Badge variant="outline">Live Monitoring</Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Patient Selector (only for professionals) */}
        <PatientSelector />

        {/* AI Insights and Alerts */}
        <AIInsights insights={aiInsights} recommendations={aiRecommendations} />

        {/* Legacy Anomaly Alerts (keeping for backward compatibility) */}
        {anomalies.length > 0 && (
          <div className="space-y-2">
            {anomalies.map((anomaly, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{anomaly}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Health Risk Assessment */}
        <HealthRiskAssessment riskScore={healthRiskScore} />

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthMetrics.map((metric) => (
            <Card key={metric.title} className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className="p-2 rounded-full bg-gradient-primary">
                  <metric.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value}
                  <span className="text-sm font-normal ml-1 text-muted-foreground">
                    {metric.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={getStatusBadge(metric.status) as any}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </Badge>
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Charts Section with Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predictive Heart Rate Chart */}
          <PredictiveCharts
            data={predictiveHeartRateData}
            title="Heart Rate Trends"
            metric="Heart Rate"
            unit="BPM"
            color="hsl(var(--heart-rate))"
            prediction={heartRatePrediction}
          />

          {/* Blood Pressure Chart */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-health-pressure" />
                Blood Pressure Trends
              </CardTitle>
              <CardDescription>Systolic and diastolic pressure</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="bloodPressure.systolic" 
                    stroke="hsl(var(--blood-pressure))"
                    strokeWidth={2}
                    name="Systolic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bloodPressure.diastolic" 
                    stroke="hsl(var(--primary-glow))"
                    strokeWidth={2}
                    name="Diastolic"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Health Recommendations - Enhanced */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Health Recommendations
              {selectedPatient && (
                <Badge variant="outline" className="ml-2">
                  For {selectedPatient.name}
                </Badge>
              )}
              <Badge variant="secondary" className="ml-2">
                {healthRiskScore.confidence}% AI Confidence
              </Badge>
            </CardTitle>
            <CardDescription>AI-powered personalized insights based on your health patterns and risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dynamic AI recommendations based on current analysis */}
              {aiRecommendations.length > 0 ? (
                aiRecommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg bg-muted/30">
                    <h4 className={`font-semibold mb-2 ${
                      rec.severity === 'high' ? 'text-destructive' : 
                      rec.severity === 'medium' ? 'text-orange-500' : 'text-secondary'
                    }`}>
                      {rec.type === 'recommendation' ? '💡' : '⚠️'} {rec.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence}% confidence
                      </Badge>
                      <Badge variant={rec.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {rec.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback to static recommendations if AI hasn't generated any yet
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <h4 className="font-semibold text-secondary mb-2">✓ Good Health Patterns</h4>
                  <p className="text-sm text-muted-foreground">Your vital signs are within expected ranges. AI is learning your patterns to provide personalized insights.</p>
                </div>
              )}
              
              {/* Show baseline learning status */}
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-primary mb-2">🧠 AI Learning Status</h4>
                <p className="text-sm text-muted-foreground">
                  AI confidence: {healthRiskScore.confidence}% • 
                  {healthRiskScore.confidence > 80 
                    ? ' High accuracy with sufficient data'
                    : healthRiskScore.confidence > 60
                    ? ' Good accuracy, learning your patterns'
                    : ' Building accuracy, gathering baseline data'
                  }
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    Risk Trend: {healthRiskScore.trend}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button className="bg-gradient-primary">View Detailed AI Analysis</Button>
              <Button variant="outline">Export AI Health Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthDashboard;
