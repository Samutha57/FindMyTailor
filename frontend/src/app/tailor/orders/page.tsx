'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  useGetTailorOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/features/api/apiSlice';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Scissors,
  ArrowRight,
  Filter,
  User,
  Phone,
  FileText,
  Calendar,
} from 'lucide-react';

function TailorOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeFilter, setActiveFilter] = useState<string>(filterParam);
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: response, isLoading, refetch } = useGetTailorOrdersQuery(
    activeFilter === 'all' ? undefined : { filter: activeFilter },
    {
      skip: !isAuthenticated || user?.role !== 'TAILOR',
    }
  );

  const orders: any[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : [];

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'TAILOR') {
      router.push('/customer/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrderStatus({
        orderId,
        status: 'ACCEPTED',
        note: 'Order confirmed and accepted into production schedule',
      }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to accept order');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    try {
      await updateOrderStatus({
        orderId: rejectModalOrder.id,
        status: 'REJECTED',
        note: rejectReason.trim() || 'Order declined due to schedule capacity',
      }).unwrap();
      setRejectModalOrder(null);
      setRejectReason('');
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to reject order');
    }
  };

  if (!isAuthenticated || user?.role !== 'TAILOR') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Tailor Order Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review incoming requests, accept jobs, and update production stages for your assigned orders
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'incoming', label: 'Incoming Requests (Pending Acceptance)' },
          { key: 'active', label: 'Active In-Progress' },
          { key: 'completed', label: 'Completed & Archived' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-3xl p-6 h-36 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {activeFilter === 'incoming'
              ? 'There are currently no new incoming order requests awaiting confirmation.'
              : 'No orders found matching this filter category.'}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const isPendingAcceptance = order.status === 'ORDER_PLACED';

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm transition-all ${
                  isPendingAcceptance
                    ? 'border-amber-300 ring-2 ring-amber-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left Column: Order Information */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                      {isPendingAcceptance && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Action Required
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {order.service?.name} (Qty: {order.quantity})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.service?.description}
                      </p>
                    </div>

                    {/* Customer Info & Target Delivery */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {order.customer?.name}
                        </span>
                      </div>

                      {order.customer?.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer?.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Target: {formatDate(order.requestedDeliveryDate)}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>Total: {formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Instructions Preview */}
                    {order.instructions && (
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2">
                          <strong className="text-slate-800">Instructions:</strong>{' '}
                          {order.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {isPendingAcceptance ? (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={isUpdating}
                          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Order</span>
                        </button>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          disabled={isUpdating}
                          className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : null}

                    <Link
                      href={`/tailor/orders/${order.id}`}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Stage Workbench</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject Order {rejectModalOrder.orderNumber}?
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: {rejectModalOrder.customer?.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the reason for declining this order so the customer is properly
              informed.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reason / Note for Customer
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Schedule fully booked, required fabric unavailable, requested turnaround too tight..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isUpdating}
                className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TailorOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500 text-sm">
          Loading tailor orders...
        </div>
      }
    >
      <TailorOrdersContent />
    </Suspense>
  );
}

