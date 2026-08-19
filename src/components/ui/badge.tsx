import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-sky-500/20 text-sky-300": variant === "default",
          "bg-white/5 text-gray-400": variant === "secondary",
          "bg-emerald-500/20 text-emerald-300": variant === "success",
          "bg-amber-500/20 text-amber-300": variant === "warning",
          "bg-red-500/20 text-red-300": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
