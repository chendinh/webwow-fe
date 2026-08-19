import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { AlertCircle, Plus } from "lucide-react";

interface Props {
  params: { projectId: string };
}

export default function ProjectIssuesPage({ params }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Issues" />
      <ProjectTabs projectId={params.projectId} activeTab="issues" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Danh sách Issues</h2>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý các yêu cầu và lỗi của dự án</p>
          </div>
          <Link href={`/projects/${params.projectId}/issues/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo issue
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Badge variant="default">Tất cả</Badge>
          <Badge variant="secondary">Đang mở</Badge>
          <Badge variant="warning">Đang xử lý</Badge>
          <Badge variant="success">Đã đóng</Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-14 w-14 text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-900">Chưa có issue nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tạo issue đầu tiên để bắt đầu theo dõi tiến độ.
              </p>
              <Link href={`/projects/${params.projectId}/issues/new`} className="mt-4">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo issue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
