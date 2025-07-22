
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, User, Stethoscope } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'professional'>('patient');
  const [error, setError] = useState('');
  const { login } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password, selectedRole);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gradient-card shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Health Dashboard Login</CardTitle>
          <CardDescription>
            Access your health monitoring dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Login as:</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedRole === 'patient' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('patient')}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Patient
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === 'professional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole('professional')}
                  className="flex-1"
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Professional
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-primary">
              Login as {selectedRole === 'patient' ? 'Patient' : 'Healthcare Professional'}
            </Button>

            {/* Demo credentials */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <div className="font-medium">Demo Credentials:</div>
              <div>Email: demo@health.com</div>
              <div>Password: demo123</div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
