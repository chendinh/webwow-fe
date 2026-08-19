"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/layout/topbar";
import { DollarSign, Zap, BarChart2, TrendingUp, Loader } from "lucide-react";
import { usageApi, UsageSummary } from "@/lib/api/usage.api";
import { organizationsApi, Organization } from "@/lib/api/organizations.api";
import { useOrgStore } from "@/stores/org.store";

export default function UsagePage() {
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const [current, setCurrent] = useState<UsageSummary | null>(null);
  const [history, setHistory] = useState<UsageSummary[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.allSettled([
      usageApi.getCurrent(activeOrgId),
      usageApi.getHistory(activeOrgId),
      organizationsApi.getById(activeOrgId),
    ])
      .then(([currentRes, historyRes, orgRes]) => {
        if (currentRes.status === "fulfilled") {
          setCurrent(currentRes.value.data as UsageSummary);
        }
        if (historyRes.status === "fulfilled") {
          setHistory((historyRes.value.data as UsageSummary[]) ?? []);
        }
        if (orgRes.status === "fulfilled") {
          setOrg(orgRes.value.data as Organization);
        }
      })
      .finally(() => setLoading(false));
  }, [activeOrgId]);

  const usageStats = [
    {
      label: "Chi phí tháng này",
      value: current ? `$${current.customerCost.toFixed(4)}` : "$0.00",
      sub: current ? `${current.totalTokens.toLocaleString()} tokens` : "0 tokens",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "AI Tasks đã chạy",
      value: current ? current.totalTasks.toString() : "0",
      sub: "Tháng này",
      icon: Zap,
      color: "text-purple-600",
    },
    {
      label: "Tokens đã dùng",
      value: current ? current.totalTokens.toLocaleString() : "0",
      sub: "Tháng này",
      icon: BarChart2,
      color: "text-blue-600",
    },
    {
      label: "Hạn mức sử dụng",
      value: org ? `$${org.usageCap.toFixed(2)}` : "—",
      sub: "Giới hạn tháng",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  if (!activeOrgId) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Sử dụng & Thanh toán" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">
            Chưa có tổ chức. Vui lòng tạo tổ chức trước.
          </p>
        </div>
      </div>
    );
  }

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
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin text-gray-300 mt-1" />
                    ) : (
                      <>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      </>
                    )}
                  </div>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Organization info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tổ chức</CardTitle>
                {org && <Badge variant="secondary">{org.name}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tên tổ chức</span>
                    <span className="font-medium text-gray-900">{org?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Hạn mức / tháng</span>
                    <span className="font-medium text-gray-900">
                      ${org?.usageCap?.toFixed(2) ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">AI Tasks tháng này</span>
                    <span className="font-medium text-gray-900">
                      {current?.totalTasks ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Chi phí tháng này</span>
                    <span className="font-medium text-green-600">
                      ${current?.customerCost?.toFixed(4) ?? "0.00"}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Usage history */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử sử dụng</CardTitle>
              <p className="text-sm text-gray-500">Theo tháng</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BarChart2 className="h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">Chưa có dữ liệu sử dụng</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {history.map((h) => (
                    <li
                      key={`${h.year}-${h.month}`}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-gray-600">
                        {h.month}/{h.year}
                      </span>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${h.customerCost.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {h.totalTasks} tasks · {h.totalTokens.toLocaleString()} tokens
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
