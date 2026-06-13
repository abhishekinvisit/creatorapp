import { createContext, useContext, useState, useEffect } from "react";
import { adminApi, getAdminToken, setAdminToken, clearAdminToken } from "@/lib/adminApi";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) { setLoading(false); return; }
    adminApi.me()
      .then(setAdmin)
      .catch(() => clearAdminToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(creds) {
    const res = await adminApi.login(creds);
    setAdminToken(res.token);
    setAdmin(res.admin);
    return res.admin;
  }

  function logout() {
    clearAdminToken();
    setAdmin(null);
  }

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
