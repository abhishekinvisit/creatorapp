const BASE = "/api";

export const TOKEN_KEY = "ollcollab_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

async function request(method, path, body) {
  const opts = { method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || "Request failed");
  return data;
}

export const api = {
  get:    (path)        => request("GET",    path),
  post:   (path, body)  => request("POST",   path, body),
  put:    (path, body)  => request("PUT",    path, body),
  patch:  (path, body)  => request("PATCH",  path, body),
  delete: (path)        => request("DELETE", path),
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  checkEmail:  (email)            => api.post("/auth/check-email", { email }),
  register:    (email, password, accountType) =>
                 api.post("/auth/register", { email, password, account_type: accountType }),
  login:       (email, password)  => api.post("/auth/login", { email, password }),
  me:          ()                 => api.get("/auth/me"),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  getCreator:    ()      => api.get("/profile/creator"),
  updateCreator: (data)  => api.put("/profile/creator", data),
  getBrand:      ()      => api.get("/profile/brand"),
  updateBrand:   (data)  => api.put("/profile/brand", data),
};

// ── Onboarding ────────────────────────────────────────────────────────────────
export const onboardingApi = {
  completeCreator: (data) => api.post("/onboarding/creator", data),
  completeBrand:   (data) => api.post("/onboarding/brand", data),
};

// ── Opportunities ─────────────────────────────────────────────────────────────
export const opportunitiesApi = {
  list:        (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/opportunities${qs ? `?${qs}` : ""}`);
  },
  get:         (id)          => api.get(`/opportunities/${id}`),
  create:      (data)        => api.post("/opportunities", data),
  update:      (id, data)    => api.put(`/opportunities/${id}`, data),
  delete:      (id)          => api.delete(`/opportunities/${id}`),
  myPosts:     ()            => api.get("/opportunities/my-posts"),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationsApi = {
  apply:          (opportunityId, note = "") =>
                    api.post("/applications", { opportunity_id: opportunityId, note }),
  myApplications: ()              => api.get("/applications/mine"),
  forOpportunity: (opportunityId) => api.get(`/applications/opportunity/${opportunityId}`),
  updateStatus:   (id, status)    => api.patch(`/applications/${id}`, { status }),
  withdraw:       (id)            => api.delete(`/applications/${id}`),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  threads:       ()              => api.get("/threads"),
  getThread:     (id)            => api.get(`/threads/${id}`),
  openWith:      (otherUserId)   => api.post("/threads/open", { other_user_id: otherUserId }),
  sendMessage:   (threadId, text) => api.post(`/threads/${threadId}/messages`, { text }),
  messages:      (threadId)      => api.get(`/threads/${threadId}/messages`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:      ()    => api.get("/notifications"),
  markRead:  (id)  => api.patch(`/notifications/${id}/read`),
  markAll:   ()    => api.patch("/notifications/read-all"),
};
