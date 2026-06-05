import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_USER, MY_APPLICATIONS, OPPORTUNITIES, MESSAGES_THREADS, NOTIFICATIONS, ACTIVE_POSTS, BRANDS } from "@/data/mockData";
import { authApi, TOKEN_KEY, clearToken, setToken, getToken } from "@/lib/api";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [accountType, setAccountType] = useState("creator");
  const [isAuthed, setIsAuthed] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // true while restoring session
  const [currentUserId, setCurrentUserId] = useState(null);

  const [user, setUser] = useState(DEFAULT_USER);
  const [workedWith, setWorkedWith] = useState(BRANDS.slice(0, 6));
  const [applications, setApplications] = useState(MY_APPLICATIONS);
  const [opportunities, setOpportunities] = useState(OPPORTUNITIES);
  const [threads, setThreads] = useState(MESSAGES_THREADS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activePosts, setActivePosts] = useState(ACTIVE_POSTS);
  const [savedIds, setSavedIds] = useState([]);
  const [draftOpportunity, setDraftOpportunity] = useState({});

  // ── Session restoration ───────────────────────────────────────────────────
  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) { setAuthLoading(false); return; }
    try {
      const data = await authApi.me();
      setCurrentUserId(data.id);
      setAccountType(data.account_type);
      setOnboardingComplete(data.onboarding_complete);
      setIsAuthed(true);
      // Map API profile to user context shape
      if (data.account_type === "creator" && data.profile) {
        const p = data.profile;
        setUser((prev) => ({
          ...prev,
          creator: {
            ...prev.creator,
            name: p.full_name || prev.creator.name,
            handle: p.handle || prev.creator.handle,
            bio: p.bio || prev.creator.bio,
            location: p.location || prev.creator.location,
            category: p.categories?.length ? p.categories : prev.creator.category,
            language: p.languages?.length ? p.languages : prev.creator.language,
            instagramUrl: p.instagram_url || prev.creator.instagramUrl,
            followers: p.followers_count ? `${Number(p.followers_count).toLocaleString("en-IN")}` : prev.creator.followers,
            avatar: p.avatar_url || prev.creator.avatar,
          },
        }));
      } else if (data.account_type === "brand" && data.profile) {
        const p = data.profile;
        setUser((prev) => ({
          ...prev,
          brand: {
            ...prev.brand,
            name: p.brand_name || prev.brand.name,
            bio: p.bio || prev.brand.bio,
            category: p.category ? [p.category] : prev.brand.category,
            logo: p.logo_data || prev.brand.logo,
            gstNumber: p.gst_number || "",
          },
        }));
      }
    } catch (_) {
      clearToken();
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  // ── Profile refresh (called after login or save) ──────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.me();
      if (data.id) setCurrentUserId(data.id);
      if (data.account_type === "creator" && data.profile) {
        const p = data.profile;
        setUser((prev) => ({
          ...prev,
          creator: {
            ...prev.creator,
            name: p.full_name || prev.creator.name,
            handle: p.handle || prev.creator.handle,
            bio: p.bio || prev.creator.bio,
            location: p.location || prev.creator.location,
            category: p.categories?.length ? p.categories : prev.creator.category,
            language: p.languages?.length ? p.languages : prev.creator.language,
            instagramUrl: p.instagram_url || prev.creator.instagramUrl,
            followers: p.followers_count
              ? `${Number(p.followers_count).toLocaleString("en-IN")}`
              : prev.creator.followers,
            avatar: p.avatar_url || prev.creator.avatar,
          },
        }));
      } else if (data.account_type === "brand" && data.profile) {
        const p = data.profile;
        setUser((prev) => ({
          ...prev,
          brand: {
            ...prev.brand,
            name: p.brand_name || prev.brand.name,
            bio: p.bio || prev.brand.bio,
            category: p.category ? [p.category] : prev.brand.category,
            logo: p.logo_data || prev.brand.logo,
            gstNumber: p.gst_number || "",
          },
        }));
      }
    } catch (_) {}
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const loginWithToken = useCallback(async (token, acctType, onboarded) => {
    setToken(token);
    setAccountType(acctType);
    setOnboardingComplete(onboarded);
    setIsAuthed(true);
    // Immediately load the real profile so screens show correct data
    try {
      const data = await authApi.me();
      if (data.id) setCurrentUserId(data.id);
      if (data.account_type === "creator" && data.profile) {
        const p = data.profile;
        setUser((prev) => ({
          ...prev,
          creator: {
            ...prev.creator,
            name: p.full_name || prev.creator.name,
            handle: p.handle || prev.creator.handle,
            bio: p.bio || prev.creator.bio,
            location: p.location || prev.creator.location,
            category: p.categories?.length ? p.categories : prev.creator.category,
            language: p.languages?.length ? p.languages : prev.creator.language,
            instagramUrl: p.instagram_url || prev.creator.instagramUrl,
            followers: p.followers_count
              ? `${Number(p.followers_count).toLocaleString("en-IN")}`
              : prev.creator.followers,
            avatar: p.avatar_url || prev.creator.avatar,
          },
        }));
      } else if (data.account_type === "brand" && data.profile) {
        const p = data.profile;
        setUser((prev) => ({
          ...prev,
          brand: {
            ...prev.brand,
            name: p.brand_name || prev.brand.name,
            bio: p.bio || prev.brand.bio,
            category: p.category ? [p.category] : prev.brand.category,
            logo: p.logo_data || prev.brand.logo,
            gstNumber: p.gst_number || "",
          },
        }));
      }
    } catch (_) {}
  }, []);

  const logout = () => {
    clearToken();
    setIsAuthed(false);
    setOnboardingComplete(false);
    setCurrentUserId(null);
    setUser(DEFAULT_USER);
    setApplications(MY_APPLICATIONS);
    setOpportunities(OPPORTUNITIES);
    setActivePosts(ACTIVE_POSTS);
    setNotifications(NOTIFICATIONS);
    setThreads(MESSAGES_THREADS);
    setSavedIds([]);
  };

  const switchMode = (mode) => setAccountType(mode);

  // ── Onboarding ────────────────────────────────────────────────────────────
  const completeOnboarding = (data) => {
    if (accountType === "creator") {
      setUser((prev) => ({
        ...prev,
        creator: {
          ...prev.creator,
          name: data.fullName || prev.creator.name,
          location: data.location || prev.creator.location,
          category: data.categories?.length ? data.categories : prev.creator.category,
          instagramUrl: data.instagramUrl || prev.creator.instagramUrl,
          followers: data.followersCount
            ? `${Number(data.followersCount).toLocaleString("en-IN")}`
            : prev.creator.followers,
        },
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        brand: {
          ...prev.brand,
          name: data.brandName || prev.brand.name,
          bio: data.brandBio || prev.brand.bio,
          category: data.brandCategory ? [data.brandCategory] : prev.brand.category,
          logo: data.logoData || prev.brand.logo,
          gstNumber: data.gstNumber || "",
        },
      }));
    }
    setOnboardingComplete(true);
  };

  // ── Opportunities (local fallback + real data merged) ─────────────────────
  const mergeOpportunities = (realOpps) => {
    setOpportunities((prev) => {
      const realIds = new Set(realOpps.map((o) => o.id));
      const mocks = prev.filter((o) => !realIds.has(o.id) && o.id.startsWith("op-"));
      return [...realOpps, ...mocks];
    });
  };

  // ── Applications ──────────────────────────────────────────────────────────
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

  // ── Brand posts ───────────────────────────────────────────────────────────
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
        language: data.language || [],
      },
      status: "active",
    };
    setActivePosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id, patch) => {
    setActivePosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, ...patch, requirements: { ...p.requirements, ...(patch.requirements || {}) } } : p)
    );
  };

  const deletePost = (id) => setActivePosts((prev) => prev.filter((p) => p.id !== id));

  // ── Saved ─────────────────────────────────────────────────────────────────
  const isSaved = (id) => savedIds.includes(id);
  const toggleSave = (id) => setSavedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]);
  const savedOpportunities = opportunities.filter((o) => savedIds.includes(o.id));

  // ── Notifications ─────────────────────────────────────────────────────────
  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  // ── Threads ───────────────────────────────────────────────────────────────
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
      messages: [{ from: "brand", text: `Hi! Welcome — excited to collaborate with you. 🎉`, time: "now" }],
    };
    setThreads((prev) => [newThread, ...prev]);
    return newThread.id;
  };

  return (
    <AppContext.Provider value={{
      accountType, setAccountType, switchMode,
      isAuthed, setIsAuthed, logout,
      onboardingComplete, setOnboardingComplete, completeOnboarding,
      authLoading,
      currentUserId,
      loginWithToken, refreshProfile,
      user, setUser,
      workedWith, setWorkedWith,
      applications, setApplications, addApplication, withdrawApplication,
      opportunities, setOpportunities, mergeOpportunities,
      threads, setThreads,
      getOrCreateThread,
      notifications, setNotifications, markAllNotificationsRead,
      activePosts, setActivePosts, publishOpportunity, updatePost, deletePost,
      savedIds, isSaved, toggleSave, savedOpportunities,
      draftOpportunity, setDraftOpportunity,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
