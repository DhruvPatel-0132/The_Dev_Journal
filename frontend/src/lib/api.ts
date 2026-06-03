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
};