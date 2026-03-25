const API_BASE = "/api/cms";

let authToken: string | null = localStorage.getItem("cms_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("cms_token", token);
  else localStorage.removeItem("cms_token");
}

export function getToken() {
  return authToken;
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) headers["x-cms-token"] = authToken;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.location.href = import.meta.env.BASE_URL;
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

export const api = {
  login: (username: string, pin: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, pin }) }),

  verify: () => request("/auth/verify", { method: "POST" }),

  getStats: () => request("/stats"),
  getTaxonomy: () => request("/taxonomy"),

  getDebates: (status?: string) => request(`/debates${status ? `?status=${status}` : ""}`),
  getDebate: (id: number) => request(`/debates/${id}`),
  updateDebate: (id: number, data: Record<string, unknown>) => request(`/debates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDebate: (id: number) => request(`/debates/${id}`, { method: "DELETE" }),

  getPredictions: (status?: string) => request(`/predictions${status ? `?status=${status}` : ""}`),
  getPrediction: (id: number) => request(`/predictions/${id}`),
  updatePrediction: (id: number, data: Record<string, unknown>) => request(`/predictions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePrediction: (id: number) => request(`/predictions/${id}`, { method: "DELETE" }),

  getVoices: (status?: string) => request(`/voices${status ? `?status=${status}` : ""}`),
  getVoice: (id: number) => request(`/voices/${id}`),
  updateVoice: (id: number, data: Record<string, unknown>) => request(`/voices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVoice: (id: number) => request(`/voices/${id}`, { method: "DELETE" }),

  changeStatus: (type: string, id: number, action: string) =>
    request(`/${type}/${id}/status`, { method: "POST", body: JSON.stringify({ action }) }),

  bulkAction: (type: string, ids: number[], action: string) =>
    request(`/${type}/bulk-action`, { method: "POST", body: JSON.stringify({ ids, action }) }),

  bulkUpload: (type: string, items: Record<string, unknown>[]) =>
    request(`/upload/${type}`, { method: "POST", body: JSON.stringify({ items }) }),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return request("/upload-image", { method: "POST", body: formData });
  },

  getHomepage: () => request("/homepage"),
  updateHomepage: (data: Record<string, unknown>) =>
    request("/homepage", { method: "PUT", body: JSON.stringify(data) }),
  addBanner: (data: Record<string, unknown>) =>
    request("/homepage/banners", { method: "POST", body: JSON.stringify(data) }),
  deleteBanner: (id: string) =>
    request(`/homepage/banners/${id}`, { method: "DELETE" }),
};
