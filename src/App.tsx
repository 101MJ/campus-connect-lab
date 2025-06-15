
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Communities from "./pages/Communities";
import ProfileSettings from "./pages/ProfileSettings";
import Showcase from "./pages/Showcase";
import ShowcaseProjectDetail from "./pages/ShowcaseProjectDetail";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Dashboard routes - nested under DashboardLayout */}
              <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
              <Route path="/dashboard/projects" element={<DashboardLayout><Projects /></DashboardLayout>} />
              <Route path="/dashboard/communities" element={<DashboardLayout><Communities /></DashboardLayout>} />
              <Route path="/dashboard/settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />
              <Route path="/dashboard/showcase" element={<DashboardLayout><Showcase /></DashboardLayout>} />
              
              {/* Standalone routes - removed duplicate DashboardLayout wrapper */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="/showcase/:id" element={<ShowcaseProjectDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
