import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await axios.post(`${API}/auth/login`, data);
    return res.data;
  },

  googleLogin: async (tokenId: string) => {
    const res = await axios.post(`${API}/auth/google`, { tokenId });
    return res.data;
  },
};