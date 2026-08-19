"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topbar } from "@/components/layout/topbar";
import { Github, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API to create project
    router.push("/projects");
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tạo dự án mới" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách dự án
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Github className="h-6 w-6 text-gray-700" />
                <CardTitle>Kết nối GitHub Repository</CardTitle>
              </div>
              <p className="text-sm text-gray-500">
                Nhập URL repository GitHub để AI IT Team có thể phân tích và quản lý dự án của bạn.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Tên dự án</Label>
                  <Input
                    id="projectName"
                    placeholder="Ví dụ: My Awesome App"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repoUrl">URL GitHub Repository</Label>
                  <Input
                    id="repoUrl"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Đảm bảo bạn đã cấp quyền truy cập GitHub trong phần Cài đặt.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit">Tạo dự án</Button>
                  <Link href="/projects">
                    <Button type="button" variant="outline">Hủy</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
