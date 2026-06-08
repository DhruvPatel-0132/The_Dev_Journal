const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const res = await fetch(
      `${API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message);
    }

    return result;
  },

  login: async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    const res = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message);
    }

    return result;
  },

  googleAuth: async (credential: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  completeGoogleAuth: async (credential: string, role: string) => {
    const res = await fetch(`${API_URL}/auth/google/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential, role }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  resetPassword: async (token: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  logout: async () => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Required to send cookies
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  verifyOTP: async (email: string, otp: string) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  resendOTP: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  loginRaw: async (data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json();
    // Return result regardless so caller can read unverified flag
    return { ...result, ok: res.ok, status: res.status };
  },

  refresh: async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },
};

export const articleApi = {
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      // Surface the first Zod issue detail if present
      const msg =
        result.issues?.[0]?.message ||
        result.message ||
        "Failed to save article";
      throw new Error(msg);
    }
    return result;
  },

  update: async (slug: string, data: any) => {
    const res = await fetch(`${API_URL}/articles/slug/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/articles/dashboard-stats`, {
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getMyArticles: async (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);

    const res = await fetch(`${API_URL}/articles/my-articles?${query.toString()}`, {
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getAllArticles: async (params?: { page?: number; limit?: number; search?: string; category?: string; tag?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.tag) query.set("tag", params.tag);

    const res = await fetch(`${API_URL}/articles?${query.toString()}`, {
      // no credentials needed since feed can be public
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getCategories: async () => {
    const res = await fetch(`${API_URL}/articles/categories`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getTags: async () => {
    const res = await fetch(`${API_URL}/articles/tags`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getArticleBySlug: async (slug: string) => {
    const res = await fetch(`${API_URL}/articles/slug/${slug}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  getArticleForEdit: async (slug: string) => {
    const res = await fetch(`${API_URL}/articles/edit/${slug}`, {
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  toggleLike: async (slug: string) => {
    const res = await fetch(`${API_URL}/articles/slug/${slug}/like`, { method: "POST" });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  toggleDislike: async (slug: string) => {
    const res = await fetch(`${API_URL}/articles/slug/${slug}/dislike`, { method: "POST" });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  deleteArticle: async (slug: string) => {
    const res = await fetch(`${API_URL}/articles/slug/${slug}`, {
      method: "DELETE",
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  archiveArticle: async (slug: string) => {
    const res = await fetch(`${API_URL}/articles/slug/${slug}/archive`, {
      method: "PATCH",
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },
};

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },

  uploadInlineImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/upload/inline-image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    return result;
  },
};

export const verifyAndRefreshToken = async () => {
  let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token || token === "undefined" || token === "null") return null;

  token = token.replace(/^"|"$/g, '');

  try {
    const { jwtDecode } = await import("jwt-decode");
    const decoded: any = jwtDecode(token);

    // Check if token is expired or about to expire in the next 10 seconds
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime + 10) {
      // Token expired, refresh it
      const data = await authApi.refresh();
      if (data.token) {
        localStorage.setItem("token", data.token);
        return data.token;
      }
      return null;
    }

    return token;
  } catch (error) {
    console.error("Token verification failed", error);
    return null;
  }
};