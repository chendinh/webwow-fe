"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topbar } from "@/components/layout/topbar";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: { projectId: string };
}

const issueTypes = [
  { value: "FEATURE", label: "Tính năng mới" },
  { value: "BUG", label: "Báo lỗi" },
  { value: "IMPROVEMENT", label: "Cải tiến" },
  { value: "TASK", label: "Nhiệm vụ" },
];

const priorities = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Khẩn cấp" },
];

export default function NewIssuePage({ params }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("FEATURE");
  const [priority, setPriority] = useState("MEDIUM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API to create issue
    router.push(`/projects/${params.projectId}/issues`);
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tạo issue mới" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/projects/${params.projectId}/issues`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách issues
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin issue</CardTitle>
              <p className="text-sm text-gray-500">
                Mô tả chi tiết để AI có thể phân tích và thực hiện.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    placeholder="Ví dụ: Thêm tính năng đăng nhập bằng Google"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả chi tiết</Label>
                  <textarea
                    id="description"
                    rows={5}
                    placeholder="Mô tả yêu cầu, hành vi mong muốn, hoặc các bước tái hiện lỗi..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại issue</Label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {issueTypes.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Độ ưu tiên</Label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priorities.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit">Tạo issue</Button>
                  <Link href={`/projects/${params.projectId}/issues`}>
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
