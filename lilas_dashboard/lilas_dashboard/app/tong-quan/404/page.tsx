import Error404 from '@/app/ui/404';
// import { Metadata } from 'next';
 
// export const metadata: Metadata = {
//   title: 'Error',
// };
 
export default function ErrorPage() {
  return (
    <main className="flex items-center justify-center h-full w-full">
      <div className="relative mx-auto flex w-full max-w-[530px]">
        <Error404 />
      </div>
    </main>
  );
}