import { Suspense } from 'react';
import PageContent from './pro-group';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách loại sản phẩm Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}