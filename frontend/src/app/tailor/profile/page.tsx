'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  useGetMyTailorProfileQuery,
  useUpdateMyTailorProfileMutation,
} from '@/features/api/apiSlice';
import { updateUserProfile } from '@/features/auth/authSlice';
import {
  Store,
  User,
  MapPin,
  Clock,
  Phone,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function TailorProfileSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: profileResponse, isLoading, refetch } = useGetMyTailorProfileQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'TAILOR',
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateMyTailorProfileMutation();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [bio, setBio] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'TAILOR') {
      router.push('/customer/dashboard');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const profile = profileResponse?.data || user?.tailorProfile;
    if (profile) {
      setShopName(profile.shopName || '');
      setOwnerName(profile.ownerName || user?.name || '');
      setAddress(profile.address || '');
      setContactPhone(profile.contactPhone || user?.phone || '');
      setWorkingHours(profile.workingHours || '');
      setBio(profile.bio || '');
    }
  }, [profileResponse, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await updateProfile({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        address: address.trim(),
        contactPhone: contactPhone.trim(),
        workingHours: workingHours.trim(),
        bio: bio.trim(),
      }).unwrap();

      if (response.success && response.data) {
        setSuccessMsg('Shop profile updated successfully!');
        if (user) {
          dispatch(
            updateUserProfile({
              ...user,
              name: ownerName.trim(),
              tailorProfile: response.data,
            })
          );
        }
        refetch();
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to update shop profile');
    }
  };

  if (!isAuthenticated || user?.role !== 'TAILOR') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Manage Shop Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Update your shop information, operating hours, and customer-facing bio
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Shop / Studio Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                placeholder="Royal Heritage Bespoke Tailors"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Proprietor / Master Tailor Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                placeholder="Master Rajesh Kumar"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Public Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                placeholder="+91 98450 11223"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Operating Hours
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                required
                placeholder="Mon - Sat: 9:30 AM - 8:30 PM"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Workshop Address & City
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="42 Gandhi Road, Commercial Street, Central District"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Shop Bio & Tailoring Specialties
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your tailoring experience, craftsmanship techniques, fabric handling, and specialties..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Live Public Preview Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Eye className="w-4 h-4" />
            <span>Public Customer Preview</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {shopName || 'Your Shop Name'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proprietor: <span className="text-slate-700">{ownerName || user.name}</span>
                </p>
              </div>
            </div>

            {bio && <p className="text-xs text-slate-600 leading-relaxed italic">"{bio}"</p>}

            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{address || 'No address specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{workingHours || 'Working hours not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{contactPhone || 'Contact phone not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
