import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  /** Optional icon rendered above the title. */
  icon?: ReactNode;
  /** Main heading text (required). */
  title: string;
  /** Supporting description text. */
  description?: string;
  /** Optional call-to-action element, e.g. a Button. */
  action?: ReactNode;
  /** Additional class names for the container. */
  className?: string;
}

/**
 * EmptyState — a reusable centered placeholder for empty lists / zero-data views.
 *
 * @example
 * <EmptyState
 *   title="Chưa có dự án nào"
 *   description="Kết nối kho GitHub đầu tiên của bạn để bắt đầu."
 *   action={<Button onClick={…}>Thêm dự án</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-300 bg-white py-12 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 max-w-sm">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
