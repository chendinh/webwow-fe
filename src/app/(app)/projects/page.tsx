import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { FolderOpen, Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dự án" />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tất cả dự án</h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý các dự án phần mềm của bạn</p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-14 w-14 text-gray-300" />
              <h3 className="mt-4 text-base font-medium text-gray-900">Chưa có dự án nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bắt đầu bằng cách kết nối một repository GitHub.
              </p>
              <Link href="/projects/new" className="mt-4">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo dự án đầu tiên
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
