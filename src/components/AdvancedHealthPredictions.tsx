
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target,
  Activity,
  Heart,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AdvancedPredictiveEngine, HealthEpisodePrediction, MultiModalPrediction, InterventionImpact } from '@/utils/AdvancedPredictiveEngine';
import { VitalSignData } from '@/utils/AIAnalysisEngine';

interface AdvancedHealthPredictionsProps {
  currentData: VitalSignData;
  historicalData: VitalSignData[];
  patientId: string;
}

const AdvancedHealthPredictions = ({ 
  currentData, 
  historicalData, 
  patientId 
}: AdvancedHealthPredictionsProps) => {
  const [predictiveEngine] = useState(new AdvancedPredictiveEngine());
  const [episodePredictions, setEpisodePredictions] = useState<HealthEpisodePrediction[]>([]);
  const [multiModalPredictions, setMultiModalPredictions] = useState<MultiModalPrediction[]>([]);
  const [interventionImpacts, setInterventionImpacts] = useState<InterventionImpact[]>([]);
  const [healthTrajectory, setHealthTrajectory] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weeks' | 'months'>('weeks');

  useEffect(() => {
    if (historicalData.length >= 10) {
      // Generate episode predictions
      const episodes = predictiveEngine.predictHealthEpisodes(patientId, historicalData);
      setEpisodePredictions(episodes);

      // Generate multi-modal predictions
      const multiModal = predictiveEngine.predictMultipleVitals(historicalData, 6);
      setMultiModalPredictions(multiModal);

      // Generate intervention impacts
      const interventions = ['exercise', 'diet_modification', 'stress_reduction', 'medication_adherence'];
      const impacts = predictiveEngine.modelInterventionImpact(currentData, historicalData, interventions);
      setInterventionImpacts(impacts);

      // Generate health trajectory
      const trajectory = predictiveEngine.generateHealthTrajectory(patientId, historicalData, selectedTimeframe);
      setHealthTrajectory(trajectory);
    }
  }, [historicalData, currentData, patientId, selectedTimeframe, predictiveEngine]);

  const getEpisodeIcon = (type: string) => {
    switch (type) {
      case 'cardiac_event': return Heart;
      case 'respiratory_distress': return Activity;
      case 'hypertensive_crisis': return TrendingUp;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Episode Predictions */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Health Episode Predictions
            <Badge variant="secondary" className="bg-gradient-secondary">
              Next 6-12 Hours
            </Badge>
          </CardTitle>
          <CardDescription>
            AI-powered early warning system for potential health events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {episodePredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No significant health episodes predicted</p>
              <p className="text-sm mt-1">Your current patterns suggest stable health</p>
            </div>
          ) : (
            <div className="space-y-3">
              {episodePredictions.map((prediction, index) => {
                const Icon = getEpisodeIcon(prediction.type);
                return (
                  <Alert key={index} className={`border-2 ${getSeverityColor(prediction.severity)}`}>
                    <Icon className="h-5 w-5" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {prediction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {Math.round(prediction.probability * 100)}% risk
                            </Badge>
                            <Badge variant="secondary">
                              {prediction.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm">
                          Timeframe: {prediction.timeframe}
                        </p>
                        
                        <div className="space-y-2">
                          <div>
                            <h5 className="text-xs font-medium mb-1">Risk Factors:</h5>
                            <div className="flex flex-wrap gap-1">
                              {prediction.triggers.map((trigger, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-medium mb-1">Recommendations:</h5>
                            <ul className="text-xs space-y-1">
                              {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-current rounded-full"></span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multi-Modal Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {multiModalPredictions.slice(0, 2).map((prediction, index) => (
          <Card key={index} className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {prediction.metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Forecast
                <Badge variant="outline">
                  Next 60 mins
                </Badge>
              </CardTitle>
              <CardDescription>
                AI prediction with cross-correlation analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={prediction.predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `${value?.toFixed(1)}`, 
                      name
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Influencing Factors:</h4>
                <div className="flex flex-wrap gap-2">
                  {prediction.crossCorrelations.slice(0, 3).map((corr, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {corr.metric}: {Math.round(corr.influence * 100)}%
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intervention Impact Analysis */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Intervention Impact Analysis
          </CardTitle>
          <CardDescription>
            Predicted outcomes of different health interventions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interventionImpacts.map((impact, index) => (
              <div key={index} className="p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">
                    {impact.intervention.replace('_', ' ')}
                  </h4>
                  <Badge variant={
                    impact.feasibility === 'high' ? 'default' : 
                    impact.feasibility === 'medium' ? 'secondary' : 'outline'
                  }>
                    {impact.feasibility} feasibility
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Risk Reduction</span>
                    <Badge variant="outline">
                      {Math.round(impact.riskReduction * 100)}%
                    </Badge>
                  </div>
                  
                  {impact.expectedOutcomes.slice(0, 2).map((outcome, idx) => (
                    <div key={idx} className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{outcome.metric.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <span className="text-green-600">
                          {outcome.improvement > 0 ? '+' : ''}{outcome.improvement.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {outcome.currentValue.toFixed(1)} → {outcome.predictedValue.toFixed(1)} 
                        <span className="ml-1">({outcome.timeframe})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Trajectory */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Long-term Health Trajectory
          </CardTitle>
          <CardDescription>
            Projected health trends over time
          </CardDescription>
          <div className="flex gap-2">
            <Button
              variant={selectedTimeframe === 'weeks' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('weeks')}
            >
              12 Weeks
            </Button>
            <Button
              variant={selectedTimeframe === 'months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('months')}
            >
              6 Months
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthTrajectory.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthTrajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="predictedValues.heartRate" 
                  stroke="hsl(var(--heart-rate))"
                  strokeWidth={2}
                  name="Heart Rate"
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedValues.systolic" 
                  stroke="hsl(var(--blood-pressure))"
                  strokeWidth={2}
                  name="Systolic BP"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedHealthPredictions;
