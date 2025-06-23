// import { ArrowRightIcon } from '@heroicons/react/24/outline';
// import Link from 'next/link';
// import Image from 'next/image';
// import '@/app/ui/global.css';

// export default function Page() {
//   return (
//     <main className="flex min-h-screen flex-col p-6">
//       {/* <div className={styles.shape} /> */}
//       <div className="flex h-20 shrink-0 items-end rounded-lg bg-[#338BFF] p-4 md:h-52">
//         <h1 className='text-white text-2xl'>Lilas logo...</h1>
//       </div>
//       <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
//         <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
//           <p className="font-sans text-xl text-gray-800 md:text-3xl md:leading-normal">
//             <strong>Welcome to Lilas Store.</strong> This is the {' '}
//             <a href="https://lilas.vn/" className="text-[#338BFF]">
//               Lilas website
//             </a>
//           </p>
//           <Link
//             href="/login"
//             className="flex items-center gap-5 self-start rounded-lg bg-[#338BFF] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] md:text-base"
//           >
//             <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
//           </Link>
//         </div>
//         <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
//           <Image
//             src="/lilas-logo.svg"
//             width={1000}
//             height={760}
//             className="hidden md:block"
//             alt="lilas desktop version"
//           />
//           <Image
//             src="/lilas-logo.svg"
//             width={560}
//             height={620}
//             className="block md:hidden"
//             alt="lilas mobile version"
//           />
//         </div>
//       </div>
//     </main>
//   );
// }


import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dang-nhap');
}
