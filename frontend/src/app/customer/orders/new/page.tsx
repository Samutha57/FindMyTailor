'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  useGetTailorsQuery,
  useGetTailorServicesQuery,
  useCreateOrderMutation,
} from '@/features/api/apiSlice';
import { formatCurrency } from '@/lib/utils';
import {
  Scissors,
  Store,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTailorId = searchParams.get('tailorId') || '';
  const initialServiceId = searchParams.get('serviceId') || '';

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [selectedTailorId, setSelectedTailorId] = useState(initialTailorId);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: tailorsResponse, isLoading: loadingTailors } = useGetTailorsQuery();
  const tailors = tailorsResponse?.data || [];

  const { data: servicesResponse, isLoading: loadingServices } = useGetTailorServicesQuery(
    selectedTailorId,
    { skip: !selectedTailorId }
  );
  const services = servicesResponse?.data || [];

  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();

  // If initialTailorId or tailors load, pick default if not selected
  useEffect(() => {
    if (!selectedTailorId && tailors.length > 0) {
      setSelectedTailorId(tailors[0].id);
    }
  }, [tailors, selectedTailorId]);

  // If services load, pick service
  useEffect(() => {
    if (services.length > 0) {
      if (!selectedServiceId || !services.some((s: any) => s.id === selectedServiceId)) {
        setSelectedServiceId(services[0].id);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [services, selectedServiceId]);

  // Set default requested delivery date based on service estimatedDays
  const selectedService = services.find((s: any) => s.id === selectedServiceId);
  const selectedTailor = tailors.find((t: any) => t.id === selectedTailorId);

  useEffect(() => {
    if (selectedService?.estimatedDays && !deliveryDate) {
      const minDays = selectedService.estimatedDays + 1;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + minDays);
      setDeliveryDate(targetDate.toISOString().split('T')[0]);
    }
  }, [selectedService, deliveryDate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const totalPrice = (selectedService?.price || 0) * quantity;

  // Minimum date allowed (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedTailorId) {
      setErrorMsg('Please select a tailor');
      return;
    }
    if (!selectedServiceId) {
      setErrorMsg('Please select a stitching service');
      return;
    }
    if (!deliveryDate) {
      setErrorMsg('Please select a requested delivery date');
      return;
    }

    try {
      const result = await createOrder({
        tailorProfileId: selectedTailorId,
        serviceId: selectedServiceId,
        quantity: Number(quantity),
        requestedDeliveryDate: new Date(deliveryDate).toISOString(),
        instructions: instructions.trim(),
      }).unwrap();

      if (result.success && result.data) {
        router.push(`/customer/orders/${result.data.id}`);
      }
    } catch (err: any) {
      setErrorMsg(
        err?.data?.message || err?.message || 'Failed to place stitching order. Please try again.'
      );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Book Stitching Service
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure garment details, set delivery targets, and submit your custom instructions
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Inputs */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Step 1: Select Tailor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-blue-600" />
              <span>1. Choose Tailor / Boutique</span>
            </label>
            {loadingTailors ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <select
                value={selectedTailorId}
                onChange={(e) => {
                  setSelectedTailorId(e.target.value);
                  setSelectedServiceId('');
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tailors.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.shopName} - {t.ownerName} ({t.address})
                  </option>
                ))}
              </select>
            )}
            {selectedTailor && (
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                <span>Working hours:</span>
                <strong className="text-slate-700">{selectedTailor.workingHours}</strong>
              </p>
            )}
          </div>

          {/* Step 2: Select Stitching Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-blue-600" />
              <span>2. Select Stitching Service</span>
            </label>
            {loadingServices ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : services.length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                This tailor currently has no active stitching services available.
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((srv: any) => {
                  const isChecked = selectedServiceId === srv.id;
                  return (
                    <label
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="serviceOption"
                          checked={isChecked}
                          onChange={() => setSelectedServiceId(srv.id)}
                          className="mt-1 text-blue-600"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{srv.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{srv.description}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Takes ~{srv.estimatedDays} day(s)</span>
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 text-sm shrink-0 ml-4">
                        {formatCurrency(srv.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Quantity & Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Quantity</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Requested Delivery Date</span>
              </label>
              <input
                type="date"
                min={minDateStr}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Step 4: Stitching Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Stitching Instructions & Sizing Notes</span>
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter collar type, sleeve length, pocket styling, chest/waist measurements, fabric provided, or specific styling requests..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Be as specific as possible. The tailor will review these notes before accepting your order.
            </p>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Shop:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {selectedTailor?.shopName || 'None'}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Service:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {selectedService?.name || 'None'}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Unit Price:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(selectedService?.price || 0)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Quantity:</span>
                <span className="font-semibold text-slate-900">{quantity}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Target Date:</span>
                <span className="font-semibold text-slate-900">
                  {deliveryDate || 'Not specified'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Estimated Total:</span>
                <span className="text-xl font-extrabold text-blue-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 text-[11px] text-blue-700 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>9-Stage Tracking Included</span>
              </p>
              <p className="text-blue-600">
                Status history begins at <strong>ORDER_PLACED</strong> immediately upon submission.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedServiceId}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Stitching Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500 text-sm">
          Loading order placement form...
        </div>
      }
    >
      <NewOrderContent />
    </Suspense>
  );
}

