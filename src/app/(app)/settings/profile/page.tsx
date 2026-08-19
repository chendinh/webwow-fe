"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsTabs } from "@/components/layout/settings-tabs";
import { Loader, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/lib/api/client";

export default function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiClient.patch<{ id: string; email: string; name: string | null }>(
        "/api/api/users/me",
        { name: name.trim() || null }
      );
      setUser({ id: res.data.id, email: res.data.email, name: res.data.name });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Cập nhật thất bại. Vui lòng thử lại.";
      setError(Array.isArray(msg) ? (msg as string[]).join(", ") : (msg as string));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SettingsTabs activeTab="profile" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-sky-500/20 ring-1 ring-sky-500/30 flex items-center justify-center text-sky-300 text-lg font-bold select-none">
                  {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
                </div>
                <div>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <p className="text-sm text-gray-400">Cập nhật thông tin hồ sơ của bạn</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Đã lưu thay đổi thành công.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                  />
                  <p className="text-xs text-gray-500">Email không thể thay đổi.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-base text-red-400">Khu vực nguy hiểm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-100">Xóa tài khoản</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
                  </p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
