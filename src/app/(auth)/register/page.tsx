'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Needs at least one uppercase letter')
      .regex(/[0-9]/, 'Needs at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      await registerUser(values.email, values.password, values.name)
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String((err.response.data as { message: unknown }).message)
          : 'Registration failed. Please try again.'
      setServerError(msg)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                WebWow
              </span>
            </span>
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join thousands of teams shipping faster with AI
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </div>
            )}

            {/* Full name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                {...register('name')}
                aria-invalid={!!errors.name}
                className="
                  w-full rounded-xl border border-white/10 bg-white/5
                  px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600
                  focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/60
                  transition
                "
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email')}
                aria-invalid={!!errors.email}
                className="
                  w-full rounded-xl border border-white/10 bg-white/5
                  px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-600
                  focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/60
                  transition
                "
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  className="
                    w-full rounded-xl border border-white/10 bg-white/5
                    px-4 py-2.5 pr-10 text-sm text-gray-100 placeholder:text-gray-600
                    focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/60
                    transition
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-400 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                  className="
                    w-full rounded-xl border border-white/10 bg-white/5
                    px-4 py-2.5 pr-10 text-sm text-gray-100 placeholder:text-gray-600
                    focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/60
                    transition
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-400 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                group mt-2 flex w-full items-center justify-center gap-2
                rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white
                hover:bg-sky-400 active:bg-sky-600 disabled:opacity-60
                transition-colors
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
