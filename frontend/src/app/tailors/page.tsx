'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGetTailorsQuery } from '@/features/api/apiSlice';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Store,
  MapPin,
  Clock,
  Phone,
  Scissors,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

const SERVICE_TAGS = ['All', 'Shirt', 'Pant', 'Blouse', 'Suit', 'Alteration', 'Churidar'];

function TailorDiscoveryContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const initialService = searchParams.get('service') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState(initialService);

  const { data: response, isLoading, isError, refetch } = useGetTailorsQuery({
    search: searchTerm,
    service: selectedTag === 'All' ? undefined : selectedTag,
  });

  const tailors: any[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Discover Verified Tailors
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Find skilled craftsmen, compare prices, and order tailored fits with live tracking
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by shop name, tailor name, or locality..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Category:
            </span>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {SERVICE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse"
            >
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-20 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-rose-600 font-semibold mb-2">Unable to load tailors</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && tailors.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No tailors found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We couldn't find any tailor shops matching your search criteria. Try modifying your
            keywords or category filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('All');
            }}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Tailor Cards Grid */}
      {!isLoading && !isError && tailors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tailors.map((tailor: any) => (
            <div
              key={tailor.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Shop Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Verified Tailor
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">
                    {tailor.shopName}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Master Craftsman: <span className="text-slate-700">{tailor.ownerName}</span>
                  </p>
                </div>

                {tailor.bio && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tailor.bio}
                  </p>
                )}

                {/* Details list */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{tailor.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{tailor.workingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{tailor.contactPhone}</span>
                  </div>
                </div>

                {/* Featured Services */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Available Services ({tailor.services?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {tailor.services?.slice(0, 3).map((srv: any) => (
                      <div
                        key={srv.id}
                        className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg"
                      >
                        <span className="font-medium text-slate-700 truncate mr-2">
                          {srv.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold text-blue-700">
                            {formatCurrency(srv.price)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({srv.estimatedDays}d)
                          </span>
                        </div>
                      </div>
                    ))}
                    {tailor.services?.length > 3 && (
                      <p className="text-[11px] text-blue-600 font-medium pt-0.5">
                        +{tailor.services.length - 3} more service(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/tailors/${tailor.id}`}
                  className="flex-1 text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>View Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/customer/orders/new?tailorId=${tailor.id}`}
                  className="py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TailorDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500 text-sm">
          Loading tailors...
        </div>
      }
    >
      <TailorDiscoveryContent />
    </Suspense>
  );
}

