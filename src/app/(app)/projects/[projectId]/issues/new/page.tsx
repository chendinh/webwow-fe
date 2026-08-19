"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader } from "lucide-react";
import { issuesApi } from "@/lib/api/issues.api";
import { useOrgStore } from "@/stores/org.store";

type IssueType = "BUG" | "FEATURE" | "REFACTOR" | "PERFORMANCE" | "SECURITY" | "DEPENDENCY" | "OTHER";
type IssuePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const issueTypes: { value: IssueType; label: string }[] = [
  { value: "FEATURE", label: "Tính năng mới" },
  { value: "BUG", label: "Báo lỗi" },
  { value: "REFACTOR", label: "Tái cấu trúc" },
  { value: "PERFORMANCE", label: "Hiệu năng" },
  { value: "SECURITY", label: "Bảo mật" },
  { value: "DEPENDENCY", label: "Cập nhật thư viện" },
  { value: "OTHER", label: "Khác" },
];

const priorities: { value: IssuePriority; label: string }[] = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Khẩn cấp" },
];

export default function NewIssuePage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const activeOrgId = useOrgStore((s) => s.activeOrgId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueType>("FEATURE");
  const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;

    if (description.length < 10) {
      setError("Mô tả phải có ít nhất 10 ký tự.");
      return;
    }
    if (description.length > 5000) {
      setError("Mô tả không được vượt quá 5000 ký tự.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await issuesApi.create(params.projectId, activeOrgId, {
        title,
        description,
        type,
        priority,
      });
      router.push(`/projects/${params.projectId}/issues`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ??
        "Tạo issue thất bại. Vui lòng thử lại.";
      setError(Array.isArray(msg) ? msg.join(", ") : (msg as string));
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeOrgId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Chưa có tổ chức.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/projects/${params.projectId}/issues`}
              className="inline-flex items-center text-sm text-gray-400 hover:text-gray-200 transition"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách issues
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin issue</CardTitle>
              <p className="text-sm text-gray-400">
                Mô tả chi tiết để AI có thể phân tích và thực hiện.
              </p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    placeholder="Ví dụ: Thêm tính năng đăng nhập bằng Google"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Mô tả chi tiết *{" "}
                    <span className="text-xs text-gray-500">({description.length}/5000)</span>
                  </Label>
                  <textarea
                    id="description"
                    rows={6}
                    placeholder="Mô tả yêu cầu, hành vi mong muốn, hoặc các bước tái hiện lỗi... (tối thiểu 10 ký tự)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    minLength={10}
                    maxLength={5000}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition resize-none disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Loại issue *</Label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value as IssueType)}
                      className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition"
                    >
                      {issueTypes.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Độ ưu tiên *</Label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as IssuePriority)}
                      className="w-full rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition"
                    >
                      {priorities.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                    Tạo issue
                  </Button>
                  <Link href={`/projects/${params.projectId}/issues`}>
                    <Button type="button" variant="outline">
                      Hủy
                    </Button>
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
