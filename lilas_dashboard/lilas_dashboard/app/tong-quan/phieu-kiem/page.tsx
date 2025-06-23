import { Suspense } from 'react';
import PageContent from './inspection';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách phiếu kiểm Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}