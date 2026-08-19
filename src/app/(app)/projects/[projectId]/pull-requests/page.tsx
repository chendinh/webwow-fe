import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { GitPullRequest } from "lucide-react";

interface Props {
  params: { projectId: string };
}

export default function ProjectPullRequestsPage({ params }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Pull Requests" />
      <ProjectTabs projectId={params.projectId} activeTab="pull-requests" />
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Pull Requests</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Các Pull Request được tạo tự động bởi AI.
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary">Tất cả</Badge>
          <Badge variant="default">Đang mở</Badge>
          <Badge variant="success">Đã merge</Badge>
          <Badge variant="destructive">Đã đóng</Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GitPullRequest className="h-14 w-14 text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-900">Chưa có Pull Request nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Pull Requests sẽ được tự động tạo khi AI hoàn thành một task.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
