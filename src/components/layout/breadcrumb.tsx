"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

/** Map URL segments to human-readable Vietnamese labels */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Dự án",
  issues: "Yêu cầu",
  "ai-tasks": "AI Tasks",
  architecture: "Kiến trúc",
  activity: "Hoạt động",
  "pull-requests": "Pull Requests",
  usage: "Sử dụng & Thanh toán",
  settings: "Cài đặt",
  overview: "Tổng quan",
  new: "Tạo mới",
};

/** Returns a label for a single path segment */
function getSegmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

interface BreadcrumbSegment {
  label: string;
  href: string;
}

export function Breadcrumb() {
  const pathname = usePathname();

  // Split and filter out empty segments
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  // Build up cumulative hrefs for each segment
  const crumbs: BreadcrumbSegment[] = segments.map((seg, index) => ({
    label: getSegmentLabel(seg),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
            )}
            {isLast ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
