// API service layer — connects React frontend to Django backend
// Base URL from .env, or proxied through Vite dev server to http://127.0.0.1:8000
let BASE = import.meta.env.VITE_API_BASE_URL || "";
if (BASE.endsWith("/")) BASE = BASE.slice(0, -1);

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}/api${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Clients ────────────────────────────────────────────────────────────────
export const api = {
  // Clients
  getClients: () => request("GET", "/clients/"),
  getClient: (id) => request("GET", `/clients/${id}/`),
  createClient: (data) => request("POST", "/clients/", data),
  updateClient: (id, data) => request("PUT", `/clients/${id}/`, data),
  deleteClient: (id) => request("DELETE", `/clients/${id}/`),

  // Reports
  getReports: (clientId) => request("GET", `/clients/${clientId}/reports/`),
  createReport: (clientId, data) => request("POST", `/clients/${clientId}/reports/`, data),
  getReport: (clientId, reportId) => request("GET", `/clients/${clientId}/reports/${reportId}/`),

  // Dashboard
  getDashboard: () => request("GET", "/dashboard/"),

  // Health check
  health: () => request("GET", "/health/"),
};

export default api;
