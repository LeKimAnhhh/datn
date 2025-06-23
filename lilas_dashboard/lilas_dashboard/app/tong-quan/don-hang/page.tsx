import { Suspense } from 'react';
import PageContent from './invoices';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách đơn hàng Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}