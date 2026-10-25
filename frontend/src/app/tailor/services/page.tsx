'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  useGetMyTailorProfileQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '@/features/api/apiSlice';
import { formatCurrency } from '@/lib/utils';
import {
  Scissors,
  PlusCircle,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

const COMMON_PRESETS = [
  { name: 'Shirt Stitching', price: 450, estimatedDays: 3, description: 'Formal & casual custom fit shirt' },
  { name: 'Pant / Trouser Stitching', price: 550, estimatedDays: 4, description: 'Custom formal trousers or chinos' },
  { name: 'Designer Blouse Stitching', price: 650, estimatedDays: 4, description: 'Padded princess-cut designer blouse' },
  { name: 'Churidar / Salwar Stitching', price: 750, estimatedDays: 5, description: 'Tailored ethnic suit with lining' },
  { name: 'Suit 2-Piece Tailoring', price: 3500, estimatedDays: 10, description: 'Bespoke blazer and tailored trouser' },
  { name: 'Garment Alterations', price: 150, estimatedDays: 1, description: 'Express length, waist or fitting adjustment' },
];

export default function TailorServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: profileResponse, isLoading, refetch } = useGetMyTailorProfileQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'TAILOR',
  });

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>(500);
  const [estimatedDays, setEstimatedDays] = useState<number | string>(3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'TAILOR') {
      router.push('/customer/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const profile = profileResponse?.data;
  const services = profile?.services || [];

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setServiceName('');
    setDescription('');
    setPrice(500);
    setEstimatedDays(3);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: any) => {
    setEditingServiceId(srv.id);
    setServiceName(srv.name);
    setDescription(srv.description);
    setPrice(srv.price);
    setEstimatedDays(srv.estimatedDays);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setServiceName(preset.name);
    setDescription(preset.description);
    setPrice(preset.price);
    setEstimatedDays(preset.estimatedDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numPrice = Number(price);
    const numDays = Number(estimatedDays);

    if (!serviceName.trim()) {
      setErrorMsg('Service name is required');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('Price must be greater than 0');
      return;
    }
    if (isNaN(numDays) || numDays <= 0) {
      setErrorMsg('Estimated days must be at least 1 day');
      return;
    }

    try {
      if (editingServiceId) {
        await updateService({
          id: editingServiceId,
          data: {
            name: serviceName.trim(),
            description: description.trim(),
            price: numPrice,
            estimatedDays: numDays,
          },
        }).unwrap();
      } else {
        await createService({
          name: serviceName.trim(),
          description: description.trim() || `${serviceName.trim()} custom tailoring`,
          price: numPrice,
          estimatedDays: numDays,
        }).unwrap();
      }

      setModalOpen(false);
      refetch();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to save service');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteService(id).unwrap();
        refetch();
      } catch (err: any) {
        alert(err?.data?.message || 'Failed to delete service');
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'TAILOR') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Stitching Services
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Define the services you offer, set prices, and specify turnaround times for customers
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl h-44" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <Scissors className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No stitching services listed</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Customers cannot order from your shop until you list at least one service (e.g., Shirt
            Stitching, Alterations, Blouse Tailoring).
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv: any) => (
            <div
              key={srv.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{srv.name}</h3>
                  <span className="text-lg font-extrabold text-indigo-700 shrink-0">
                    {formatCurrency(srv.price)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {srv.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Turnaround:{' '}
                    <strong className="text-slate-800">
                      {srv.estimatedDays} business day{srv.estimatedDays > 1 ? 's' : ''}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(srv.id, srv.name)}
                  className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Service */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-indigo-600" />
                <span>{editingServiceId ? 'Edit Stitching Service' : 'Add New Stitching Service'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets for fast entry */}
            {!editingServiceId && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Presets</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-slate-700 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Formal Shirt Stitching"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Specifications
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Premium single needle stitch, choice of cuff and collar style..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Est. Days to Complete
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  {isCreating || isUpdating ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
