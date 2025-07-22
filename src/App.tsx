
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Index from "./pages/Index";
import ProfessionalDashboard from "./components/ProfessionalDashboard";
import HealthDashboard from "./components/HealthDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }: { 
  children: React.ReactNode; 
  requiredRole?: 'patient' | 'professional' 
}) => {
  const { currentUser } = useUser();
  
  if (!currentUser) {
    return <Index />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Index />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser } = useUser();
  
  return (
    <Routes>
      <Route path="/" element={currentUser ? (
        currentUser.role === 'professional' ? <ProfessionalDashboard /> : <HealthDashboard />
      ) : <Index />} />
      <Route path="/professional" element={
        <ProtectedRoute requiredRole="professional">
          <ProfessionalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/patient" element={
        <ProtectedRoute>
          <HealthDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
