import { Suspense } from 'react';
import PageContent from './cus';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách Khách hàng Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}