import { Suspense } from 'react';
import PageContent from '@/app/tong-quan/bao-cao/report';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Báo cáo Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}