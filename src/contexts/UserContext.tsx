
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Patient {
  id: string;
  name: string;
  age: number;
  medicalId: string;
  medicalHistory: string[];
  currentMedications: string[];
  emergencyContact: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  role: 'patient' | 'professional';
  email: string;
}

interface UserContextType {
  currentUser: User | null;
  selectedPatient: Patient | null;
  patients: Patient[];
  setCurrentUser: (user: User | null) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  login: (email: string, password: string, role: 'patient' | 'professional') => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock patient data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Siyabonga',
    age: 45,
    medicalId: 'MED001',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Metformin', 'Lisinopril'],
    emergencyContact: '+27 (079) 123-4567',
    riskLevel: 'high'
  },
  {
    id: '2',
    name: 'Gregory Middleton',
    age: 52,
    medicalId: 'MED002',
    medicalHistory: ['Asthma'],
    currentMedications: ['Albuterol Inhaler'],
    emergencyContact: '+27 (082) 987-6543',
    riskLevel: 'medium'
  },
  {
    id: '3',
    name: 'Malick Dube',
    age: 28,
    medicalId: 'MED003',
    medicalHistory: ['Healthy'],
    currentMedications: [],
    emergencyContact: '+27 (083) 456-7890',
    riskLevel: 'low'
  }
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients] = useState<Patient[]>(mockPatients);

  const login = (email: string, password: string, role: 'patient' | 'professional'): boolean => {
    // Mock authentication - in real app, this would be an API call
    if (email && password) {
      const user: User = {
        id: '1',
        name: role === 'professional' ? 'Dr. Tawana Msebele' : 'Siyabonga Mthembu' : 'Banele Mnqobi',
        role,
        email
      };
      setCurrentUser(user);
      
      // If patient role, auto-select first patient
      if (role === 'patient') {
        setSelectedPatient(mockPatients[0]);
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedPatient(null);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      selectedPatient,
      patients,
      setCurrentUser,
      setSelectedPatient,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
