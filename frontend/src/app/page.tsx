'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  Search,
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Ruler,
} from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/tailors?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/tailors');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-white pt-20 pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Tailoring & Real-Time Tracking</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Connect with Master Tailors. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Track Every Stitch in Real Time.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified neighborhood tailors, compare service prices, customize garments,
            and monitor live progress from cutting to delivery.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200"
          >
            <div className="flex items-center gap-3 px-4 py-2 w-full text-slate-500">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tailor name, shop, or service (e.g. Blouse, Shirt, Suit)..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/25 shrink-0"
            >
              Find Tailors
            </button>
          </form>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Popular:</span>
            {['Shirt Stitching', 'Designer Blouse', 'Trouser Fitting', 'Churidar Suits', 'Alterations'].map(
              (item) => (
                <Link
                  key={item}
                  href={`/tailors?service=${encodeURIComponent(item)}`}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 transition-colors"
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* 9-Stage Visual Workflow Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            End-To-End Transparency
          </h2>
          <h3 className="text-3xl font-bold text-slate-900">
            Live 9-Stage Stitching Workflow
          </h3>
          <p className="text-slate-600 mt-3 text-base">
            No more endless calls asking "Is my outfit ready?". Track each milestone right from
            your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Order Placed', desc: 'Requirements submitted', icon: Clock },
            { step: '02', title: 'Accepted', desc: 'Tailor confirms slot', icon: CheckCircle },
            { step: '03', title: 'Measurement', desc: 'Custom sizing draft', icon: Ruler },
            { step: '04', title: 'Fabric Cutting', desc: 'Pattern tailored', icon: Scissors },
            { step: '05', title: 'Stitching', desc: 'Precision assembly', icon: Layers },
            { step: '06', title: 'Finishing', desc: 'Lining, hooks & buttons', icon: Sparkles },
            { step: '07', title: 'Quality Check', desc: 'Double seam inspection', icon: ShieldCheck },
            { step: '08', title: 'Ready for Pickup', desc: 'Packaged & waiting', icon: CheckCircle },
            { step: '09', title: 'Completed', desc: 'Delivered to you', icon: ArrowRight },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {item.step}
                  </span>
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-700">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Customers */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                For Customers
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Bespoke Tailoring Made Effortless
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Explore nearby shops, browse rates for formal suits, casual trousers, festive
                lehengas and alterations. Submit custom notes and watch your garment take shape.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Discover verified tailors with transparent rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Custom instructions and requested completion dates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Live 9-stage tracking timeline for all orders</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/customer/orders/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md"
              >
                <span>Book Stitching</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* For Tailors */}
          <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                For Tailors & Boutiques
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Grow Your Business & Streamline Orders
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Showcase your shop profile, manage stitching menus with prices, review incoming
                orders, and update progress in one unified workbench.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-300" />
                  <span>Manage shop hours, contact details, and portfolio</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-300" />
                  <span>Accept or reject incoming orders with notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-300" />
                  <span>One-click progress updates for accepted orders</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register?role=TAILOR"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-indigo-950 font-semibold text-sm rounded-xl transition-all shadow-md"
              >
                <span>Register Your Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-16 text-white shadow-xl shadow-blue-500/10">
          <h3 className="text-3xl sm:text-4xl font-extrabold">Ready for the Perfect Fit?</h3>
          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl mx-auto">
            Discover professional local tailors or expand your tailoring clientele today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/tailors"
              className="px-8 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl shadow transition-all"
            >
              Browse Tailors
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl border border-blue-500/50 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
