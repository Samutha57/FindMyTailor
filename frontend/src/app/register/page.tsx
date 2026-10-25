'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import { useRegisterMutation } from '@/features/api/apiSlice';
import {
  Scissors,
  User,
  Store,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  role: z.enum(['CUSTOMER', 'TAILOR']),
  // Tailor fields
  shopName: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  workingHours: z.string().optional(),
  bio: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'TAILOR' ? 'TAILOR' : 'CUSTOMER';
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'TAILOR'>(initialRole);
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
    },
  });

  const handleRoleChange = (role: 'CUSTOMER' | 'TAILOR') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const response = await registerUser(data).unwrap();
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
        err?.data?.message || err?.message || 'Registration failed. Please check your information.'
      );
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-4">
            <Scissors className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join FindMyTailor as a customer or register your tailoring shop
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRoleChange('CUSTOMER')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              selectedRole === 'CUSTOMER'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>I am a Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('TAILOR')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              selectedRole === 'TAILOR'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>I am a Tailor</span>
          </button>
        </div>

        {serverError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('role')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Priya Sharma"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.name ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.phone ? 'border-rose-300' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="name@example.com"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password (min. 6 chars)
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Tailor Specific Fields */}
          {selectedRole === 'TAILOR' && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>Tailor Shop Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Shop / Studio Name
                  </label>
                  <input
                    type="text"
                    {...register('shopName')}
                    placeholder="e.g. Master Rajesh Tailoring"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Shop Contact Phone
                  </label>
                  <input
                    type="tel"
                    {...register('contactPhone')}
                    placeholder="+91 98450 11223"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Address & Location
                </label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="e.g. 42 Gandhi Road, Commercial Street"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  {...register('workingHours')}
                  placeholder="e.g. Mon - Sat: 9:30 AM - 8:30 PM"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Bio / Specialties
                </label>
                <textarea
                  {...register('bio')}
                  rows={2}
                  placeholder="e.g. Specializing in bespoke formal shirts, suits, and designer blouses..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white font-semibold text-sm rounded-xl shadow-md transition-all ${
              selectedRole === 'TAILOR'
                ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-slate-500 text-sm">
          Loading registration...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

