import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import { ProjectTabs } from "@/components/layout/project-tabs";
import { Network } from "lucide-react";

interface Props {
  params: { projectId: string };
}

export default function ProjectArchitecturePage({ params }: Props) {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Kiến trúc hệ thống" />
      <ProjectTabs projectId={params.projectId} activeTab="architecture" />
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Sơ đồ kiến trúc</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              AI phân tích và trực quan hóa kiến trúc hệ thống từ codebase.
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Network className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  Chưa có dữ liệu kiến trúc
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  AI sẽ tự động phân tích codebase và tạo sơ đồ kiến trúc sau khi dự án được
                  kết nối và đồng bộ.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Microservices được phát hiện</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dependencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Thư viện và phụ thuộc</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">Endpoints được phát hiện</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
