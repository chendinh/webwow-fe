"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topbar } from "@/components/layout/topbar";
import { Github, ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { projectsApi } from "@/lib/api/projects.api";
import { useOrgStore } from "@/stores/org.store";

interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  description: string | null;
  private: boolean;
}

export default function NewProjectPage() {
  const router = useRouter();
  const activeOrgId = useOrgStore((s) => s.activeOrgId);

  const [step, setStep] = useState<"repo" | "manual">("repo");
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);

  // Manual form fields
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [repositoryOwner, setRepositoryOwner] = useState("");
  const [repositoryName, setRepositoryName] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrgId) return;
    setReposLoading(true);
    projectsApi
      .listRepos(activeOrgId)
      .then((res) => {
        const data = res.data as GithubRepo[] | { repositories?: GithubRepo[] };
        if (Array.isArray(data)) {
          setRepos(data);
        } else if (data?.repositories) {
          setRepos(data.repositories);
        }
      })
      .catch(() => {
        setReposError("Không thể tải danh sách repo. GitHub chưa được kết nối hoặc có lỗi.");
      })
      .finally(() => setReposLoading(false));
  }, [activeOrgId]);

  const handleSelectRepo = (repo: GithubRepo) => {
    setProjectName(repo.name);
    setRepositoryUrl(`https://github.com/${repo.full_name}`);
    setRepositoryOwner(repo.owner.login);
    setRepositoryName(repo.name);
    setDefaultBranch(repo.default_branch);
    setDescription(repo.description ?? "");
    setStep("manual");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await projectsApi.create(activeOrgId, {
        name: projectName,
        description: description || undefined,
        repositoryUrl: repositoryUrl || undefined,
        repositoryOwner: repositoryOwner || undefined,
        repositoryName: repositoryName || undefined,
        defaultBranch: defaultBranch || undefined,
      });
      const project = res.data as { id: string };
      router.push(`/projects/${project.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Tạo dự án thất bại. Vui lòng thử lại.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeOrgId) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Tạo dự án mới" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Chưa có tổ chức. Vui lòng tạo tổ chức trước.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tạo dự án mới" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách dự án
            </Link>
          </div>

          {/* Step 1: pick from GitHub repos */}
          {step === "repo" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6 text-gray-700" />
                  <CardTitle>Chọn GitHub Repository</CardTitle>
                </div>
                <p className="text-sm text-gray-500">
                  Chọn repo từ tài khoản GitHub đã kết nối, hoặc nhập thủ công.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {reposLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : reposError ? (
                  <p className="text-sm text-red-500">{reposError}</p>
                ) : repos.length === 0 ? (
                  <p className="text-sm text-gray-500">Không tìm thấy repo nào.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                    {repos.map((repo) => (
                      <li key={repo.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectRepo(repo)}
                          className="w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-50 text-left"
                        >
                          <Github className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{repo.full_name}</p>
                            {repo.description && (
                              <p className="text-xs text-gray-500 truncate">{repo.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                              Branch: {repo.default_branch}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setStep("manual")}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Nhập thủ công →
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: fill in project form */}
          {step === "manual" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6 text-gray-700" />
                  <CardTitle>Thông tin dự án</CardTitle>
                </div>
                <p className="text-sm text-gray-500">
                  Điền thông tin dự án để AI IT Team phân tích và quản lý.
                </p>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Tên dự án *</Label>
                    <Input
                      id="projectName"
                      placeholder="Ví dụ: My Awesome App"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                    <Input
                      id="description"
                      placeholder="Mô tả ngắn về dự án"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repositoryUrl">URL GitHub Repository</Label>
                    <Input
                      id="repositoryUrl"
                      placeholder="https://github.com/username/repository"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repositoryOwner">Owner</Label>
                      <Input
                        id="repositoryOwner"
                        placeholder="username"
                        value={repositoryOwner}
                        onChange={(e) => setRepositoryOwner(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repositoryName">Repository Name</Label>
                      <Input
                        id="repositoryName"
                        placeholder="my-repo"
                        value={repositoryName}
                        onChange={(e) => setRepositoryName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultBranch">Default Branch</Label>
                    <Input
                      id="defaultBranch"
                      placeholder="main"
                      value={defaultBranch}
                      onChange={(e) => setDefaultBranch(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                      Tạo dự án
                    </Button>
                    <button
                      type="button"
                      onClick={() => setStep("repo")}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ← Quay lại
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
