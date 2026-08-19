import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ArrowLeft, DollarSign, CheckCircle, Circle, Clock } from "lucide-react";

interface Props {
  params: { projectId: string; issueId: string };
}

// Status display config
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  OPEN: { label: "Đang mở", variant: "default" },
  ANALYZING: { label: "Đang phân tích", variant: "warning" },
  PLAN_READY: { label: "Kế hoạch sẵn sàng", variant: "warning" },
  APPROVED: { label: "Đã phê duyệt", variant: "success" },
  IN_PROGRESS: { label: "Đang thực hiện", variant: "default" },
  DONE: { label: "Hoàn thành", variant: "success" },
  REJECTED: { label: "Đã từ chối", variant: "destructive" },
};

const timelineSteps = [
  { status: "OPEN", label: "Issue được tạo", done: true },
  { status: "ANALYZING", label: "AI đang phân tích", done: false },
  { status: "PLAN_READY", label: "Kế hoạch sẵn sàng", done: false },
  { status: "APPROVED", label: "Phê duyệt", done: false },
  { status: "IN_PROGRESS", label: "Đang thực hiện", done: false },
  { status: "DONE", label: "Hoàn thành", done: false },
];

// Mock current status — in real app this comes from API
const currentStatus = "PLAN_READY";

export default function IssueDetailPage({ params }: Props) {
  const { label, variant } = statusConfig[currentStatus] ?? statusConfig.OPEN;

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Chi tiết Issue" />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${params.projectId}/issues`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại danh sách
            </Link>
            <Badge variant={variant}>{label}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    [ISSUE-{params.issueId.slice(0, 6)}] Tiêu đề issue
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">Tính năng mới</Badge>
                    <Badge variant="warning">Cao</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Đây là mô tả chi tiết của issue. AI sẽ phân tích yêu cầu này và đưa ra kế hoạch
                    thực hiện bao gồm các bước cụ thể, ước tính thời gian và chi phí.
                  </p>
                </CardContent>
              </Card>

              {/* AI Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Kế hoạch AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm text-gray-700">
                    <p className="text-sm text-gray-500 italic">
                      AI đang phân tích yêu cầu và sẽ tạo kế hoạch chi tiết trong vài phút...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Approval panel — shown when status is PLAN_READY */}
              {currentStatus === "PLAN_READY" && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base">Phê duyệt kế hoạch</CardTitle>
                    <p className="text-xs text-gray-600">
                      AI đã phân tích xong. Vui lòng xem xét kế hoạch và phê duyệt để tiếp tục.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Phê duyệt
                    </Button>
                    <Button variant="destructive" className="w-full" size="sm">
                      Từ chối
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Cost estimate */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <CardTitle className="text-base">Ước tính chi phí</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Token AI</span>
                    <span className="font-medium">~5,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Thời gian ước tính</span>
                    <span className="font-medium">~30 phút</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span className="text-gray-700">Chi phí dự kiến</span>
                    <span className="text-green-600">$0.05</span>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tiến trình</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {timelineSteps.map(({ status, label, done }, idx) => {
                      const isActive = status === currentStatus;
                      return (
                        <li key={status} className="flex items-center gap-3">
                          {done || isActive ? (
                            <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-blue-500" : "text-green-500"}`} />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0 text-gray-300" />
                          )}
                          <span className={`text-sm ${isActive ? "font-medium text-blue-700" : done ? "text-gray-700" : "text-gray-400"}`}>
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
