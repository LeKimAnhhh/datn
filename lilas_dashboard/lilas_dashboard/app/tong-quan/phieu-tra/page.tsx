import { Suspense } from 'react';
import PageContent from './return';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách phiếu trả Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}