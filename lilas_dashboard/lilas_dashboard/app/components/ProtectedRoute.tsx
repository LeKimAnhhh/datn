'use client';

import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/dang-nhap');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
