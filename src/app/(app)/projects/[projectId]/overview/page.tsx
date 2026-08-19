import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { GitBranch, Bot, GitPullRequest, AlertCircle } from "lucide-react";

interface Props {
  params: { projectId: string };
}

const stats = [
  { label: "Issues đang mở", value: "0", icon: AlertCircle, color: "text-orange-500" },
  { label: "AI Tasks đang chạy", value: "0", icon: Bot, color: "text-purple-600" },
  { label: "Pull Requests", value: "0", icon: GitPullRequest, color: "text-green-600" },
  { label: "Branches", value: "0", icon: GitBranch, color: "text-blue-600" },
];

export default function ProjectOverviewPage({ params }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Tổng quan dự án" />
      <ProjectTabs projectId={params.projectId} activeTab="overview" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Trạng thái</span>
                <Badge variant="success">Đang hoạt động</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Repository</span>
                <span className="text-gray-900 font-medium">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ngôn ngữ chính</span>
                <span className="text-gray-900 font-medium">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ngày tạo</span>
                <span className="text-gray-900 font-medium">—</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bot className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Chưa có hoạt động nào</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
