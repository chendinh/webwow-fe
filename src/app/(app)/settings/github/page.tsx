"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsTabs } from "@/components/layout/settings-tabs";
import {
  Github,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader,
} from "lucide-react";
import { organizationsApi, Organization } from "@/lib/api/organizations.api";
import { useOrgStore } from "@/stores/org.store";
import { apiClient } from "@/lib/api/client";

export default function GitHubSettingsPage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    organizationsApi
      .getById(activeOrgId)
      .then((res) => setOrg(res.data as Organization))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeOrgId]);

  // GitHub is considered connected if the org has a githubInstallationId
  const isConnected = Boolean(
    (org as unknown as { githubInstallationId?: string | null })?.githubInstallationId
  );

  const handleConnect = async () => {
    try {
      const res = await apiClient.get<{ installUrl: string }>("/api/github/install-url");
      window.open(res.data.installUrl, "_blank");
    } catch {
      // fallback: open GitHub Apps page without a specific app name
      window.open("https://github.com/apps", "_blank");
    }
  };

  return (
    <>
      <SettingsTabs activeTab="github" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-gray-400" />
                <CardTitle>Kết nối GitHub</CardTitle>
              </div>
              <p className="text-sm text-gray-400">
                Kết nối tài khoản GitHub để AI có thể đọc và ghi code vào repository của bạn.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : !activeOrgId ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-gray-400">
                    Chưa có tổ chức. Vui lòng tạo tổ chức trước.
                  </p>
                </div>
              ) : isConnected ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-100">GitHub đã kết nối</p>
                      <p className="text-xs text-gray-400">Tổ chức: {org?.name}</p>
                    </div>
                  </div>
                  <Badge variant="success">Đang kết nối</Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-100">Chưa kết nối GitHub</p>
                      <p className="text-xs text-gray-400">
                        Bạn cần kết nối GitHub để tạo và quản lý dự án.
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Chưa kết nối</Badge>
                </div>
              )}

              {!loading && activeOrgId && (
                isConnected ? (
                  <Button variant="outline" className="w-full" disabled>
                    Ngắt kết nối GitHub
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleConnect}>
                    <Github className="h-4 w-4 mr-2" />
                    Kết nối với GitHub
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                )
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
                  <span className="text-gray-400">{perm}</span>
                  {status ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
