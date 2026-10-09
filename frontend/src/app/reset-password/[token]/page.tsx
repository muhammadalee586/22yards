"use client";

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function TokenRedirectHandler() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = params?.token as string;
    const uid = searchParams.get('uid') || '';
    if (token) {
      router.replace(`/reset-password/confirm?token=${encodeURIComponent(token)}${uid ? `&uid=${encodeURIComponent(uid)}` : ''}`);
    } else {
      router.replace('/reset-password');
    }
  }, [params, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-field-green" size={32} />
        <p className="text-sm font-medium text-gray-500">Redirecting to password reset...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordTokenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark" />}>
      <TokenRedirectHandler />
    </Suspense>
  );
}
