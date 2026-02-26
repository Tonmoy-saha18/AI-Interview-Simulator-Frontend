import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import HRDashboard from "./pages/HRDashboard";
import HRResults from "./pages/HRResults";
import TokenInterview from "./pages/TokenInterview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewReport from "./pages/InterviewReport";
import AdminProblems from "./pages/AdminProblems";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/interview/:token" element={<TokenInterview />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/report/:sessionId"
              element={
                <ProtectedRoute>
                  <InterviewReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={["hr", "org_admin", "platform_admin"]}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/results/:interviewId"
              element={
                <ProtectedRoute allowedRoles={["hr", "org_admin", "platform_admin"]}>
                  <HRResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/problems"
              element={
                <ProtectedRoute allowedRoles={["platform_admin", "org_admin"]}>
                  <AdminProblems />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
