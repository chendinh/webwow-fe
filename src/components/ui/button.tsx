import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
          {
            "bg-sky-500 text-white hover:bg-sky-400": variant === "default",
            "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-gray-100": variant === "outline",
            "text-gray-400 hover:bg-white/5 hover:text-gray-200": variant === "ghost",
            "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20": variant === "destructive",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
