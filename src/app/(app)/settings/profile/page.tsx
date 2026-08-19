"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topbar } from "@/components/layout/topbar";
import { SettingsTabs } from "@/components/layout/settings-tabs";
import { User } from "lucide-react";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Cài đặt" />
      <SettingsTabs activeTab="profile" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  U
                </div>
                <div>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <p className="text-sm text-gray-500">Cập nhật thông tin hồ sơ của bạn</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit">Lưu thay đổi</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600">Khu vực nguy hiểm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Xóa tài khoản</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
                  </p>
                </div>
                <Button variant="destructive" size="sm">Xóa tài khoản</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
