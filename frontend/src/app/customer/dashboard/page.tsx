'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetMyOrdersQuery } from '@/features/api/apiSlice';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  PlusCircle,
  Compass,
  ArrowRight,
  Scissors,
  Store,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { data: response, isLoading } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  const orders: any[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : [];

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || (!isAuthenticated && isLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const activeOrders = orders.filter(
    (o: any) => !['COMPLETED', 'REJECTED'].includes(o.status)
  );
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Hello, {user?.name || 'Customer'}!
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Welcome to your tailoring hub. Track your ongoing garments, view order history, or
            book a new stitch.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/customer/orders/new"
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm rounded-xl shadow transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Stitching</span>
          </Link>
          <Link
            href="/tailors"
            className="px-5 py-2.5 bg-blue-800/80 hover:bg-blue-900 text-white font-semibold text-sm rounded-xl border border-blue-400/40 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Tailors</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In-Progress
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {activeOrders.length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {completedOrders.length}
            </p>
          </div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent & Active Orders</h2>
          <Link
            href="/customer/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Scissors className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">You haven't placed any orders yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Find a professional tailor near you, choose a stitching service, and track your
              garment from the first cut to pickup.
            </p>
            <Link
              href="/customer/orders/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Place First Order</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mt-0.5">
                      {order.service?.name} (Qty: {order.quantity})
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.tailorProfile?.shopName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Price</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>

                  <Link
                    href={`/customer/orders/${order.id}`}
                    className="py-2 px-4 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
