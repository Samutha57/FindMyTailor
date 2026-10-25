'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGetTailorByIdQuery } from '@/features/api/apiSlice';
import { formatCurrency } from '@/lib/utils';
import {
  Scissors,
  MapPin,
  Clock,
  Phone,
  User,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function TailorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tailorId = params.id as string;

  const { data: response, isLoading, isError } = useGetTailorByIdQuery(tailorId);
  const tailor = response?.data;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="h-48 bg-white border border-slate-200 rounded-3xl" />
        <div className="h-72 bg-white border border-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (isError || !tailor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tailor profile not found</h2>
        <p className="text-sm text-slate-500">
          The requested tailoring studio could not be loaded or may no longer exist.
        </p>
        <Link
          href="/tailors"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tailors</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tailors</span>
        </button>
      </div>

      {/* Shop Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {tailor.shopName}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Proprietor & Master Tailor:</span>
                <span className="font-semibold text-slate-700">{tailor.ownerName}</span>
              </p>
            </div>
          </div>

          <Link
            href={`/customer/orders/new?tailorId=${tailor.id}`}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Place an Order</span>
          </Link>
        </div>

        {tailor.bio && (
          <p className="mt-6 text-sm text-slate-600 border-t border-slate-100 pt-4 leading-relaxed">
            {tailor.bio}
          </p>
        )}

        {/* Studio Details */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">Address</span>
              <span>{tailor.address}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">Working Hours</span>
              <span>{tailor.workingHours}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 block">Direct Contact</span>
              <span>{tailor.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stitching Services Menu */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Stitching Services & Pricing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a service to start order placement with custom sizing and notes
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
            {tailor.services?.length || 0} Service(s) Available
          </span>
        </div>

        {tailor.services?.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            This tailor has not listed any services yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tailor.services?.map((service: any) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                    <span className="text-lg font-extrabold text-blue-600 shrink-0">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      Est. Completion Time:{' '}
                      <strong className="text-slate-800">
                        {service.estimatedDays} business day{service.estimatedDays > 1 ? 's' : ''}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/customer/orders/new?tailorId=${tailor.id}&serviceId=${service.id}`}
                    className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Book This Service</span>
                    <Scissors className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
