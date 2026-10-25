'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/lib/store';
import { initializeAuth } from '@/features/auth/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
