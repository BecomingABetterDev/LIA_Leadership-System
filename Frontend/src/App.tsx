import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  PublicDataProvider,
  usePublicData,
} from "@/contexts/PublicDataContext";
import { AdminProvider } from "@/contexts/AdminContext"; // ✅ added

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

import Index from "./pages/Index";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Evaluation from "./pages/Evaluation";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ApplicationStatus from "./pages/ApplicationStatus";
import ClubAttendance from "./pages/ClubAttendance";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentResults from "./pages/admin/StudentResults";
import TokenDistribution from "./pages/admin/TokenDistribution";
import EventsAndApprovals from "./pages/admin/EventsAndApprovals";
import EventStatus from "./pages/admin/EventStatus";
import ClubManagement from "./pages/admin/ClubManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import AccountManagement from "./pages/admin/AccountManagement";
import EvaluationSettings from "./pages/admin/EvaluationSettings";
import TrimesterTransition from "./pages/admin/TrimesterTransition";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🔹 Combined full-screen loader for auth or public data
const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// 🔹 Routes separated so we can use auth state
const AppRoutes = () => {
  const { isCheckingAuth } = useAuth();
  const { isLoading: isPublicDataLoading, isListingReqs } = usePublicData();

  // 🔹 show loader if either auth or public data is still loading
  if (isCheckingAuth || isPublicDataLoading || isListingReqs)
    return <FullScreenLoader />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <PwaInstallPrompt />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/applications" element={<ApplicationStatus />} />
        </Route>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Club Attendance */}
        <Route path="/club-attendance" element={<ClubAttendance />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentResults />} />
          <Route path="tokens" element={<TokenDistribution />} />
          <Route path="events" element={<EventsAndApprovals />} />
          <Route path="status" element={<EventStatus />} />
          <Route path="clubs" element={<ClubManagement />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="evaluation" element={<EvaluationSettings />} />
          <Route path="trimester" element={<TrimesterTransition />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PublicDataProvider>
          <AdminProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AdminProvider>
        </PublicDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
