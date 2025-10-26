
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { useSupabaseHeartbeat } from "./hooks/use-supabase-heartbeat";

const queryClient = new QueryClient();

const AppContent = () => {
  // Manter Supabase ativo com heartbeat periódico
  useSupabaseHeartbeat();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;
