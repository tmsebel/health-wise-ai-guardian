
import { AIInsight } from './AIAnalysisEngine';
import { HealthEpisodePrediction } from './AdvancedPredictiveEngine';

export interface SmartAlert {
  id: string;
  type: 'health_episode' | 'anomaly' | 'medication' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  actionRequired: boolean;
  suppressionRules?: string[];
  escalationPath?: string[];
  relatedInsights: string[];
}

export interface NotificationPreferences {
  enableVoice: boolean;
  enablePush: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  quietHours: { start: string; end: string };
  emergencyContacts: string[];
  professionalContacts: string[];
}

export interface AlertContext {
  patientId: string;
  currentMedications: string[];
  recentAlerts: SmartAlert[];
  healthHistory: string[];
  stressFactors: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
}

export class IntelligentAlertSystem {
  private alertHistory: Map<string, SmartAlert[]> = new Map();
  private suppressionRules: Map<string, any> = new Map();
  private notificationQueue: SmartAlert[] = [];

  // Smart Alert Prioritization
  prioritizeAlerts(
    insights: AIInsight[], 
    predictions: HealthEpisodePrediction[], 
    context: AlertContext
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // Convert predictions to alerts
    for (const prediction of predictions) {
      if (prediction.probability > 0.3) {
        alerts.push(this.createPredictionAlert(prediction, context));
      }
    }

    // Convert insights to alerts
    for (const insight of insights) {
      if (insight.severity === 'high' || insight.severity === 'critical') {
        alerts.push(this.createInsightAlert(insight, context));
      }
    }

    // Apply intelligent filtering
    const filteredAlerts = this.applyAlertFiltering(alerts, context);
    
    // Sort by priority and relevance
    return this.rankAlerts(filteredAlerts, context);
  }

  // Alert Fatigue Prevention
  private applyAlertFiltering(alerts: SmartAlert[], context: AlertContext): SmartAlert[] {
    const filtered: SmartAlert[] = [];

    for (const alert of alerts) {
      // Check suppression rules
      if (this.shouldSuppressAlert(alert, context)) {
        continue;
      }

      // Check for similar recent alerts
      if (this.isDuplicateAlert(alert, context)) {
        continue;
      }

      // Check quiet hours for non-critical alerts
      if (this.isInQuietHours(alert, context)) {
        continue;
      }

      // Apply context-specific filtering
      if (this.passesContextualFilters(alert, context)) {
        filtered.push(alert);
      }
    }

    return filtered;
  }

  // Professional Notification System
  escalateToProfessionals(
    alert: SmartAlert, 
    context: AlertContext, 
    preferences: NotificationPreferences
  ): void {
    if (alert.priority === 'critical' || alert.type === 'emergency') {
      // Immediate escalation
      this.sendProfessionalNotification(alert, context, preferences, 'immediate');
    } else if (alert.priority === 'high' && alert.actionRequired) {
      // Scheduled escalation
      setTimeout(() => {
        if (!alert.acknowledged) {
          this.sendProfessionalNotification(alert, context, preferences, 'scheduled');
        }
      }, 30 * 60 * 1000); // 30 minutes
    }
  }

  // Emergency Response System
  handleEmergencyAlert(
    alert: SmartAlert, 
    context: AlertContext, 
    preferences: NotificationPreferences
  ): void {
    console.log('🚨 EMERGENCY ALERT TRIGGERED:', alert.title);

    // Immediate notifications to all emergency contacts
    for (const contact of preferences.emergencyContacts) {
      this.sendEmergencyNotification(alert, contact, context);
    }

    // Professional notification
    if (preferences.professionalContacts.length > 0) {
      for (const contact of preferences.professionalContacts) {
        this.sendProfessionalEmergencyNotification(alert, contact, context);
      }
    }

    // Store emergency event
    this.logEmergencyEvent(alert, context);
  }

  // Context-Aware Notification Delivery
  deliverNotification(
    alert: SmartAlert, 
    context: AlertContext, 
    preferences: NotificationPreferences
  ): void {
    const deliveryMethods = this.selectDeliveryMethods(alert, context, preferences);

    for (const method of deliveryMethods) {
      switch (method) {
        case 'voice':
          this.deliverVoiceNotification(alert, context);
          break;
        case 'push':
          this.deliverPushNotification(alert);
          break;
        case 'email':
          this.deliverEmailNotification(alert, context);
          break;
        case 'sms':
          this.deliverSMSNotification(alert, context);
          break;
      }
    }
  }

  // Alert Acknowledgment and Feedback
  acknowledgeAlert(alertId: string, feedback?: string): void {
    const alert = this.findAlert(alertId);
    if (alert) {
      alert.acknowledged = true;
      
      // Learn from feedback
      if (feedback) {
        this.learnFromFeedback(alert, feedback);
      }
      
      console.log(`Alert ${alertId} acknowledged`);
    }
  }

  // Helper Methods

  private createPredictionAlert(prediction: HealthEpisodePrediction, context: AlertContext): SmartAlert {
    const priority = prediction.severity === 'critical' ? 'critical' : 
                    prediction.severity === 'high' ? 'high' : 'medium';

    return {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: prediction.type === 'cardiac_event' ? 'emergency' : 'health_episode',
      priority,
      title: `${prediction.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Risk`,
      message: `AI predicts ${Math.round(prediction.probability * 100)}% chance of ${prediction.type.replace('_', ' ')} in ${prediction.timeframe}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      actionRequired: priority === 'critical' || priority === 'high',
      relatedInsights: [`Confidence: ${prediction.confidence}%`, ...prediction.triggers],
      escalationPath: priority === 'critical' ? ['emergency_contacts', 'professional_contacts'] : ['professional_contacts']
    };
  }

  private createInsightAlert(insight: AIInsight, context: AlertContext): SmartAlert {
    const priority = insight.severity === 'critical' ? 'critical' : 
                    insight.severity === 'high' ? 'high' : 'medium';

    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'anomaly',
      priority,
      title: insight.title,
      message: insight.description,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      actionRequired: priority === 'high' || priority === 'critical',
      relatedInsights: [insight.explanation, `Confidence: ${insight.confidence}%`],
      escalationPath: priority === 'critical' ? ['emergency_contacts', 'professional_contacts'] : []
    };
  }

  private shouldSuppressAlert(alert: SmartAlert, context: AlertContext): boolean {
    // Check for medication-related suppression
    if (alert.type === 'anomaly' && context.currentMedications.length > 0) {
      // Suppress certain alerts if patient is on relevant medications
      const suppressionMeds = ['beta-blockers', 'ace-inhibitors', 'calcium-channel-blockers'];
      if (context.currentMedications.some(med => 
        suppressionMeds.some(suppress => med.toLowerCase().includes(suppress.toLowerCase()))
      )) {
        return alert.title.toLowerCase().includes('blood pressure') && alert.priority !== 'critical';
      }
    }

    // Check for time-based suppression
    const recentSimilarAlerts = context.recentAlerts.filter(recent => 
      recent.type === alert.type && 
      recent.title === alert.title &&
      (Date.now() - new Date(recent.timestamp).getTime()) < 2 * 60 * 60 * 1000 // 2 hours
    );

    return recentSimilarAlerts.length >= 2; // Suppress if more than 2 similar alerts in 2 hours
  }

  private isDuplicateAlert(alert: SmartAlert, context: AlertContext): boolean {
    return context.recentAlerts.some(recent => 
      recent.title === alert.title && 
      recent.message === alert.message &&
      (Date.now() - new Date(recent.timestamp).getTime()) < 30 * 60 * 1000 // 30 minutes
    );
  }

  private isInQuietHours(alert: SmartAlert, context: AlertContext): boolean {
    if (alert.priority === 'critical' || alert.type === 'emergency') {
      return false; // Never suppress critical/emergency alerts
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Default quiet hours: 10 PM to 7 AM
    const quietStart = 22 * 60; // 10 PM
    const quietEnd = 7 * 60;    // 7 AM
    
    if (quietStart > quietEnd) {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart && currentTime <= quietEnd;
    }
  }

  private passesContextualFilters(alert: SmartAlert, context: AlertContext): boolean {
    // Filter based on stress factors
    if (context.stressFactors.includes('high_stress_period') && alert.priority === 'low') {
      return false;
    }

    // Filter based on day/time
    if (context.timeOfDay === 'night' && alert.priority === 'medium' && !alert.actionRequired) {
      return false;
    }

    return true;
  }

  private rankAlerts(alerts: SmartAlert[], context: AlertContext): SmartAlert[] {
    return alerts.sort((a, b) => {
      // Priority ranking
      const priorityScore = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Action required ranking
      if (a.actionRequired !== b.actionRequired) {
        return b.actionRequired ? 1 : -1;
      }
      
      // Timestamp ranking (newer first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  private selectDeliveryMethods(
    alert: SmartAlert, 
    context: AlertContext, 
    preferences: NotificationPreferences
  ): string[] {
    const methods: string[] = [];

    if (alert.priority === 'critical' || alert.type === 'emergency') {
      // Use all available methods for critical alerts
      if (preferences.enableVoice) methods.push('voice');
      if (preferences.enablePush) methods.push('push');
      if (preferences.enableSMS) methods.push('sms');
      if (preferences.enableEmail) methods.push('email');
    } else if (alert.priority === 'high') {
      // Use primary methods
      if (preferences.enablePush) methods.push('push');
      if (preferences.enableVoice && context.timeOfDay !== 'night') methods.push('voice');
    } else {
      // Use non-intrusive methods
      if (preferences.enablePush) methods.push('push');
    }

    return methods;
  }

  private sendProfessionalNotification(
    alert: SmartAlert, 
    context: AlertContext, 
    preferences: NotificationPreferences, 
    urgency: 'immediate' | 'scheduled'
  ): void {
    console.log(`📞 Professional notification (${urgency}):`, alert.title);
    // Implementation would integrate with actual notification services
  }

  private sendEmergencyNotification(alert: SmartAlert, contact: string, context: AlertContext): void {
    console.log(`🚨 Emergency notification to ${contact}:`, alert.title);
    // Implementation would integrate with emergency notification services
  }

  private sendProfessionalEmergencyNotification(
    alert: SmartAlert, 
    contact: string, 
    context: AlertContext
  ): void {
    console.log(`⚕️ Professional emergency notification to ${contact}:`, alert.title);
    // Implementation would integrate with professional notification services
  }

  private deliverVoiceNotification(alert: SmartAlert, context: AlertContext): void {
    console.log(`🔊 Voice notification: ${alert.message}`);
    // Would integrate with text-to-speech service
  }

  private deliverPushNotification(alert: SmartAlert): void {
    console.log(`📱 Push notification: ${alert.title}`);
    // Would integrate with push notification service
  }

  private deliverEmailNotification(alert: SmartAlert, context: AlertContext): void {
    console.log(`📧 Email notification: ${alert.title}`);
    // Would integrate with email service
  }

  private deliverSMSNotification(alert: SmartAlert, context: AlertContext): void {
    console.log(`💬 SMS notification: ${alert.title}`);
    // Would integrate with SMS service
  }

  private logEmergencyEvent(alert: SmartAlert, context: AlertContext): void {
    console.log(`📝 Emergency event logged: ${alert.id}`);
    // Would integrate with emergency logging system
  }

  private findAlert(alertId: string): SmartAlert | undefined {
    for (const alerts of this.alertHistory.values()) {
      const found = alerts.find(alert => alert.id === alertId);
      if (found) return found;
    }
    return undefined;
  }

  private learnFromFeedback(alert: SmartAlert, feedback: string): void {
    console.log(`🧠 Learning from feedback for alert ${alert.id}: ${feedback}`);
    // Implement machine learning from user feedback
  }
}
