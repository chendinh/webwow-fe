import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { FolderOpen, Bot, GitPullRequest, Activity } from "lucide-react";

const stats = [
  { label: "Dự án đang hoạt động", value: "0", icon: FolderOpen, color: "text-blue-600" },
  { label: "AI Tasks đang chạy", value: "0", icon: Bot, color: "text-purple-600" },
  { label: "Pull Requests", value: "0", icon: GitPullRequest, color: "text-green-600" },
  { label: "Hoạt động hôm nay", value: "0", icon: Activity, color: "text-orange-600" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats grid */}
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

        {/* Recent activity placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                Chưa có hoạt động nào. Hãy tạo dự án đầu tiên của bạn!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick status */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Tasks gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bot className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Chưa có AI task nào</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pull Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GitPullRequest className="h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Chưa có pull request nào</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
