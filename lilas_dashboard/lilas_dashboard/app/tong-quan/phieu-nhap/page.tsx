import { Suspense } from 'react';
import PageContent from './purchase';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách loại phiếu nhập Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}