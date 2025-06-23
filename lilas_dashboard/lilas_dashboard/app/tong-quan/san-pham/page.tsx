import { Suspense } from 'react';
import PageContent from './product';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách sản phẩm Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}