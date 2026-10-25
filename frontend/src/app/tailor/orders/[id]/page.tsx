'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '@/features/api/apiSlice';
import StatusBadge from '@/components/StatusBadge';
import StatusTimeline, { WORKFLOW_STAGES } from '@/components/StatusTimeline';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Scissors,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  AlertCircle,
  Send,
  Layers,
} from 'lucide-react';

export default function TailorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [selectedNextStatus, setSelectedNextStatus] = useState<string>('');
  const [updateNote, setUpdateNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: response, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId, {
    skip: !isAuthenticated || user?.role !== 'TAILOR' || !orderId,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const order = response?.data || response;

  if (!isAuthenticated || user?.role !== 'TAILOR') {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-sm text-slate-600 mb-4">Tailor login required</p>
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
          This order could not be located or is not assigned to your tailor shop.
        </p>
        <Link
          href="/tailor/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Orders</span>
        </Link>
      </div>
    );
  }

  const currentStageIndex = WORKFLOW_STAGES.findIndex((s) => s.id === order.status);
  const isTerminal = order.status === 'COMPLETED' || order.status === 'REJECTED';
  const nextStage =
    currentStageIndex >= 0 && currentStageIndex < WORKFLOW_STAGES.length - 1
      ? WORKFLOW_STAGES[currentStageIndex + 1]
      : null;

  // Remaining forward stages
  const forwardStages =
    currentStageIndex >= 0 ? WORKFLOW_STAGES.slice(currentStageIndex + 1) : [];

  const handleUpdate = async (targetStatus: string, defaultNote?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateOrderStatus({
        orderId,
        status: targetStatus,
        note: updateNote.trim() || defaultNote || `Stage updated to ${targetStatus}`,
      }).unwrap();
      setUpdateNote('');
      setSelectedNextStatus('');
      setSuccessMsg(`Status successfully transitioned to ${targetStatus}`);
      refetch();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/tailor/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order {order.orderNumber}
            </h1>
            <StatusBadge status={order.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Target Delivery Date: <strong>{formatDate(order.requestedDeliveryDate)}</strong> •
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* WORKBENCH ACTION CARD: Update Status */}
      {!isTerminal ? (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Stage Transition Workbench
              </span>
              <h2 className="text-xl font-bold mt-0.5">Update Stitching Workflow</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current:</span>
              <StatusBadge status={order.status} size="sm" />
            </div>
          </div>

          {/* If ORDER_PLACED: Prompt Accept / Reject */}
          {order.status === 'ORDER_PLACED' ? (
            <div className="space-y-4">
              <p className="text-sm text-indigo-200">
                This order was placed by the customer and is awaiting your confirmation. Accept to
                start cutting and production, or reject if you cannot fulfill.
              </p>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                  Optional Note to Customer
                </label>
                <input
                  type="text"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="e.g. Fabric reviewed, measurements verified, scheduled for cutting"
                  className="w-full px-4 py-2.5 text-sm bg-slate-800/80 border border-indigo-800 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() =>
                    handleUpdate('ACCEPTED', 'Order accepted and confirmed by tailor')
                  }
                  disabled={isUpdating}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Order (Begin Workflow)</span>
                </button>

                <button
                  onClick={() =>
                    handleUpdate('REJECTED', 'Order declined by tailor due to capacity')
                  }
                  disabled={isUpdating}
                  className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Order</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active order progression controls */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* One click fast advance button */}
                {nextStage && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                        Recommended Next Stage
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">
                        Advance to: {nextStage.label}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Transition sequentially to the next milestone in the workflow.
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpdate(nextStage.id)}
                      disabled={isUpdating}
                      className="mt-4 w-full py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Advance to {nextStage.label}</span>
                    </button>
                  </div>
                )}

                {/* Direct forward stage selection */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold block">
                      Or Jump Forward to Specific Stage
                    </span>
                    <select
                      value={selectedNextStatus}
                      onChange={(e) => setSelectedNextStatus(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Target Stage --</option>
                      {forwardStages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedNextStatus) {
                        handleUpdate(selectedNextStatus);
                      }
                    }}
                    disabled={isUpdating || !selectedNextStatus}
                    className="mt-4 w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply Selected Status</span>
                  </button>
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                  Update Note & Customer Comment (Optional)
                </label>
                <input
                  type="text"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="e.g. Pattern cut, inner lining stitched, ready for trials..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-800/80 border border-indigo-800 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completed/Rejected Terminal Banner */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
              order.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {order.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Order is {order.status}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This order has reached its terminal status and cannot be modified further.
            </p>
          </div>
        </div>
      )}

      {/* Visual Workflow Timeline */}
      <StatusTimeline currentStatus={order.status} history={order.statusHistory || []} />

      {/* Customer Info & Order Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scissors className="w-4 h-4 text-indigo-600" />
            <span>Garment & Stitching Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl">
              <span className="text-slate-400 block font-medium">Service</span>
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
                Rate: {formatCurrency(order.service?.price || 0)} each
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl">
              <span className="text-slate-400 block font-medium">Requested Delivery Target</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">
                {formatDate(order.requestedDeliveryDate)}
              </span>
            </div>

            <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
              <span className="text-indigo-600 block font-medium">Total Bill</span>
              <span className="text-xl font-extrabold text-indigo-700 block mt-0.5">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customer Sizing & Design Instructions</span>
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 leading-relaxed font-mono">
              {order.instructions ? (
                order.instructions
              ) : (
                <span className="italic text-slate-400 font-sans">
                  No special customer instructions provided.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Customer Details</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Customer Name</span>
              <span className="font-bold text-slate-800 text-sm block mt-0.5">
                {order.customer?.name}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">Phone Number</span>
              <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{order.customer?.phone || 'Not provided'}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">Email</span>
              <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{order.customer?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
