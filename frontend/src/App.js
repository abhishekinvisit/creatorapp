import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { PhoneFrame } from "@/components/PhoneFrame";

import SplashScreen from "@/screens/SplashScreen";
import AccountTypeScreen from "@/screens/AccountTypeScreen";
import LoginScreen from "@/screens/LoginScreen";
import CreatorOnboarding from "@/screens/CreatorOnboarding";
import BrandOnboarding from "@/screens/BrandOnboarding";
import HomeFeed from "@/screens/HomeFeed";
import OpportunityDetails from "@/screens/OpportunityDetails";
import ApplicationSubmitted from "@/screens/ApplicationSubmitted";
import MyApplications from "@/screens/MyApplications";
import ApplicationStatus from "@/screens/ApplicationStatus";
import BrandDashboard from "@/screens/BrandDashboard";
import PostOpportunity from "@/screens/PostOpportunity";
import AddRequirements from "@/screens/AddRequirements";
import ApplicantsList from "@/screens/ApplicantsList";
import BrandPostDetail from "@/screens/BrandPostDetail";
import BrandDiscover from "@/screens/BrandDiscover";
import CreatorProfileBrandView from "@/screens/CreatorProfileBrandView";
import Messages from "@/screens/Messages";
import ChatScreen from "@/screens/ChatScreen";
import Notifications from "@/screens/Notifications";
import SearchScreen from "@/screens/SearchScreen";
import SavedScreen from "@/screens/SavedScreen";
import Settings from "@/screens/Settings";
import EditProfile from "@/screens/EditProfile";
import BrandsList from "@/screens/BrandsList";
import MyProfile from "@/screens/MyProfile";
import SavedCreatorsScreen from "@/screens/SavedCreatorsScreen";
import PublicCreatorProfile from "@/screens/PublicCreatorProfile";

// Admin
import { AdminProvider, useAdmin } from "@/admin/AdminContext";
import AdminLogin from "@/admin/AdminLogin";
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/pages/Dashboard";
import Users from "@/admin/pages/Users";
import Creators from "@/admin/pages/Creators";
import Brands from "@/admin/pages/Brands";
import Verification from "@/admin/pages/Verification";
import Analytics from "@/admin/pages/Analytics";
import Blogs from "@/admin/pages/Blogs";
import AdminLogs from "@/admin/pages/AdminLogs";
import AdminSettings from "@/admin/pages/Settings";

// ── Loading spinner ────────────────────────────────────────────────────────────
function AuthLoading() {
  return (
    <div className="min-h-full flex items-center justify-center bg-[#F9F9F8]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#E25238] to-[#F59E0B] flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-white" />
        </div>
        <p className="text-sm font-bold text-[#525252] uppercase tracking-widest">RYTSPOT</p>
      </div>
    </div>
  );
}

// ── Route guards (app) ────────────────────────────────────────────────────────
function AppRoute({ children }) {
  const { isAuthed, onboardingComplete, authLoading } = useApp();
  if (authLoading) return <AuthLoading />;
  if (!isAuthed) return <Navigate to="/" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

function OnboardingRoute({ children }) {
  const { isAuthed, onboardingComplete, accountType, authLoading } = useApp();
  if (authLoading) return <AuthLoading />;
  if (!isAuthed) return <Navigate to="/" replace />;
  if (onboardingComplete) {
    return <Navigate to={accountType === "brand" ? "/brand/dashboard" : "/home"} replace />;
  }
  return children;
}

// ── Admin route guard ─────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { admin, loading } = useAdmin();
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E25238] to-[#F59E0B] animate-pulse" />
    </div>
  );
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

// ── App routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { accountType } = useApp();

  return (
    <Routes>
      {/* ── Admin panel (full-screen, no PhoneFrame) ─── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="users"        element={<Users />} />
        <Route path="creators"     element={<Creators />} />
        <Route path="brands"       element={<Brands />} />
        <Route path="verification" element={<Verification />} />
        <Route path="analytics"    element={<Analytics />} />
        <Route path="blogs"        element={<Blogs />} />
        <Route path="logs"         element={<AdminLogs />} />
        <Route path="settings"     element={<AdminSettings />} />
      </Route>

      {/* ── Main app (PhoneFrame) ─── */}
      <Route element={<PhoneFrame />}>
        {/* Public */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/account-type" element={<AccountTypeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/creator/:id" element={<PublicCreatorProfile />} />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              {accountType === "brand" ? <BrandOnboarding /> : <CreatorOnboarding />}
            </OnboardingRoute>
          }
        />

        {/* Creator — protected */}
        <Route path="/home" element={<AppRoute><HomeFeed /></AppRoute>} />
        <Route path="/opportunity/:id" element={<AppRoute><OpportunityDetails /></AppRoute>} />
        <Route path="/application-submitted" element={<AppRoute><ApplicationSubmitted /></AppRoute>} />
        <Route path="/applications" element={<AppRoute><MyApplications /></AppRoute>} />
        <Route path="/application/:id" element={<AppRoute><ApplicationStatus /></AppRoute>} />
        <Route path="/search" element={<AppRoute><SearchScreen /></AppRoute>} />
        <Route path="/saved" element={<AppRoute><SavedScreen /></AppRoute>} />
        <Route path="/brands" element={<AppRoute><BrandsList /></AppRoute>} />

        {/* Shared — protected */}
        <Route path="/messages" element={<AppRoute><Messages /></AppRoute>} />
        <Route path="/chat/:id" element={<AppRoute><ChatScreen /></AppRoute>} />
        <Route path="/notifications" element={<AppRoute><Notifications /></AppRoute>} />
        <Route path="/profile" element={<AppRoute><MyProfile /></AppRoute>} />
        <Route path="/profile/edit" element={<AppRoute><EditProfile /></AppRoute>} />
        <Route path="/settings" element={<AppRoute><Settings /></AppRoute>} />

        {/* Brand — protected */}
        <Route path="/brand/dashboard" element={<AppRoute><BrandDashboard /></AppRoute>} />
        <Route path="/brand/applicants" element={<AppRoute><ApplicantsList /></AppRoute>} />
        <Route path="/brand/discover" element={<AppRoute><BrandDiscover /></AppRoute>} />
        <Route path="/brand/post" element={<AppRoute><PostOpportunity /></AppRoute>} />
        <Route path="/brand/post/:id" element={<AppRoute><BrandPostDetail /></AppRoute>} />
        <Route path="/brand/requirements" element={<AppRoute><AddRequirements /></AppRoute>} />
        <Route path="/brand/creator/:id" element={<AppRoute><CreatorProfileBrandView /></AppRoute>} />
        <Route path="/brand/saved-creators" element={<AppRoute><SavedCreatorsScreen /></AppRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AdminProvider>
      <AppProvider>
        <div className="App">
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </div>
      </AppProvider>
    </AdminProvider>
  );
}

export default App;
