
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Heart, Lungs, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { HealthRiskScore } from '@/utils/AIAnalysisEngine';

interface HealthRiskAssessmentProps {
  riskScore: HealthRiskScore;
}

const HealthRiskAssessment = ({ riskScore }: HealthRiskAssessmentProps) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-orange-500';
    if (score >= 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };

  const getTrendIcon = () => {
    if (riskScore.trend === 'improving') return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (riskScore.trend === 'deteriorating') return <TrendingUp className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (riskScore.trend === 'improving') return 'text-green-600';
    if (riskScore.trend === 'deteriorating') return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          AI Health Risk Assessment
          <Badge variant="outline" className="ml-2">
            {riskScore.confidence}% Confidence
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered personalized risk analysis based on your health patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Overall Health Risk</h4>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getRiskColor(riskScore.overall)}`}>
                {riskScore.overall}%
              </span>
              <Badge variant={riskScore.overall >= 40 ? 'destructive' : 'secondary'}>
                {getRiskLevel(riskScore.overall)}
              </Badge>
              {getTrendIcon()}
            </div>
          </div>
          <Progress 
            value={riskScore.overall} 
            className="h-2"
          />
          <div className="flex items-center gap-2 text-sm">
            <span className={getTrendColor()}>
              Trend: {riskScore.trend.charAt(0).toUpperCase() + riskScore.trend.slice(1)}
            </span>
          </div>
        </div>

        {/* Risk Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-health-heart" />
              <span className="text-sm font-medium">Cardiovascular</span>
            </div>
            <div className="flex items-center justify-between">
              <Progress 
                value={riskScore.cardiovascular} 
                className="h-1 flex-1 mr-2"
              />
              <span className={`text-sm font-semibold ${getRiskColor(riskScore.cardiovascular)}`}>
                {riskScore.cardiovascular}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lungs className="h-4 w-4 text-health-oxygen" />
              <span className="text-sm font-medium">Respiratory</span>
            </div>
            <div className="flex items-center justify-between">
              <Progress 
                value={riskScore.respiratory} 
                className="h-1 flex-1 mr-2"
              />
              <span className={`text-sm font-semibold ${getRiskColor(riskScore.respiratory)}`}>
                {riskScore.respiratory}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-health-temperature" />
              <span className="text-sm font-medium">Metabolic</span>
            </div>
            <div className="flex items-center justify-between">
              <Progress 
                value={riskScore.metabolic} 
                className="h-1 flex-1 mr-2"
              />
              <span className={`text-sm font-semibold ${getRiskColor(riskScore.metabolic)}`}>
                {riskScore.metabolic}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AI Analysis Confidence</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={riskScore.confidence} 
                className="h-1 w-20"
              />
              <span className="font-medium">{riskScore.confidence}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {riskScore.confidence > 80 
              ? 'High confidence based on sufficient historical data'
              : riskScore.confidence > 60
              ? 'Moderate confidence - gathering more data will improve accuracy'
              : 'Building confidence - limited historical data available'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthRiskAssessment;
