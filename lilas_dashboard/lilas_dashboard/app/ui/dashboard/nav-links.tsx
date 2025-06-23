'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/app/context/SidebarContext';
import Link from 'next/link';
import clsx from 'clsx';
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ListAlt, 
  LocalShippingOutlined,
  AssignmentOutlined, 
  Inventory2Outlined, 
  ManageAccountsOutlined, 
  KeyboardArrowRight, 
  KeyboardArrowDown,
  FaceOutlined,DashboardOutlined,
  StoreMallDirectoryOutlined,
} from "@mui/icons-material";
import { Box, LinearProgress } from "@mui/material";
import { useAuth } from '@/app/auth-context';

const singleLinks = [
  { name: 'Tổng quan', href: '/tong-quan', icon: DashboardOutlined },
  { name: 'Đơn hàng', href: '/tong-quan/don-hang', icon: ListAlt },
  { name: 'POS', href: '/pos', icon: StoreMallDirectoryOutlined },
  { name: 'Vận chuyển', href: '/tong-quan/van-chuyen', icon: LocalShippingOutlined },
  { name: 'Báo cáo', href: '/tong-quan/bao-cao', icon: AssignmentOutlined },
];

const groupedLinks = [
  {
    title: 'Sản phẩm',
    icon: Inventory2Outlined,
    children: [
      { name: 'Danh sách sản phẩm', href: '/tong-quan/san-pham'},
      { name: 'Loại sản phẩm', href: '/tong-quan/loai-san-pham'},
      { name: 'Phiếu nhập', href: '/tong-quan/phieu-nhap'},
      { name: 'Phiếu kiểm', href: '/tong-quan/phieu-kiem'},
      { name: 'Phiếu trả', href: '/tong-quan/phieu-tra'},
      { name: 'Phiếu chuyển', href: '/tong-quan/phieu-chuyen'},
      { name: 'Nhà cung cấp', href: '/tong-quan/nha-cung-cap'},
    ],
  },
  {
    title: 'Khách hàng',
    icon: FaceOutlined,
    children: [
      { name: 'Danh sách khách hàng', href: '/tong-quan/khach-hang'},
      { name: 'Nhóm khách hàng', href: '/tong-quan/nhom-khach-hang'},
    ],
  },
  {
    title: 'Nhân viên',
    icon: ManageAccountsOutlined,
    children: [
      { name: 'Danh sách nhân viên', href: '/tong-quan/nhan-vien'},
      { name: 'Tài khoản bán hàng', href: '/tong-quan/tai-khoan'},
    ],
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { openGroup, toggleGroup } = useSidebar();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  const handleClick = useCallback((href: string) => {
    setLoading(true);
    if (href === '/pos') {
      setLoading(false);
      return;
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const renderSingleLinks = useMemo(() => {
  //   return singleLinks.map((link) => {
  //     const LinkIcon = link.icon;
  //     return (
  //       <Link key={link.name} href={link.href} prefetch={false}
  //         className={clsx('flex h-[48px] grow items-center gap-2 rounded-xl p-3 text-[#F3F1F4A6] text-[15px] hover:bg-white hover:text-[#1E0C23] md:flex-none md:justify-start md:p-3 md:px-4', {
  //           'text-white bg-[#3C3C43B2]': pathname === link.href,
  //         })}
  //         onClick={() => handleClick(link.href)}
  //         target={
  //           link.href === '/pos' ? '_blank' : '_self'
  //         }
  //       >
  //         <LinkIcon className="w-[22px]" />
  //         <p className="hidden md:block">{link.name}</p>
  //       </Link>
  //     );
  //   });
  // }, [pathname, handleClick]);

    return singleLinks
      .filter(link => {
        const role = String(user?.role);
        if (role === '1') return true;
        if (role === '2') return ['Tổng quan', 'Đơn hàng', 'POS', 'Vận chuyển'].includes(link.name);
        if (role === '3') return ['Đơn hàng', 'POS'].includes(link.name);
        if (role === '4') return ['Tổng quan'].includes(link.name);
        return false;
      })
      .map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link key={link.name} href={link.href} prefetch={false}
            className={clsx('flex h-[48px] grow items-center gap-2 rounded-xl p-3 text-[#F3F1F4A6] text-[15px] hover:bg-white hover:text-[#1E0C23] md:flex-none md:justify-start md:p-3 md:px-4', {
              'text-white bg-[#3C3C43B2]': pathname === link.href,
            })}
            onClick={() => handleClick(link.href)}
            target={
              link.href === '/pos' ? '_blank' : '_self'
            }
          >
            <LinkIcon className="w-[22px]" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      });
  }, [pathname, handleClick, user?.role]);

  return (
    <div className="relative">
      {loading && (
        <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
          <LinearProgress />
        </Box>
      )}
      <div>
        {renderSingleLinks}
        {groupedLinks
          .filter(group => {
            const role = String(user?.role);
            if (role === '1') return true;
            if (role === '2') return ['Sản phẩm', 'Khách hàng'].includes(group.title);
            if (role === '4' || role === '0') return ['Sản phẩm'].includes(group.title);
            return false;
          })
          .map((group) => {
            const isOpen = openGroup === group.title;
            const GroupIcon = group.icon;
            const isActive = group.children.some(child => pathname.startsWith(child.href));

            return (
              <div key={group.title}>
                <div 
                  className={clsx(
                    "flex h-[48px] items-center justify-between gap-2 rounded-xl p-3 text-[#F3F1F4A6] text-[15px] hover:bg-white hover:text-[#1E0C23] cursor-pointer md:p-3 md:px-4",
                    { "text-white bg-[#3C3C43B2]": isActive }
                  )}
                  onClick={() => toggleGroup(group.title)}
                >
                  <div className="flex items-center gap-2">
                    {GroupIcon && <GroupIcon className="w-6" />}
                    <p className="hidden md:block">{group.title}</p>
                  </div>
                  {isOpen ? (
                    <KeyboardArrowDown className="w-6" />
                  ) : (
                    <KeyboardArrowRight className="w-6" />
                  )}
                </div>
                {isOpen && (
                  <div className="ml-8">
                    {group.children
                      .filter(link => {
                        const role = String(user?.role);
                        if (role === '1') return true;
                        if (role === '2') return ['Danh sách sản phẩm', 'Loại sản phẩm', 'Nhóm khách hàng', 'Danh sách khách hàng'].includes(link.name);
                        if (role === '4' || role === '0') return ['Danh sách sản phẩm', 'Loại sản phẩm', 'Phiếu nhập', 'Phiếu kiểm', 'Phiếu trả', 'Phiếu chuyển'].includes(link.name);
                        return false;
                      })
                      .map((link) => (
                        <Link key={link.name} href={link.href} prefetch={false}
                          className={clsx('flex h-[48px] items-center gap-2 rounded-xl p-3 text-[#F3F1F4A6] text-[15px] hover:bg-white hover:text-[#1E0C23] md:p-3 md:px-4', {
                            'text-white': pathname === link.href,
                          })}
                          onClick={() => handleClick(link.href)}
                        >
                          <p className='md:text-[15px]'>{link.name}</p>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}