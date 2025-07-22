
import LoginForm from "@/components/LoginForm";
import { useUser } from "@/contexts/UserContext";
import ProfessionalDashboard from "@/components/ProfessionalDashboard";
import HealthDashboard from "@/components/HealthDashboard";

const Index = () => {
  const { currentUser } = useUser();
  
  // If user is logged in, redirect to appropriate dashboard
  if (currentUser) {
    return currentUser.role === 'professional' ? <ProfessionalDashboard /> : <HealthDashboard />;
  }
  
  return <LoginForm />;
};

export default Index;
