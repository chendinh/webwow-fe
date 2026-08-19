"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { SettingsTabs } from "@/components/layout/settings-tabs";
import { Github, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

// Mock connection state — in real app this comes from API/session
const isConnected = false;

export default function GitHubSettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Cài đặt" />
      <SettingsTabs activeTab="github" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-gray-700" />
                <CardTitle>Kết nối GitHub</CardTitle>
              </div>
              <p className="text-sm text-gray-500">
                Kết nối tài khoản GitHub để AI có thể đọc và ghi code vào repository của bạn.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">GitHub đã kết nối</p>
                      <p className="text-xs text-gray-500">@username · Đã xác thực</p>
                    </div>
                  </div>
                  <Badge variant="success">Đang kết nối</Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Chưa kết nối GitHub</p>
                      <p className="text-xs text-gray-500">
                        Bạn cần kết nối GitHub để tạo và quản lý dự án.
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Chưa kết nối</Badge>
                </div>
              )}

              {isConnected ? (
                <Button variant="outline" className="w-full">
                  Ngắt kết nối GitHub
                </Button>
              ) : (
                <Button className="w-full">
                  <Github className="h-4 w-4 mr-2" />
                  Kết nối với GitHub
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { perm: "Đọc danh sách repository", status: true },
                { perm: "Tạo và đẩy code lên branch", status: true },
                { perm: "Tạo Pull Request", status: true },
                { perm: "Đọc Issues", status: true },
                { perm: "Quản lý Webhooks", status: false },
              ].map(({ perm, status }) => (
                <div key={perm} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{perm}</span>
                  {status ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
