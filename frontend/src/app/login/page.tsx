'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import { useLoginMutation } from '@/features/api/apiSlice';
import { Scissors, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await login(data).unwrap();
      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.token,
          })
        );
        if (response.data.user.role === 'TAILOR') {
          router.push('/tailor/dashboard');
        } else {
          router.push('/customer/dashboard');
        }
      }
    } catch (err: any) {
      setServerError(
        err?.data?.message || err?.message || 'Invalid email or password. Please try again.'
      );
    }
  };

  const handleFillDemo = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-4">
            <Scissors className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your customer or tailor account
          </p>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>One-Click Demo Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer@example.com')}
              className="px-2.5 py-1.5 text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors text-left"
            >
              <span className="block font-semibold text-blue-600">Customer</span>
              <span className="text-[11px] text-slate-500 truncate block">Priya Sharma</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('royal.tailors@example.com')}
              className="px-2.5 py-1.5 text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors text-left"
            >
              <span className="block font-semibold text-indigo-600">Tailor</span>
              <span className="text-[11px] text-slate-500 truncate block">Royal Heritage</span>
            </button>
          </div>
        </div>

        {serverError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
