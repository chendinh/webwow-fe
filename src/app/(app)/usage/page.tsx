import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { DollarSign, Zap, BarChart2, TrendingUp } from "lucide-react";

const usageStats = [
  { label: "Tháng này", value: "$0.00", sub: "0 tokens", icon: DollarSign, color: "text-green-600" },
  { label: "AI Tasks đã chạy", value: "0", sub: "Tháng này", icon: Zap, color: "text-purple-600" },
  { label: "Tokens đã dùng", value: "0", sub: "Tổng cộng", icon: BarChart2, color: "text-blue-600" },
  { label: "Tiết kiệm được", value: "$0", sub: "So với dev thủ công", icon: TrendingUp, color: "text-orange-500" },
];

const planFeatures = [
  { label: "Gói hiện tại", value: "Free" },
  { label: "AI Tasks / tháng", value: "5 / 5" },
  { label: "Tokens / tháng", value: "50,000 / 50,000" },
  { label: "Số dự án tối đa", value: "1 / 1" },
  { label: "Ngày gia hạn", value: "—" },
];

export default function UsagePage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Sử dụng & Thanh toán" />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {usageStats.map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Current plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gói dịch vụ</CardTitle>
                <Badge variant="secondary">Free</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {planFeatures.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
              <div className="pt-3 border-t">
                <button className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  Nâng cấp lên Pro
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Usage chart placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ sử dụng</CardTitle>
              <p className="text-sm text-gray-500">Chi phí 30 ngày gần nhất</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart2 className="h-12 w-12 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">Chưa có dữ liệu sử dụng</p>
                <p className="text-xs text-gray-400 mt-1">
                  Biểu đồ sẽ hiển thị sau khi có AI Task đầu tiên.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing history */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Chưa có giao dịch nào</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
