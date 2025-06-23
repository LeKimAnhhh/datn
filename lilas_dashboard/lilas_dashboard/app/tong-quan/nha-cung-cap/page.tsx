import { Suspense } from 'react';
import PageContent from './sup';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Danh sách nhà cung cấp Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}