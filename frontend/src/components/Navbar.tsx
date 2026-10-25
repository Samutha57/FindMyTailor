'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { logout } from '@/features/auth/authSlice';
import {
  Scissors,
  User,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Store,
  Compass,
  FileText,
  PlusCircle,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-700">
                FindMyTailor
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-slate-400 font-semibold -mt-1">
                Custom Tailoring
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/tailors"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/tailors')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Tailors</span>
            </Link>

            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <>
                <Link
                  href="/customer/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/customer/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/customer/orders"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/customer/orders')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/customer/orders/new"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/customer/orders/new')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Book Stitching</span>
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'TAILOR' && (
              <>
                <Link
                  href="/tailor/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/tailor/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/tailor/orders"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/tailor/orders')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Manage Orders</span>
                </Link>
                <Link
                  href="/tailor/services"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/tailor/services')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  <span>Services</span>
                </Link>
                <Link
                  href="/tailor/profile"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/tailor/profile')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Shop Profile</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium capitalize">
                    {user.role.toLowerCase()}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/tailors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore Tailors
          </Link>

          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <>
              <Link
                href="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                href="/customer/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Orders
              </Link>
              <Link
                href="/customer/orders/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Book Stitching
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'TAILOR' && (
            <>
              <Link
                href="/tailor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                href="/tailor/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Manage Orders
              </Link>
              <Link
                href="/tailor/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Stitching Services
              </Link>
              <Link
                href="/tailor/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Shop Profile
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-medium hover:bg-rose-50 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
