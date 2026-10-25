'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetMyOrdersQuery } from '@/features/api/apiSlice';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Store,
  Calendar,
  ArrowRight,
  PlusCircle,
  Scissors,
  Clock,
  Filter,
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const { data: response, isLoading, refetch } = useGetMyOrdersQuery(undefined, {
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

  if (!isInitialized) return null;
  if (!isAuthenticated) return null;

  const filteredOrders = orders.filter((order: any) => {
    if (activeTab === 'ACTIVE') {
      return !['COMPLETED', 'REJECTED'].includes(order.status);
    }
    if (activeTab === 'COMPLETED') {
      return ['COMPLETED', 'REJECTED'].includes(order.status);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Stitching Orders
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            View order status, inspection checkpoints, and detailed tailor communications
          </p>
        </div>

        <Link
          href="/customer/orders/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Stitching Order</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL'
              ? `All Orders (${orders.length})`
              : tab === 'ACTIVE'
              ? `In-Progress (${
                  orders.filter((o: any) => !['COMPLETED', 'REJECTED'].includes(o.status)).length
                })`
              : `Completed (${
                  orders.filter((o: any) => ['COMPLETED', 'REJECTED'].includes(o.status)).length
                })`}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-6 h-28 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders in this category</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {activeTab === 'ACTIVE'
              ? "You don't have any active stitching orders in progress."
              : 'You have not placed any orders yet.'}
          </p>
          <Link
            href="/customer/orders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place an Order</span>
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-1">
                  <Scissors className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    {order.service?.name}
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      (Quantity: {order.quantity})
                    </span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {order.tailorProfile?.shopName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target Delivery: {formatDate(order.requestedDeliveryDate)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Placed on {formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                  <span className="text-lg font-extrabold text-blue-700">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>

                <Link
                  href={`/customer/orders/${order.id}`}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Track & Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
