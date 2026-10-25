'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetTailorOrdersQuery, useGetMyTailorProfileQuery } from '@/features/api/apiSlice';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Scissors,
  ArrowRight,
  FileText,
  ShoppingBag,
  Bell,
  Layers,
} from 'lucide-react';

export default function TailorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  const { data: profileResponse } = useGetMyTailorProfileQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'TAILOR',
  });
  const { data: ordersResponse, isLoading } = useGetTailorOrdersQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'TAILOR',
  });

  const orders: any[] = Array.isArray(ordersResponse)
    ? ordersResponse
    : Array.isArray(ordersResponse?.data)
    ? ordersResponse.data
    : [];

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'TAILOR') {
        router.push('/customer/dashboard');
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized) return null;
  if (!isAuthenticated || user?.role !== 'TAILOR') return null;

  const profile = profileResponse?.data || user?.tailorProfile;

  const incomingOrders = orders.filter((o: any) => o.status === 'ORDER_PLACED');
  const activeOrders = orders.filter(
    (o: any) => !['ORDER_PLACED', 'COMPLETED', 'REJECTED'].includes(o.status)
  );
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
            Tailor Workshop Workbench
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {profile?.shopName || `${user.name}'s Studio`}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Manage incoming orders, update live stitching progress stages, and configure your
            tailoring services.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/tailor/orders"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/tailor/services"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" />
            <span>Stitching Services</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Incoming Orders
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {incomingOrders.length}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Stitching
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

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Managed
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Incoming Orders Attention Alert */}
      {incomingOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  {incomingOrders.length} Incoming Order(s) Awaiting Your Response
                </h3>
                <p className="text-xs text-amber-700">
                  Customers are waiting for you to accept and begin fabric processing.
                </p>
              </div>
            </div>
            <Link
              href="/tailor/orders?filter=incoming"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              Review Incoming
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Assigned Orders</h2>
          <Link
            href="/tailor/orders"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
            <Scissors className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No orders received yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Make sure your shop profile and stitching services are up to date so customers can
              discover you.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/tailor/services"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Add Services
              </Link>
              <Link
                href="/tailor/profile"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {order.service?.name} (Qty: {order.quantity}) - {formatCurrency(order.totalPrice)}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Customer: <strong className="text-slate-700">{order.customer?.name}</strong>{' '}
                    ({order.customer?.phone || 'No phone'}) • Target:{' '}
                    {formatDate(order.requestedDeliveryDate)}
                  </p>
                </div>

                <Link
                  href={`/tailor/orders/${order.id}`}
                  className="py-2 px-4 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Update Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
