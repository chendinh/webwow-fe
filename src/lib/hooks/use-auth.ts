"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useOrgStore } from "@/stores/org.store";
import { authApi } from "@/lib/api/auth.api";
import { organizationsApi } from "@/lib/api/organizations.api";

async function fetchAndSetFirstOrg() {
  try {
    const res = await organizationsApi.list();
    const orgs = res.data;
    if (orgs && orgs.length > 0) {
      const first = orgs[0];
      useOrgStore.getState().setActiveOrg(first.id, first.slug);
    }
  } catch {
    // ignore — org can be set later
  }
}

export function useAuth() {
  const router = useRouter();
  const { setTokens, setUser, logout: storeLogout, user, accessToken } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login(email, password);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await fetchAndSetFirstOrg();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Đăng nhập thất bại");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await authApi.register(email, password, name);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await fetchAndSetFirstOrg();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Đăng ký thất bại");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignore errors on logout — clear local state regardless
      }
    }
    storeLogout();
    router.push("/login");
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Gửi email thất bại");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Đặt lại mật khẩu thất bại");
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    user,
    isAuthenticated: !!accessToken,
    isLoading,
    error,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "message" in err.response.data
  ) {
    return String((err.response.data as { message: unknown }).message);
  }
  return fallback;
}
