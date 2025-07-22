
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const PatientSelector = () => {
  const { selectedPatient, patients, setSelectedPatient, currentUser } = useUser();

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  };

  // If user is a patient, don't show selector
  if (currentUser?.role === 'patient') {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Patient Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Select Patient:</label>
        <Select
          value={selectedPatient?.id || ""}
          onValueChange={handlePatientChange}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a patient to monitor" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {patient.name} ({patient.medicalId})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Patient Info Card */}
      {selectedPatient && (
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Age: {selectedPatient.age} • ID: {selectedPatient.medicalId}
                  </p>
                </div>
              </div>
              <Badge 
                variant={
                  selectedPatient.riskLevel === 'high' ? 'destructive' : 
                  selectedPatient.riskLevel === 'medium' ? 'default' : 'secondary'
                }
              >
                {selectedPatient.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-muted-foreground mb-1">Medical History</h4>
                <p>{selectedPatient.medicalHistory.join(', ') || 'None'}</p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground mb-1">Current Medications</h4>
                <p>{selectedPatient.currentMedications.join(', ') || 'None'}</p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground mb-1">Emergency Contact</h4>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <p>{selectedPatient.emergencyContact}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientSelector;
