import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { ArrowLeft, CheckCircle, Circle, Loader, XCircle } from "lucide-react";

interface Props {
  params: { projectId: string; taskId: string };
}

// The 14 AITask states
const AI_TASK_STATES = [
  { key: "PENDING", label: "Chờ xử lý", description: "Task đang chờ trong hàng đợi" },
  { key: "ANALYZING_ISSUE", label: "Phân tích issue", description: "AI đang đọc và phân tích yêu cầu" },
  { key: "FETCHING_CODEBASE", label: "Tải codebase", description: "Đang tải mã nguồn từ GitHub" },
  { key: "PLANNING", label: "Lập kế hoạch", description: "AI đang tạo kế hoạch triển khai" },
  { key: "AWAITING_APPROVAL", label: "Chờ phê duyệt", description: "Chờ người dùng phê duyệt kế hoạch" },
  { key: "SETTING_UP_SANDBOX", label: "Chuẩn bị sandbox", description: "Đang khởi tạo môi trường thực thi" },
  { key: "GENERATING_CODE", label: "Tạo mã nguồn", description: "AI đang viết code" },
  { key: "RUNNING_TESTS", label: "Chạy kiểm thử", description: "Đang thực thi test suite" },
  { key: "FIXING_ERRORS", label: "Sửa lỗi", description: "AI đang sửa các lỗi phát sinh" },
  { key: "CREATING_PR", label: "Tạo Pull Request", description: "Đang tạo PR trên GitHub" },
  { key: "AWAITING_PR_REVIEW", label: "Chờ review PR", description: "Chờ nhà phát triển review PR" },
  { key: "COMPLETED", label: "Hoàn thành", description: "Task đã hoàn thành thành công" },
  { key: "FAILED", label: "Thất bại", description: "Task gặp lỗi không thể khôi phục" },
  { key: "CANCELLED", label: "Đã hủy", description: "Task bị hủy bởi người dùng" },
];

// Mock current state — in real app this comes from API
const currentState = "GENERATING_CODE";

function getStateIcon(key: string) {
  if (key === "FAILED") return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
  if (key === "CANCELLED") return <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />;
  if (key === "COMPLETED") return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
  if (key === currentState) return <Loader className="h-5 w-5 text-blue-500 flex-shrink-0 animate-spin" />;

  const currentIdx = AI_TASK_STATES.findIndex((s) => s.key === currentState);
  const thisIdx = AI_TASK_STATES.findIndex((s) => s.key === key);

  if (thisIdx < currentIdx) return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
  return <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />;
}

function getStateVariant(key: string): "default" | "secondary" | "success" | "warning" | "destructive" {
  if (key === "FAILED") return "destructive";
  if (key === "COMPLETED") return "success";
  if (key === currentState) return "default";
  return "secondary";
}

export default function AITaskDetailPage({ params }: Props) {
  const current = AI_TASK_STATES.find((s) => s.key === currentState) ?? AI_TASK_STATES[0];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Chi tiết AI Task" />
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${params.projectId}/ai-tasks`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại AI Tasks
            </Link>
            <Badge variant={getStateVariant(currentState)}>{current.label}</Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task #{params.taskId.slice(0, 8)}</CardTitle>
              <p className="text-sm text-gray-500">{current.description}</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline trạng thái</CardTitle>
              <p className="text-sm text-gray-500">
                Theo dõi tiến trình thực hiện qua 14 trạng thái của AI Task.
              </p>
            </CardHeader>
            <CardContent>
              <ol className="relative">
                {AI_TASK_STATES.map(({ key, label, description }, idx) => {
                  const isActive = key === currentState;
                  const currentIdx = AI_TASK_STATES.findIndex((s) => s.key === currentState);
                  const isPast = idx < currentIdx;

                  return (
                    <li key={key} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        {getStateIcon(key)}
                        {idx < AI_TASK_STATES.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 mt-1 ${isPast ? "bg-green-300" : isActive ? "bg-blue-200" : "bg-gray-200"}`}
                            style={{ minHeight: "20px" }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              isActive ? "text-blue-700" : isPast ? "text-gray-700" : "text-gray-400"
                            }`}
                          >
                            {label}
                          </span>
                          {isActive && (
                            <Badge variant="default" className="text-xs">Hiện tại</Badge>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isActive || isPast ? "text-gray-500" : "text-gray-300"
                          }`}
                        >
                          {description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
