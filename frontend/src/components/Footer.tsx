import React from 'react';
import Link from 'next/link';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">FindMyTailor</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Discover trusted bespoke tailors in your neighborhood. Book custom stitching for
              shirts, pants, blouses, suits, and alterations with live stage tracking.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tailors" className="hover:text-white transition-colors">
                  Find Tailors
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Join as Tailor
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Core Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>Shirt & Trouser Stitching</li>
              <li>Designer Blouse Tailoring</li>
              <li>Churidar & Salwar Suits</li>
              <li>Garment Alterations & Fitting</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FindMyTailor. Built for custom tailoring excellence.</p>
          <p>Powered by Next.js, Express, PostgreSQL & Prisma</p>
        </div>
      </div>
    </footer>
  );
}
