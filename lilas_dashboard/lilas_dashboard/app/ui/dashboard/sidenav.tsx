// 'use client';

// import Link from 'next/link';
// import NavLinks from '@/app/ui/dashboard/nav-links';
// import { PowerIcon } from '@heroicons/react/24/outline';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/app/auth-context'; 
// import Image from "next/image";
// import { signOutUser } from '@/app/lib/data'; 
// import {
//   ExitToAppOutlined,
// } from "@mui/icons-material";

// export default function SideNav() {
//   const { logout } = useAuth();
//   const router = useRouter();

//   const handleSignOut = async () => {
//     try {
//       await signOutUser();
//     } catch (error) {
//       console.error('Error during sign out:', error);
//     }
//     logout();
//     router.push('/');
//   };

//   return (
//     <div className="flex h-full flex-col bg-[#100713]">
//       <Link
//         className="mb-2 flex items-start justify-start rounded-md p-6"
//         href="/"
//       >
//         <Image
//           src="/lilas-logo.svg" 
//           alt="Lilas Logo"
//           width={176}
//           height={32}
//         />
//       </Link>
//       <div className="bg-[#14181F] h-[824px] -mx-3 p-6 flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-4">
//         <NavLinks />
//       </div>
//       {/* <div className="hidden h-auto w-full grow rounded-md md:block"></div> */}
//       <div className="h-auto px-6 pt-4 pb-10">
//         <Image
//           src="/lilas_maison.svg" 
//           alt="Lilas Logo"
//           width={144}
//           height={32}
//         />
//         <button
//           onClick={handleSignOut}
//           className="flex h-[40px] -mx-4 mt-3 w-full px-3 py-[10px] grow items-center justify-center gap-2 rounded-xl text-[#F3F1F4A6] text-[17px] font-semibold hover:bg-white hover:text-[#100713] md:flex-none md:justify-start md:p-2 md:px-4"
//         >
//           <ExitToAppOutlined className="w-5 mr-[10.5px]" />
//           <div className="hidden md:block">Đăng xuất</div>
//         </button>
//         <span className="text-[12px] text-[#F2EBF599] font-normal">Phiên bản 0.1.0</span>
//       </div>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import Image from "next/image";
import { signOutUser } from '@/app/lib/data';
import { SidebarProvider } from '@/app/context/SidebarContext';
import NavLinks from '@/app/ui/dashboard/nav-links';
import {
  AccountCircleOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";
import { Button, Popover } from '@mui/material';
import { useState } from 'react';

export default function SideNav() {
  const { logout, user } = useAuth();
  const router = useRouter();
  // console.log('user', user);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-popover' : undefined;

  return (
    <SidebarProvider>
      {/* <div className="flex h-full flex-col px-3 py-6 md:px-2 bg-[#100713]">
        <Link className="mb-2 md:mb-10 flex items-start justify-start rounded-md p-6" href="/">
          <Image src="/lilas-logo.svg" alt="Lilas Logo" width={176} height={32} />
        </Link>
        <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-4">
          <NavLinks />
          <button
            onClick={handleSignOut}
            className="flex h-[40px] w-full grow items-center justify-center gap-2 rounded-xl p-3 text-[#F3F1F4A6] text-[17px] font-semibold hover:bg-white hover:text-[#100713] md:flex-none md:justify-start md:p-2 md:px-4"
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </div>
      </div> */}
      <div className="flex h-full flex-col bg-[#100713]">
        <div className="h-[88px] py-6 px-3">
          <Link
            className="flex items-start justify-start rounded-md"
            href="/tong-quan"
          >
            <Image
              src="/lilas-logo.svg"
              alt="Lilas Logo"
              width={127}
              height={40}
              className="ml-1"
            />
          </Link>
        </div>
        <div className="bg-[#14181F] -mx-3 p-6 flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-4 md:overflow-y-auto md:scrollbar-hide">
          <NavLinks />
        </div>

        {/* <div className="hidden h-auto w-full grow rounded-md md:block"></div> */}
        <div className="h-auto px-3 pt-4 pb-10 flex flex-col gap-1">
          <Image
            src="/lilas_maison.svg"
            alt="Lilas Logo"
            width={144}
            height={32}
          />
          <Button
            aria-describedby={id}
            className="!justify-start !text-white !px-1 hover:bg-white hover:!text-[#100713]"
            onClick={handleClick}
            startIcon={<AccountCircleOutlined />}
            disableRipple
            style={{
              textTransform: "none",
            }}
            size="large"
          >
            {user?.username}
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            slotProps={{
              paper:{
                className: "!bg-black !w-[220px]"
              }
            }}
          >
            <button
              onClick={handleSignOut}
              className="flex w-full px-3 py-[10px] grow items-center justify-center gap-2 text-[17px] text-white hover:bg-white group md:flex-none md:justify-start md:p-2 md:px-4"
            >
              <ExitToAppOutlined className="w-5 mr-[10.5px] text-white group-hover:text-[#100713]" />
              <div className="hidden md:block">
                <span className="text-white group-hover:text-[#100713] text-[15px]">
                  Đăng xuất
                </span>
              </div>
            </button>
          </Popover>
          {/* <button
            onClick={handleSignOut}
            className="flex mt-3 w-full px-3 py-[10px] grow items-center justify-center gap-2 rounded-xl text-[17px] bg-transparent text-white hover:bg-white group md:flex-none md:justify-start md:p-2 md:px-4"
          >
            <ExitToAppOutlined className="w-5 mr-[10.5px] text-white group-hover:text-[#100713]" />
            <div className="hidden md:block">
              <span className="text-white group-hover:text-[#100713] text-[15px]">Đăng xuất</span>
            </div>
          </button> */}

          <span className="text-[12px] text-[#F2EBF599] font-normal">
            Phiên bản 0.1.2
          </span>
        </div>
      </div>
    </SidebarProvider>
  );
}