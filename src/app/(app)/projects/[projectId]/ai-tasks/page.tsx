import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { Bot } from "lucide-react";

interface Props {
  params: { projectId: string };
}

export default function ProjectAITasksPage({ params }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="AI Tasks" />
      <ProjectTabs projectId={params.projectId} activeTab="ai-tasks" />
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Danh sách AI Tasks</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi các tác vụ AI đang thực hiện cho dự án.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">Tất cả</Badge>
          <Badge variant="warning">Đang chạy</Badge>
          <Badge variant="default">Chờ phê duyệt</Badge>
          <Badge variant="success">Hoàn thành</Badge>
          <Badge variant="destructive">Thất bại</Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bot className="h-14 w-14 text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-900">Chưa có AI task nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                AI tasks sẽ được tự động tạo khi bạn phê duyệt một issue.
              </p>
              <Link
                href={`/projects/${params.projectId}/issues`}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Xem danh sách issues →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
