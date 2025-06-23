import SideNav from '@/app/ui/dashboard/sidenav';
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Bảng điều khiển',
};

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:min-w-[200px] md:max-w-[250px]">
        <SideNav />
      </div>
      <div className="relative flex-grow p-6 max-lg-padding pt-7 md:overflow-y-auto bg-[#F3F3F7]">{children}</div>
    </div>
  );
}