import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { PhoneFrame } from "@/components/PhoneFrame";

import SplashScreen from "@/screens/SplashScreen";
import AccountTypeScreen from "@/screens/AccountTypeScreen";
import LoginScreen from "@/screens/LoginScreen";
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

function App() {
  return (
    <AppProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route element={<PhoneFrame />}>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/account-type" element={<AccountTypeScreen />} />
              <Route path="/login" element={<LoginScreen />} />

              {/* Creator */}
              <Route path="/home" element={<HomeFeed />} />
              <Route path="/opportunity/:id" element={<OpportunityDetails />} />
              <Route path="/application-submitted" element={<ApplicationSubmitted />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/application/:id" element={<ApplicationStatus />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/saved" element={<SavedScreen />} />
              <Route path="/brands" element={<BrandsList />} />

              {/* Shared */}
              <Route path="/messages" element={<Messages />} />
              <Route path="/chat/:id" element={<ChatScreen />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Brand */}
              <Route path="/brand/dashboard" element={<BrandDashboard />} />
              <Route path="/brand/applicants" element={<ApplicantsList />} />
              <Route path="/brand/discover" element={<BrandDiscover />} />
              <Route path="/brand/post" element={<PostOpportunity />} />
              <Route path="/brand/post/:id" element={<BrandPostDetail />} />

              <Route path="/brand/requirements" element={<AddRequirements />} />
              <Route path="/brand/creator/:id" element={<CreatorProfileBrandView />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </AppProvider>
  );
}

export default App;
