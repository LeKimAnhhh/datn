import { Suspense } from 'react';
import AccountPageContent from './account';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Tài khoản bán hàng Lilas Maison - POSX',
};

export default function Page() {
  return (
    <Suspense>
      <AccountPageContent />
    </Suspense>
  );
}
