
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  MessageCircle, 
  Brain, 
  Volume2, 
  VolumeX,
  Settings
} from 'lucide-react';
import { useConversation } from '@11labs/react';

interface ConversationalAIProps {
  healthData: any;
  insights: any[];
  onVoiceCommand?: (command: string) => void;
}

const ConversationalAI = ({ healthData, insights, onVoiceCommand }: ConversationalAIProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [conversationStarted, setConversationStarted] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('AI Assistant connected');
    },
    onDisconnect: () => {
      console.log('AI Assistant disconnected');
      setConversationStarted(false);
    },
    onMessage: (message) => {
      console.log('AI Message:', message);
      // Handle voice commands
      if (onVoiceCommand && message.source === 'user') {
        onVoiceCommand(message.message);
      }
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
    },
    clientTools: {
      getHealthData: () => {
        return JSON.stringify({
          heartRate: healthData?.heartRate || 0,
          bloodPressure: healthData?.bloodPressure || {},
          temperature: healthData?.temperature || 0,
          oxygenSat: healthData?.oxygenSat || 0
        });
      },
      getHealthInsights: () => {
        return JSON.stringify(insights.slice(0, 3));
      }
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `You are a helpful AI health assistant. You can access the user's current health data and provide insights. 
                   Be supportive, informative, and encourage users to consult healthcare professionals for medical advice.
                   You can help explain health metrics, trends, and provide general wellness guidance.
                   Current health data is available through getHealthData() and insights through getHealthInsights().`
        },
        firstMessage: "Hi! I'm your AI health assistant. I can help explain your health data, answer questions about your vital signs, or provide wellness guidance. How can I help you today?",
        language: "en"
      }
    }
  });

  const handleStartConversation = async () => {
    if (!apiKey) return;
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start conversation with public agent (replace with actual agent ID)
      await conversation.startSession({ 
        agentId: 'your-agent-id' // User would need to create this in ElevenLabs
      });
      
      setConversationStarted(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleEndConversation = async () => {
    await conversation.endSession();
    setConversationStarted(false);
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    await conversation.setVolume({ volume: newVolume });
  };

  if (showKeyInput && !apiKey) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Voice Assistant
          </CardTitle>
          <CardDescription>
            Enter your ElevenLabs API key to enable voice conversations with your AI health assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              You'll need an ElevenLabs API key and configured agent. Visit{' '}
              <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">
                ElevenLabs
              </a>{' '}
              to get started.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">ElevenLabs API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          
          <Button 
            onClick={() => setShowKeyInput(false)} 
            disabled={!apiKey}
            className="bg-gradient-primary"
          >
            Enable Voice Assistant
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          AI Voice Assistant
          <Badge variant={conversationStarted ? "default" : "secondary"}>
            {conversationStarted ? "Active" : "Inactive"}
          </Badge>
          {conversation.isSpeaking && (
            <Badge variant="outline" className="animate-pulse">
              Speaking...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Speak naturally to get insights about your health data and ask questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center gap-3">
          {!conversationStarted ? (
            <Button 
              onClick={handleStartConversation}
              className="bg-gradient-primary"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
          ) : (
            <Button 
              onClick={handleEndConversation}
              variant="destructive"
            >
              <MicOff className="h-4 w-4 mr-2" />
              End Conversation
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.8)}
            >
              {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16"
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={conversation.status === 'connected' ? 'default' : 'secondary'}>
              {conversation.status || 'disconnected'}
            </Badge>
          </div>
          
          {conversation.isSpeaking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              AI is speaking...
            </div>
          )}
        </div>

        {/* Quick Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Try saying:</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="p-2 bg-muted/20 rounded text-muted-foreground">
              "What's my current heart rate?"
            </div>
            <div className="p-2 bg-muted/20 rounded text-muted-foreground">
              "Explain my health insights"
            </div>
            <div className="p-2 bg-muted/20 rounded text-muted-foreground">
              "How is my health trending?"
            </div>
            <div className="p-2 bg-muted/20 rounded text-muted-foreground">
              "Show my blood pressure chart"
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyInput(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalAI;
