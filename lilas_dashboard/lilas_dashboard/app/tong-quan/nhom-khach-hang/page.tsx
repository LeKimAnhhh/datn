import { Suspense } from 'react';
import PageContent from './cus-group';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Nhóm khách hàng Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}