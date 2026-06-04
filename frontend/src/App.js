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

// Route guard: must be authed AND have completed onboarding
function AppRoute({ children }) {
  const { isAuthed, onboardingComplete } = useApp();
  if (!isAuthed) return <Navigate to="/" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

// Route guard: must be authed but onboarding NOT yet done
function OnboardingRoute({ children }) {
  const { isAuthed, onboardingComplete, accountType } = useApp();
  if (!isAuthed) return <Navigate to="/" replace />;
  if (onboardingComplete) {
    return <Navigate to={accountType === "brand" ? "/brand/dashboard" : "/home"} replace />;
  }
  return children;
}

function AppRoutes() {
  const { accountType } = useApp();

  return (
    <Routes>
      <Route element={<PhoneFrame />}>
        {/* Public */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/account-type" element={<AccountTypeScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        {/* Onboarding — authed but not yet complete */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <div className="App">
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </AppProvider>
  );
}

export default App;
