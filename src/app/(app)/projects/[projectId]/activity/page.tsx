import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { Activity } from "lucide-react";

interface Props {
  params: { projectId: string };
}

export default function ProjectActivityPage({ params }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Hoạt động" />
      <ProjectTabs projectId={params.projectId} activeTab="activity" />
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Nhật ký hoạt động</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Tất cả hoạt động xảy ra trong dự án theo thời gian thực.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="h-14 w-14 text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-900">Chưa có hoạt động nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Các sự kiện như tạo issue, chạy AI task, và tạo PR sẽ xuất hiện ở đây.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
