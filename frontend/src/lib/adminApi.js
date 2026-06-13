const BASE = "/api/admin";
const TOKEN_KEY = "rytspot_admin_token";

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);
export const setAdminToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearAdminToken = () => localStorage.removeItem(TOKEN_KEY);

const adminHeaders = () => ({
  "Content-Type": "application/json",
  ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
});

async function req(method, path, body) {
  const opts = { method, headers: adminHeaders() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || "Request failed");
  return data;
}

export const adminApi = {
  // Auth
  login:        (creds)            => req("POST", "/auth/login", creds),
  me:           ()                 => req("GET",  "/auth/me"),
  createAdmin:  (data)             => req("POST", "/auth/create-admin", data),

  // Dashboard
  stats:        ()                 => req("GET",  "/dashboard/stats"),

  // Users
  users:        (params = {})      => req("GET",  "/users?" + new URLSearchParams(params).toString()),
  getUser:      (id)               => req("GET",  `/users/${id}`),
  suspendUser:  (id, data)         => req("PATCH", `/users/${id}/suspend`, data),
  deleteUser:   (id)               => req("DELETE", `/users/${id}`),

  // Verification
  verifyUser:   (id, data = {})    => req("POST", `/users/${id}/verify`, data),
  unverifyUser: (id)               => req("DELETE", `/users/${id}/verify`),
  verifications: ()                => req("GET", "/verification"),

  // Blogs
  blogs:        (params = {})      => req("GET",  "/blogs?" + new URLSearchParams(params).toString()),
  getBlog:      (id)               => req("GET",  `/blogs/${id}`),
  createBlog:   (data)             => req("POST", "/blogs", data),
  updateBlog:   (id, data)         => req("PUT",  `/blogs/${id}`, data),
  deleteBlog:   (id)               => req("DELETE", `/blogs/${id}`),

  // Analytics
  analytics:    ()                 => req("GET",  "/analytics"),

  // Logs
  logs:         (params = {})      => req("GET",  "/logs?" + new URLSearchParams(params).toString()),

  // Admins
  admins:       ()                 => req("GET",  "/admins"),
};
