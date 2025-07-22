
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  User,
  LogOut,
  Eye
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const ProfessionalDashboard = () => {
  const { currentUser, patients, setSelectedPatient, logout } = useUser();
  const navigate = useNavigate();

  const handleViewPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      navigate('/patient');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock statistics
  const stats = {
    totalPatients: patients.length,
    criticalAlerts: patients.filter(p => p.riskLevel === 'high').length,
    activeMonitoring: patients.length,
    newAlerts: 3
  };

  const criticalPatients = patients.filter(p => p.riskLevel === 'high');

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Professional Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {currentUser?.name} - Healthcare Professional
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-gradient-secondary text-secondary-foreground">
              <Users className="w-3 h-3 mr-1" />
              {stats.totalPatients} Patients
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalPatients.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {criticalPatients.length} patient(s) require immediate attention: {' '}
              {criticalPatients.map(p => p.name).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active monitoring</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMonitoring}</div>
              <p className="text-xs text-muted-foreground">Real-time data</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Alerts</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newAlerts}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Patient Overview</CardTitle>
            <CardDescription>
              Monitor and manage all patients from this central dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-gradient-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{patient.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ID: {patient.medicalId} • Age: {patient.age}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Conditions: {patient.medicalHistory.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        patient.riskLevel === 'high' ? 'destructive' : 
                        patient.riskLevel === 'medium' ? 'default' : 'secondary'
                      }
                    >
                      {patient.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleViewPatient(patient.id)}
                      className="bg-gradient-primary"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
