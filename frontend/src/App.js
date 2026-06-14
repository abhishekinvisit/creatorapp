import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AdminProvider, useAdmin } from "@/admin/AdminContext";

// ── Eager (critical path — shown before any auth check) ───────────────────────
import SplashScreen from "@/screens/SplashScreen";
import LoginScreen from "@/screens/LoginScreen";
import AccountTypeScreen from "@/screens/AccountTypeScreen";

// ── Lazy: app screens ─────────────────────────────────────────────────────────
const CreatorOnboarding       = lazy(() => import("@/screens/CreatorOnboarding"));
const BrandOnboarding         = lazy(() => import("@/screens/BrandOnboarding"));
const HomeFeed                = lazy(() => import("@/screens/HomeFeed"));
const OpportunityDetails      = lazy(() => import("@/screens/OpportunityDetails"));
const ApplicationSubmitted    = lazy(() => import("@/screens/ApplicationSubmitted"));
const MyApplications          = lazy(() => import("@/screens/MyApplications"));
const ApplicationStatus       = lazy(() => import("@/screens/ApplicationStatus"));
const BrandDashboard          = lazy(() => import("@/screens/BrandDashboard"));
const PostOpportunity         = lazy(() => import("@/screens/PostOpportunity"));
const AddRequirements         = lazy(() => import("@/screens/AddRequirements"));
const ApplicantsList          = lazy(() => import("@/screens/ApplicantsList"));
const BrandPostDetail         = lazy(() => import("@/screens/BrandPostDetail"));
const BrandDiscover           = lazy(() => import("@/screens/BrandDiscover"));
const CreatorProfileBrandView = lazy(() => import("@/screens/CreatorProfileBrandView"));
const Messages                = lazy(() => import("@/screens/Messages"));
const ChatScreen              = lazy(() => import("@/screens/ChatScreen"));
const Notifications           = lazy(() => import("@/screens/Notifications"));
const SearchScreen            = lazy(() => import("@/screens/SearchScreen"));
const SavedScreen             = lazy(() => import("@/screens/SavedScreen"));
const Settings                = lazy(() => import("@/screens/Settings"));
const EditProfile             = lazy(() => import("@/screens/EditProfile"));
const BrandsList              = lazy(() => import("@/screens/BrandsList"));
const MyProfile               = lazy(() => import("@/screens/MyProfile"));
const SavedCreatorsScreen     = lazy(() => import("@/screens/SavedCreatorsScreen"));
const PublicCreatorProfile    = lazy(() => import("@/screens/PublicCreatorProfile"));
const BlogList                = lazy(() => import("@/screens/BlogList"));
const BlogPost                = lazy(() => import("@/screens/BlogPost"));

// ── Lazy: admin pages ─────────────────────────────────────────────────────────
const AdminLogin    = lazy(() => import("@/admin/AdminLogin"));
const AdminLayout   = lazy(() => import("@/admin/AdminLayout"));
const Dashboard     = lazy(() => import("@/admin/pages/Dashboard"));
const Users         = lazy(() => import("@/admin/pages/Users"));
const Creators      = lazy(() => import("@/admin/pages/Creators"));
const Brands        = lazy(() => import("@/admin/pages/Brands"));
const Verification  = lazy(() => import("@/admin/pages/Verification"));
const Analytics     = lazy(() => import("@/admin/pages/Analytics"));
const Blogs         = lazy(() => import("@/admin/pages/Blogs"));
const AdminLogs     = lazy(() => import("@/admin/pages/AdminLogs"));
const AdminSettings = lazy(() => import("@/admin/pages/Settings"));

// ── Fallback spinners ─────────────────────────────────────────────────────────
function AppFallback() {
  return (
    <div className="min-h-full flex items-center justify-center bg-[#F9F9F8]">
      <div className="flex flex-col items-center gap-4">
        <img src="/rytspot-logo.png" alt="Rytspot" className="w-10 h-10 object-contain animate-pulse" />
        <p className="text-sm font-bold text-[#525252] uppercase tracking-widest">RYTSPOT</p>
      </div>
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <img src="/rytspot-logo.png" alt="Rytspot" className="w-8 h-8 object-contain animate-pulse" />
    </div>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────────
function AuthLoading() {
  return <AppFallback />;
}

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

function AdminRoute({ children }) {
  const { admin, loading } = useAdmin();
  if (loading) return <AdminFallback />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

// ── App routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { accountType } = useApp();

  return (
    <Routes>
      {/* ── Public blog (full-screen, no PhoneFrame) ─── */}
      <Route path="/blog" element={<Suspense fallback={<AppFallback />}><BlogList /></Suspense>} />
      <Route path="/blog/:slug" element={<Suspense fallback={<AppFallback />}><BlogPost /></Suspense>} />

      {/* ── Admin panel (full-screen, no PhoneFrame) ─── */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"    element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
        <Route path="users"        element={<Suspense fallback={<AdminFallback />}><Users /></Suspense>} />
        <Route path="creators"     element={<Suspense fallback={<AdminFallback />}><Creators /></Suspense>} />
        <Route path="brands"       element={<Suspense fallback={<AdminFallback />}><Brands /></Suspense>} />
        <Route path="verification" element={<Suspense fallback={<AdminFallback />}><Verification /></Suspense>} />
        <Route path="analytics"    element={<Suspense fallback={<AdminFallback />}><Analytics /></Suspense>} />
        <Route path="blogs"        element={<Suspense fallback={<AdminFallback />}><Blogs /></Suspense>} />
        <Route path="logs"         element={<Suspense fallback={<AdminFallback />}><AdminLogs /></Suspense>} />
        <Route path="settings"     element={<Suspense fallback={<AdminFallback />}><AdminSettings /></Suspense>} />
      </Route>

      {/* ── Main app (PhoneFrame) ─── */}
      <Route element={<PhoneFrame />}>
        {/* Public — eager */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/account-type" element={<AccountTypeScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        {/* Public — lazy */}
        <Route
          path="/creator/:id"
          element={<Suspense fallback={<AppFallback />}><PublicCreatorProfile /></Suspense>}
        />

        {/* Onboarding — lazy */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <Suspense fallback={<AppFallback />}>
                {accountType === "brand" ? <BrandOnboarding /> : <CreatorOnboarding />}
              </Suspense>
            </OnboardingRoute>
          }
        />

        {/* Creator — lazy + protected */}
        <Route path="/home"                element={<AppRoute><Suspense fallback={<AppFallback />}><HomeFeed /></Suspense></AppRoute>} />
        <Route path="/opportunity/:id"     element={<AppRoute><Suspense fallback={<AppFallback />}><OpportunityDetails /></Suspense></AppRoute>} />
        <Route path="/application-submitted" element={<AppRoute><Suspense fallback={<AppFallback />}><ApplicationSubmitted /></Suspense></AppRoute>} />
        <Route path="/applications"        element={<AppRoute><Suspense fallback={<AppFallback />}><MyApplications /></Suspense></AppRoute>} />
        <Route path="/application/:id"     element={<AppRoute><Suspense fallback={<AppFallback />}><ApplicationStatus /></Suspense></AppRoute>} />
        <Route path="/search"              element={<AppRoute><Suspense fallback={<AppFallback />}><SearchScreen /></Suspense></AppRoute>} />
        <Route path="/saved"               element={<AppRoute><Suspense fallback={<AppFallback />}><SavedScreen /></Suspense></AppRoute>} />
        <Route path="/brands"              element={<AppRoute><Suspense fallback={<AppFallback />}><BrandsList /></Suspense></AppRoute>} />

        {/* Shared — lazy + protected */}
        <Route path="/messages"            element={<AppRoute><Suspense fallback={<AppFallback />}><Messages /></Suspense></AppRoute>} />
        <Route path="/chat/:id"            element={<AppRoute><Suspense fallback={<AppFallback />}><ChatScreen /></Suspense></AppRoute>} />
        <Route path="/notifications"       element={<AppRoute><Suspense fallback={<AppFallback />}><Notifications /></Suspense></AppRoute>} />
        <Route path="/profile"             element={<AppRoute><Suspense fallback={<AppFallback />}><MyProfile /></Suspense></AppRoute>} />
        <Route path="/profile/edit"        element={<AppRoute><Suspense fallback={<AppFallback />}><EditProfile /></Suspense></AppRoute>} />
        <Route path="/settings"            element={<AppRoute><Suspense fallback={<AppFallback />}><Settings /></Suspense></AppRoute>} />

        {/* Brand — lazy + protected */}
        <Route path="/brand/dashboard"     element={<AppRoute><Suspense fallback={<AppFallback />}><BrandDashboard /></Suspense></AppRoute>} />
        <Route path="/brand/applicants"    element={<AppRoute><Suspense fallback={<AppFallback />}><ApplicantsList /></Suspense></AppRoute>} />
        <Route path="/brand/discover"      element={<AppRoute><Suspense fallback={<AppFallback />}><BrandDiscover /></Suspense></AppRoute>} />
        <Route path="/brand/post"          element={<AppRoute><Suspense fallback={<AppFallback />}><PostOpportunity /></Suspense></AppRoute>} />
        <Route path="/brand/post/:id"      element={<AppRoute><Suspense fallback={<AppFallback />}><BrandPostDetail /></Suspense></AppRoute>} />
        <Route path="/brand/requirements"  element={<AppRoute><Suspense fallback={<AppFallback />}><AddRequirements /></Suspense></AppRoute>} />
        <Route path="/brand/creator/:id"   element={<AppRoute><Suspense fallback={<AppFallback />}><CreatorProfileBrandView /></Suspense></AppRoute>} />
        <Route path="/brand/saved-creators" element={<AppRoute><Suspense fallback={<AppFallback />}><SavedCreatorsScreen /></Suspense></AppRoute>} />

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
