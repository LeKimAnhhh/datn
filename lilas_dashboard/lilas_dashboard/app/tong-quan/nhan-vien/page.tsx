import { Suspense } from 'react';
import EmployeePageContent from './employee';
// import { TableRowSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Quản lý nhân viên Lilas Maison - POSX',
};


export default function Page() {
  return (
    // <Suspense fallback={<TableRowSkeleton />}>
    <Suspense fallback={<div>Đang tải dữ liệu...</div>}>
      <EmployeePageContent />
    </Suspense>
  );
}
