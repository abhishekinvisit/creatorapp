import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_USER } from "@/data/mockData";
import { authApi, TOKEN_KEY, clearToken, setToken, getToken, savedCreatorsApi, applicationsApi, unreadCountsApi } from "@/lib/api";

const AppContext = createContext(null);

function savedKey(userId) {
  return userId ? `ollcollab_saved_${userId}` : null;
}

function formatFollowers(n) {
  if (!n) return "0";
  return Number(n).toLocaleString("en-IN");
}

function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    return new Date(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch (_) {
    return isoStr;
  }
}

function mapApiApplications(data) {
  return data.map((a) => ({
    id: a.id,
    opportunityId: a.opportunity_id,
    brandName: a.brand_name || "Brand",
    brandId: a.brand_id,
    opportunityTitle: a.opportunity_title,
    appliedOn: formatDate(a.applied_at),
    status: a.status || "applied",
    note: a.note || "",
  }));
}

function mapCreatorProfile(prev, p) {
  let workedWith = [];
  if (Array.isArray(p.worked_with)) workedWith = p.worked_with;
  else if (typeof p.worked_with === "string") {
    try { workedWith = JSON.parse(p.worked_with); } catch (_) {}
  }
  return {
    ...prev,
    creator: {
      ...prev.creator,
      name:             p.full_name    || prev.creator.name,
      handle:           p.handle       || prev.creator.handle,
      bio:              p.bio          || prev.creator.bio,
      location:         p.location     || prev.creator.location,
      gender:           p.gender       || prev.creator.gender,
      age:              p.age          || prev.creator.age,
      category:         p.categories?.length ? p.categories : prev.creator.category,
      language:         p.languages?.length  ? p.languages  : prev.creator.language,
      instagramUrl:     p.instagram_url || prev.creator.instagramUrl,
      youtubeUrl:       p.youtube_url   || prev.creator.youtubeUrl  || "",
      linkedinUrl:      p.linkedin_url  || prev.creator.linkedinUrl || "",
      tiktokUrl:        p.tiktok_url    || prev.creator.tiktokUrl   || "",
      websiteUrl:       p.website_url   || prev.creator.websiteUrl  || "",
      followers:        formatFollowers(p.followers_count) || prev.creator.followers,
      followersCount:   p.followers_count || prev.creator.followersCount || 0,
      collaborations:   p.collaborations_count != null ? p.collaborations_count : (prev.creator.collaborations || 0),
      avatar:           p.avatar_url    || prev.creator.avatar,
    },
    workedWith: workedWith.length ? workedWith : prev.workedWith,
  };
}

function mapBrandProfile(prev, p) {
  return {
    ...prev,
    brand: {
      ...prev.brand,
      name:           p.brand_name    || prev.brand.name,
      handle:         p.handle        || "",
      bio:            p.bio           || prev.brand.bio,
      category:       p.category ? [p.category] : prev.brand.category,
      customCategory: p.custom_category || prev.brand.customCategory || "",
      instagramUrl:   p.instagram_url || prev.brand.instagramUrl || "",
      websiteUrl:     p.website_url   || prev.brand.websiteUrl   || "",
      logo:           (p.logo_data && (p.logo_data.startsWith("data:") || p.logo_data.startsWith("http"))) ? p.logo_data : ((prev.brand.logo && (prev.brand.logo.startsWith("data:") || prev.brand.logo.startsWith("http"))) ? prev.brand.logo : ""),
      gstNumber:      p.gst_number    || "",
    },
  };
}

export const AppProvider = ({ children }) => {
  const [accountType, setAccountType] = useState("creator");
  const [isAuthed, setIsAuthed] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [user, setUser] = useState({ ...DEFAULT_USER, workedWith: [] });
  const [workedWith, setWorkedWith] = useState([]);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [threads, setThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activePosts, setActivePosts] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [savedCreatorIds, setSavedCreatorIds] = useState(new Set());
  const [draftOpportunity, setDraftOpportunity] = useState({});

  const loadSavedCreators = useCallback(async () => {
    try {
      const list = await savedCreatorsApi.list();
      setSavedCreatorIds(new Set(list.map((c) => c.creator_id)));
    } catch (_) {}
  }, []);

  // Load applications from API and populate state (creator only)
  const loadMyApplications = useCallback(async () => {
    try {
      const data = await applicationsApi.myApplications();
      setApplications(mapApiApplications(data));
    } catch (_) {}
  }, []);

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
      if (data.account_type === "creator" && data.profile) {
        setUser((prev) => {
          const mapped = mapCreatorProfile(prev, data.profile);
          setWorkedWith(mapped.workedWith || []);
          return mapped;
        });
        const key = savedKey(data.id);
        if (key) {
          try { setSavedIds(JSON.parse(localStorage.getItem(key) || "[]")); } catch (_) {}
        }
        loadMyApplications();
      } else if (data.account_type === "brand" && data.profile) {
        setUser((prev) => mapBrandProfile(prev, data.profile));
        loadSavedCreators();
      }
    } catch (_) {
      clearToken();
    } finally {
      setAuthLoading(false);
    }
  }, [loadSavedCreators, loadMyApplications]);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  // ── Unread counts polling (every 30s when authed) ─────────────────────────
  useEffect(() => {
    if (!isAuthed) return;
    const fetchCounts = async () => {
      try {
        const data = await unreadCountsApi.get();
        setUnreadMessages(data.messages || 0);
        setUnreadNotifications(data.notifications || 0);
      } catch (_) {}
    };
    fetchCounts();
    const timer = setInterval(fetchCounts, 30000);
    return () => clearInterval(timer);
  }, [isAuthed]);

  // ── Profile refresh (called after login or save) ──────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.me();
      if (data.id) setCurrentUserId(data.id);
      if (data.account_type === "creator" && data.profile) {
        setUser((prev) => {
          const mapped = mapCreatorProfile(prev, data.profile);
          setWorkedWith(mapped.workedWith || []);
          return mapped;
        });
      } else if (data.account_type === "brand" && data.profile) {
        setUser((prev) => mapBrandProfile(prev, data.profile));
      }
    } catch (_) {}
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const loginWithToken = useCallback(async (token, acctType, onboarded) => {
    setToken(token);
    setAccountType(acctType);
    setOnboardingComplete(onboarded);
    setIsAuthed(true);
    try {
      const data = await authApi.me();
      if (data.id) setCurrentUserId(data.id);
      if (data.account_type === "creator" && data.profile) {
        setUser((prev) => {
          const mapped = mapCreatorProfile(prev, data.profile);
          if (mapped.workedWith?.length) setWorkedWith(mapped.workedWith);
          return mapped;
        });
        const key = savedKey(data.id);
        if (key) {
          try { setSavedIds(JSON.parse(localStorage.getItem(key) || "[]")); } catch (_) {}
        }
        loadMyApplications();
      } else if (data.account_type === "brand" && data.profile) {
        setUser((prev) => mapBrandProfile(prev, data.profile));
        loadSavedCreators();
      }
    } catch (_) {}
  }, [loadSavedCreators, loadMyApplications]);

  const logout = () => {
    clearToken();
    setIsAuthed(false);
    setOnboardingComplete(false);
    setCurrentUserId(null);
    setUser({
      ...DEFAULT_USER,
      creator: { ...DEFAULT_USER.creator, avatar: "" },
      brand: { ...DEFAULT_USER.brand, logo: "" },
    });
    setWorkedWith([]);
    setApplications([]);
    setOpportunities([]);
    setActivePosts([]);
    setNotifications([]);
    setThreads([]);
    setSavedCreatorIds(new Set());
    setSavedIds([]);
  };

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
            ? formatFollowers(data.followersCount)
            : prev.creator.followers,
          followersCount: data.followersCount || 0,
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

  // ── Opportunities — always replace with real data ─────────────────────────
  const mergeOpportunities = (realOpps) => {
    setOpportunities(realOpps);
  };

  // ── Applications ──────────────────────────────────────────────────────────
  const addApplication = (appData) => {
    setApplications((prev) => {
      if (prev.find((a) => a.opportunityId === appData.opportunityId)) return prev;
      return [appData, ...prev];
    });
  };

  const withdrawApplication = (appId) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  // Expose a way for screens to check if a specific opp is already applied
  const hasApplied = (opportunityId) =>
    applications.some((a) => a.opportunityId === opportunityId);

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
      status: "active",
    };
    setActivePosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id, patch) => {
    setActivePosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, ...patch } : p)
    );
  };

  const deletePost = (id) => setActivePosts((prev) => prev.filter((p) => p.id !== id));

  // ── Saved opportunities — persisted to localStorage ───────────────────────
  const isSaved = (id) => savedIds.includes(id);
  const toggleSave = (id) => setSavedIds((prev) => {
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
    const key = savedKey(currentUserId);
    if (key) try { localStorage.setItem(key, JSON.stringify(next)); } catch (_) {}
    return next;
  });
  const savedOpportunities = opportunities.filter((o) => savedIds.includes(o.id));

  // ── Saved creators (brand feature) ────────────────────────────────────────
  const isCreatorSaved = (creatorId) => savedCreatorIds.has(creatorId);
  const savedCreatorsCount = savedCreatorIds.size;

  const saveCreator = async (creatorId) => {
    setSavedCreatorIds((prev) => new Set([...prev, creatorId]));
    try { await savedCreatorsApi.save(creatorId); } catch (_) {}
  };

  const unsaveCreator = async (creatorId) => {
    setSavedCreatorIds((prev) => {
      const next = new Set(prev);
      next.delete(creatorId);
      return next;
    });
    try { await savedCreatorsApi.unsave(creatorId); } catch (_) {}
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadNotifications(0);
  };

  // ── Threads ───────────────────────────────────────────────────────────────
  const getOrCreateThread = (brandName) => {
    const existing = threads.find((t) => t.name === brandName);
    if (existing) return existing.id;
    const newThread = {
      id: `t-${Date.now()}`,
      name: brandName,
      online: false,
      lastMessage: "Conversation started",
      time: "now",
      unread: 0,
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    return newThread.id;
  };

  return (
    <AppContext.Provider value={{
      accountType, setAccountType,
      isAuthed, setIsAuthed, logout,
      onboardingComplete, setOnboardingComplete, completeOnboarding,
      authLoading,
      currentUserId,
      loginWithToken, refreshProfile,
      user, setUser,
      workedWith, setWorkedWith,
      applications, setApplications, addApplication, withdrawApplication,
      hasApplied, loadMyApplications,
      opportunities, setOpportunities, mergeOpportunities,
      threads, setThreads,
      getOrCreateThread,
      notifications, setNotifications, markAllNotificationsRead,
      unreadMessages, unreadNotifications,
      activePosts, setActivePosts, publishOpportunity, updatePost, deletePost,
      savedIds, isSaved, toggleSave, savedOpportunities,
      savedCreatorIds, isCreatorSaved, savedCreatorsCount, saveCreator, unsaveCreator,
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
