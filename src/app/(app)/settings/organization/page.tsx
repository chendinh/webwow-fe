"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SettingsTabs } from "@/components/layout/settings-tabs";
import { Building, Users, Plus, Loader, CheckCircle } from "lucide-react";
import { organizationsApi, Organization } from "@/lib/api/organizations.api";
import { useOrgStore } from "@/stores/org.store";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Chủ sở hữu",
  ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
  VIEWER: "Người xem",
};

export default function OrganizationSettingsPage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const setActiveOrg = useOrgStore((s) => s.setActiveOrg);

  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [orgName, setOrgName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.allSettled([
      organizationsApi.getById(activeOrgId),
      organizationsApi.getMembers(activeOrgId),
    ])
      .then(([orgRes, membersRes]) => {
        if (orgRes.status === "fulfilled") {
          const data = orgRes.value.data as Organization;
          setOrg(data);
          setOrgName(data.name);
        }
        if (membersRes.status === "fulfilled") {
          setMembers((membersRes.value.data as Member[]) ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, [activeOrgId]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !orgName.trim()) return;
    setSavingName(true);
    setNameError(null);
    setNameSaved(false);
    try {
      const res = await organizationsApi.update(activeOrgId, { name: orgName.trim() });
      const updated = res.data as Organization;
      setOrg(updated);
      setActiveOrg(updated.id, updated.slug);
      setNameSaved(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Cập nhật thất bại.";
      setNameError(Array.isArray(msg) ? (msg as string[]).join(", ") : (msg as string));
    } finally {
      setSavingName(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);
    try {
      await organizationsApi.inviteMember(activeOrgId, inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      setInviteSuccess(true);
      // Refresh members
      const res = await organizationsApi.getMembers(activeOrgId);
      setMembers((res.data as Member[]) ?? []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Mời thành viên thất bại.";
      setInviteError(Array.isArray(msg) ? (msg as string[]).join(", ") : (msg as string));
    } finally {
      setInviting(false);
    }
  };

  if (!activeOrgId) {
    return (
      <>
        <SettingsTabs activeTab="organization" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">
            Chưa có tổ chức. Vui lòng tạo tổ chức trước.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SettingsTabs activeTab="organization" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-600" />
                <CardTitle>Thông tin tổ chức</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSaveName}>
                  {nameError && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {nameError}
                    </div>
                  )}
                  {nameSaved && (
                    <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Đã lưu thành công.
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Tên tổ chức</Label>
                    <Input
                      id="orgName"
                      placeholder="Công ty của bạn"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                    />
                  </div>
                  {org && (
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input value={org.slug} disabled className="bg-gray-50 text-gray-500" />
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={savingName}>
                      {savingName && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <CardTitle>Thành viên</CardTitle>
                </div>
                {!loading && (
                  <Badge variant="secondary">{members.length} thành viên</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
                          {(m.user.name ?? m.user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {m.user.name ?? m.user.email}
                          </p>
                          <p className="text-xs text-gray-500">{m.user.email}</p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {ROLE_LABELS[m.role] ?? m.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Mời thành viên</p>
                {inviteError && (
                  <p className="text-xs text-red-600 mb-2">{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p className="text-xs text-green-600 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Đã gửi lời mời thành công.
                  </p>
                )}
                <form onSubmit={handleInvite} className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "ADMIN" | "MEMBER" | "VIEWER")
                    }
                    className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MEMBER">Thành viên</option>
                    <option value="ADMIN">Quản trị viên</option>
                    <option value="VIEWER">Người xem</option>
                  </select>
                  <Button size="sm" type="submit" disabled={inviting}>
                    {inviting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Mời
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
