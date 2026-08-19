"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Bot, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await forgotPassword(values.email);
      setSubmitted(true);
    } catch {
      setServerError(
        "Không thể gửi email. Vui lòng kiểm tra lại địa chỉ email."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">AI IT Team</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Quên mật khẩu</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-sm text-gray-700">
                  Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến{" "}
                  <strong>{getValues("email")}</strong>.
                </p>
                <p className="text-xs text-gray-500">
                  Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setSubmitted(false)}
                  >
                    thử lại
                  </button>
                  .
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-gray-600">
                  Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật
                  khẩu.
                </p>

                {serverError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {serverError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi…
                    </>
                  ) : (
                    "Gửi email đặt lại mật khẩu"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <Link
                    href="/login"
                    className="text-blue-600 hover:underline"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
