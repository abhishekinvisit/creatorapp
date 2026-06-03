import { createContext, useContext, useState } from "react";
import { DEFAULT_USER, MY_APPLICATIONS, OPPORTUNITIES, MESSAGES_THREADS, NOTIFICATIONS, ACTIVE_POSTS, BRANDS } from "@/data/mockData";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [accountType, setAccountType] = useState("creator"); // "creator" | "brand"
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(DEFAULT_USER);
  const [workedWith, setWorkedWith] = useState(BRANDS.slice(0, 6));
  const [applications, setApplications] = useState(MY_APPLICATIONS);
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES);
  const [threads, setThreads] = useState(MESSAGES_THREADS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activePosts, setActivePosts] = useState(ACTIVE_POSTS);
  const [savedIds, setSavedIds] = useState([]);
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
    const newPost = {
      id: `p-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      payout: data.payout || "",
      needed: parseInt(data.creatorsNeeded || data.needed || 5),
      deadline: data.deadline || "",
      applicants: 0,
      requirements: data.requirements || {
        category: data.category || "",
        minFollowers: data.minFollowers || "",
        age: data.age || "",
        gender: data.gender || "",
        location: data.location || "",
      },
      status: "active",
    };
    setActivePosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id, patch) => {
    setActivePosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, requirements: { ...p.requirements, ...(patch.requirements || {}) } } : p)));
  };

  const deletePost = (id) => {
    setActivePosts((prev) => prev.filter((p) => p.id !== id));
  };

  const isSaved = (id) => savedIds.includes(id);
  const toggleSave = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };
  const savedOpportunities = opportunities.filter((o) => savedIds.includes(o.id));

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Returns thread id for a given brand name; creates one if needed.
  const getOrCreateThread = (brandName) => {
    const existing = threads.find((t) => t.name === brandName);
    if (existing) return existing.id;
    const newThread = {
      id: `t-${Date.now()}`,
      name: brandName,
      avatar: brandName.slice(0, 4).toUpperCase(),
      online: false,
      lastMessage: "Conversation started",
      time: "now",
      unread: 0,
      messages: [
        { from: "brand", text: `Hi! Welcome — excited to collaborate with you. 🎉`, time: "now" },
      ],
    };
    setThreads((prev) => [newThread, ...prev]);
    return newThread.id;
  };

  return (
    <AppContext.Provider
      value={{
        accountType, setAccountType, switchMode,
        isAuthed, setIsAuthed, logout,
        user, setUser,
        workedWith, setWorkedWith,
        applications, addApplication, withdrawApplication,
        opportunities,
        threads,
        getOrCreateThread,
        notifications, markAllNotificationsRead,
        activePosts, publishOpportunity, updatePost, deletePost,
        savedIds, isSaved, toggleSave, savedOpportunities,
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
