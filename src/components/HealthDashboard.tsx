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

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockData(selectedPatient?.id);
      setCurrentData(newData);
      
      // Update chart data (keep last 20 points)
      setChartData(prev => {
        const updated = [...prev, newData].slice(-20);
        return updated;
      });

      // AI Anomaly Detection (mock) - more sensitive for high-risk patients
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
  }, [selectedPatient?.id, selectedPatient?.riskLevel]);

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

        {/* Anomaly Alerts */}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heart Rate Chart */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-health-heart" />
                Heart Rate Trends
              </CardTitle>
              <CardDescription>Real-time heart rate monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="hsl(var(--heart-rate))" 
                    fill="hsl(var(--heart-rate) / 0.1)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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

        {/* AI Health Recommendations */}
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
            </CardTitle>
            <CardDescription>Personalized insights based on health data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-secondary mb-2">✓ Good Sleep Pattern</h4>
                <p className="text-sm text-muted-foreground">Heart rate variability suggests good sleep quality. Keep maintaining current sleep schedule.</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-accent mb-2">⚠ Hydration Alert</h4>
                <p className="text-sm text-muted-foreground">Temperature trend suggests mild dehydration. Consider increasing water intake.</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-primary mb-2">📈 Activity Boost</h4>
                <p className="text-sm text-muted-foreground">Great progress on daily steps! You're 15% above average.</p>
              </div>
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-destructive mb-2">🔍 Monitor Closely</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient?.riskLevel === 'high' 
                    ? 'High-risk patient: Monitor blood pressure readings closely due to medical history.'
                    : 'Blood pressure readings show slight elevation. Consider consulting healthcare provider.'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button className="bg-gradient-primary">View Detailed Analysis</Button>
              <Button variant="outline">Export Health Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthDashboard;
