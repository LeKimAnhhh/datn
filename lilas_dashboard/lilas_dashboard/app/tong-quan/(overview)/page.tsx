import { Suspense } from 'react';
import PageContent from './dashboard';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Tổng quan Lilas Maison - POSX',
};

export default function Page() {
    return (
    <Suspense>
        <PageContent />
    </Suspense>
    );
}