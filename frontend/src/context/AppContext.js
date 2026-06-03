import { createContext, useContext, useState } from "react";
import { DEFAULT_USER, MY_APPLICATIONS, OPPORTUNITIES, MESSAGES_THREADS, NOTIFICATIONS, ACTIVE_POSTS } from "@/data/mockData";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [accountType, setAccountType] = useState("creator"); // "creator" | "brand"
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(DEFAULT_USER);
  const [applications, setApplications] = useState(MY_APPLICATIONS);
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES);
  const [threads] = useState(MESSAGES_THREADS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activePosts, setActivePosts] = useState(ACTIVE_POSTS);
  const [draftOpportunity, setDraftOpportunity] = useState({});

  const switchMode = (mode) => setAccountType(mode);
  const logout = () => { setIsAuthed(false); };

  const addApplication = (opportunityId, brandName) => {
    const newApp = {
      id: `a-${Date.now()}`,
      opportunityId,
      brandName,
      appliedOn: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      status: "applied",
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const withdrawApplication = (appId) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  const publishOpportunity = (data) => {
    const newPost = { id: `p-${Date.now()}`, title: data.title, needed: data.creatorsNeeded || 5, applicants: 0 };
    setActivePosts((prev) => [newPost, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <AppContext.Provider
      value={{
        accountType, setAccountType, switchMode,
        isAuthed, setIsAuthed, logout,
        user, setUser,
        applications, addApplication, withdrawApplication,
        opportunities,
        threads,
        notifications, markAllNotificationsRead,
        activePosts, publishOpportunity,
        draftOpportunity, setDraftOpportunity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
