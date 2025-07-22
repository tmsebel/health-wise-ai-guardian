
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';

interface PredictiveData {
  timestamp: string;
  actual?: number;
  predicted?: number;
  confidence?: number;
  isActual: boolean;
}

interface PredictiveChartsProps {
  data: PredictiveData[];
  title: string;
  metric: string;
  unit: string;
  color: string;
  prediction: { value: number; confidence: number };
}

const PredictiveCharts = ({ 
  data, 
  title, 
  metric, 
  unit, 
  color, 
  prediction 
}: PredictiveChartsProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {data.isActual ? (
            <p className="text-sm">
              <span className="font-medium">Actual:</span> {payload[0].value?.toFixed(1)} {unit}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Predicted:</span> {payload[0].value?.toFixed(1)} {unit}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {data.confidence}%
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {title} - AI Prediction
          <Badge 
            variant="outline" 
            className={getConfidenceColor(prediction.confidence)}
          >
            {prediction.confidence}% Confidence
          </Badge>
        </CardTitle>
        <CardDescription>
          Historical data with AI-powered trend forecasting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Next Predicted Value</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {prediction.value.toFixed(1)} {unit}
              </div>
              <div className={`text-xs ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence}% confidence
              </div>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="timestamp" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Actual data line */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              connectNulls={false}
              name="Actual"
            />
            
            {/* Predicted data line */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: color, r: 3, stroke: color, strokeWidth: 1 }}
              connectNulls={false}
              name="Predicted"
            />
            
            {/* Reference line to separate actual from predicted */}
            {data.some(d => d.isActual) && data.some(d => !d.isActual) && (
              <ReferenceLine 
                x={data.find(d => !d.isActual)?.timestamp} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="2 2"
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-3 h-0.5 bg-[${color}]`}></div>
              <span>Actual Data</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-0.5 bg-[${color}] opacity-70`} style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, currentColor 2px, currentColor 4px)' }}></div>
              <span>AI Prediction</span>
            </div>
          </div>
          <div>
            {prediction.confidence >= 80 ? 'High' : prediction.confidence >= 60 ? 'Medium' : 'Low'} Confidence
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveCharts;
