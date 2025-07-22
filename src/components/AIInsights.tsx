
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Lightbulb, 
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AIInsight } from '@/utils/AIAnalysisEngine';

interface AIInsightsProps {
  insights: AIInsight[];
  recommendations: AIInsight[];
}

const AIInsights = ({ insights, recommendations }: AIInsightsProps) => {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'anomaly': return AlertTriangle;
      case 'trend': return TrendingUp;
      case 'prediction': return Brain;
      case 'correlation': return Activity;
      case 'recommendation': return Lightbulb;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (confidence >= 60) return <Info className="h-3 w-3 text-yellow-600" />;
    return <XCircle className="h-3 w-3 text-muted-foreground" />;
  };

  const allInsights = [...insights, ...recommendations];
  const criticalInsights = allInsights.filter(i => i.severity === 'critical' || i.severity === 'high');

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalInsights.length > 0 && (
        <div className="space-y-2">
          {criticalInsights.map((insight, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{insight.title}: {insight.description}</span>
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% confidence
                </Badge>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* AI Insights Dashboard */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Health Insights
            <Badge variant="secondary" className="bg-gradient-secondary text-secondary-foreground">
              {allInsights.length} Active
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time AI analysis of your health patterns and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allInsights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AI is analyzing your health data...</p>
              <p className="text-sm mt-1">Insights will appear as patterns are detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allInsights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <div 
                    key={index}
                    className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-gradient-primary">
                          <Icon className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant={getSeverityColor(insight.severity) as any} className="text-xs">
                          {insight.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getConfidenceIcon(insight.confidence)}
                        <span>{insight.confidence}%</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    
                    {insight.explanation && (
                      <div className="bg-muted/50 p-2 rounded text-xs">
                        <strong>AI Explanation:</strong> {insight.explanation}
                      </div>
                    )}
                    
                    {insight.metric && insight.value && (
                      <div className="mt-2 text-xs">
                        <Badge variant="outline">
                          {insight.metric}: {typeof insight.value === 'number' ? insight.value.toFixed(1) : insight.value}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {allInsights.length > 0 && (
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button size="sm" className="bg-gradient-primary">
                View Detailed Analysis
              </Button>
              <Button size="sm" variant="outline">
                Export AI Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
