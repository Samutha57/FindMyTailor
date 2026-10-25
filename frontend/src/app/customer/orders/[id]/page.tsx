'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetOrderByIdQuery } from '@/features/api/apiSlice';
import StatusBadge from '@/components/StatusBadge';
import StatusTimeline from '@/components/StatusTimeline';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Scissors,
  Store,
  Calendar,
  Clock,
  Phone,
  MapPin,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: response, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId, {
    skip: !isAuthenticated || !orderId,
  });

  const order = response?.data;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-sm text-slate-600 mb-4">Please log in to track this order</p>
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32" />
        <div className="h-40 bg-white rounded-3xl border border-slate-200" />
        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <p className="text-sm text-slate-500">
          This order could not be located or you may not have permission to view it.
        </p>
        <Link
          href="/customer/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Back navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order {order.orderNumber}
            </h1>
            <StatusBadge status={order.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Visual Workflow Timeline Component */}
      <StatusTimeline currentStatus={order.status} history={order.statusHistory || []} />

      {/* Order Details & Tailor Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Specifications */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scissors className="w-4 h-4 text-blue-600" />
            <span>Garment & Stitching Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl">
              <span className="text-slate-400 block font-medium">Service Selected</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">
                {order.service?.name}
              </span>
              <p className="text-slate-500 text-[11px] mt-1">{order.service?.description}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl">
              <span className="text-slate-400 block font-medium">Quantity</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">
                {order.quantity} item(s)
              </span>
              <span className="text-slate-500 text-[11px] block mt-1">
                Unit price: {formatCurrency(order.service?.price || 0)}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl">
              <span className="text-slate-400 block font-medium">Requested Delivery Target</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">
                {formatDate(order.requestedDeliveryDate)}
              </span>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
              <span className="text-blue-600 block font-medium">Total Bill</span>
              <span className="text-xl font-extrabold text-blue-700 block mt-0.5">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>

          {/* Customer Instructions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer Sizing & Design Instructions</span>
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 leading-relaxed">
              {order.instructions ? (
                order.instructions
              ) : (
                <span className="italic text-slate-400">No special instructions provided.</span>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Tailor Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Assigned Tailor Shop</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Shop Name</span>
              <span className="font-bold text-slate-800 text-sm block mt-0.5">
                {order.tailorProfile?.shopName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Owner / Master Tailor</span>
              <span className="font-semibold text-slate-700 block mt-0.5">
                {order.tailorProfile?.ownerName}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium mb-1">Workshop Address</span>
              <p className="text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.tailorProfile?.address}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">Working Hours</span>
              <p className="text-slate-600 flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.tailorProfile?.workingHours}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">Contact Phone</span>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{order.tailorProfile?.contactPhone}</span>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href={`/tailors/${order.tailorProfileId}`}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold text-center block transition-colors"
            >
              View Full Tailor Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
