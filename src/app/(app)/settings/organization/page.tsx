"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { SettingsTabs } from "@/components/layout/settings-tabs";
import { Building, Users, Plus } from "lucide-react";

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Cài đặt" />
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
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Tên tổ chức</Label>
                  <Input
                    id="orgName"
                    placeholder="Công ty của bạn"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <CardTitle>Thành viên</CardTitle>
                </div>
                <Badge variant="secondary">1 thành viên</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bạn</p>
                    <p className="text-xs text-gray-500">user@example.com</p>
                  </div>
                </div>
                <Badge variant="default">Quản trị viên</Badge>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Mời thành viên</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Mời
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
