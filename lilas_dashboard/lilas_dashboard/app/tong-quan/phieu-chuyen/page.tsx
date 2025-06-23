import { Suspense } from 'react';
import PageContent from './transfer';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách phiếu chuyển Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}