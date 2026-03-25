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

  getPulseTopics: (status?: string) => request(`/pulse-topics${status ? `?status=${status}` : ""}`),
  getPulseTopic: (id: number) => request(`/pulse-topics/${id}`),
  updatePulseTopic: (id: number, data: Record<string, unknown>) => request(`/pulse-topics/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePulseTopic: (id: number) => request(`/pulse-topics/${id}`, { method: "DELETE" }),
  createPulseTopic: (data: Record<string, unknown>) => request(`/pulse-topics`, { method: "POST", body: JSON.stringify(data) }),

  getDesignTokens: () => request("/design-tokens"),
  updateDesignToken: (id: number, data: Record<string, unknown>) => request(`/design-tokens/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createDesignToken: (data: Record<string, unknown>) => request(`/design-tokens`, { method: "POST", body: JSON.stringify(data) }),
  deleteDesignToken: (id: number) => request(`/design-tokens/${id}`, { method: "DELETE" }),

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

  getSubscribers: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    return request(`/subscribers?${q.toString()}`);
  },
  deleteSubscriber: (id: number) => request(`/subscribers/${id}`, { method: "DELETE" }),
  exportSubscribers: async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["x-cms-token"] = authToken;
    const res = await fetch(`${API_BASE}/subscribers/export`, { headers });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  },

  getApplications: (params?: { status?: string; search?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    return request(`/applications?${q.toString()}`);
  },
  getApplication: (id: number) => request(`/applications/${id}`),
  updateApplication: (id: number, data: Record<string, unknown>) =>
    request(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getAnalytics: () => request("/analytics"),

  getPage: (page: string) => request(`/pages/${page}`),
  updatePage: (page: string, data: Record<string, unknown>) =>
    request(`/pages/${page}`, { method: "PUT", body: JSON.stringify(data) }),

  getHomepage: () => request("/homepage"),
  updateHomepage: (data: Record<string, unknown>) =>
    request("/homepage", { method: "PUT", body: JSON.stringify(data) }),
  addBanner: (data: Record<string, unknown>) =>
    request("/homepage/banners", { method: "POST", body: JSON.stringify(data) }),
  deleteBanner: (id: string) =>
    request(`/homepage/banners/${id}`, { method: "DELETE" }),

  generateIdeas: async (data: { contentType: string; prompt: string; count: number; guardrails: string[]; categories: string[] }, onChunk: (text: string) => void): Promise<Record<string, unknown>[]> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["x-cms-token"] = authToken;
    const res = await fetch(`${API_BASE}/ideation/generate`, { method: "POST", headers, body: JSON.stringify(data) });
    if (res.status === 401) { setToken(null); window.location.href = import.meta.env.BASE_URL; throw new Error("Unauthorized"); }
    if (!res.ok) throw new Error("Generation failed");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No stream");
    const decoder = new TextDecoder();
    let ideas: Record<string, unknown>[] = [];
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.content) onChunk(parsed.content);
          if (parsed.done && parsed.ideas) ideas = parsed.ideas;
        } catch {}
      }
    }
    return ideas;
  },

  refineIdea: async (data: { item: Record<string, unknown>; contentType: string; instruction: string }, onChunk: (text: string) => void): Promise<Record<string, unknown> | null> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["x-cms-token"] = authToken;
    const res = await fetch(`${API_BASE}/ideation/refine`, { method: "POST", headers, body: JSON.stringify(data) });
    if (res.status === 401) { setToken(null); window.location.href = import.meta.env.BASE_URL; throw new Error("Unauthorized"); }
    if (!res.ok) throw new Error("Refinement failed");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No stream");
    const decoder = new TextDecoder();
    let refined: Record<string, unknown> | null = null;
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.content) onChunk(parsed.content);
          if (parsed.done && parsed.refined) refined = parsed.refined;
        } catch {}
      }
    }
    return refined;
  },
};
