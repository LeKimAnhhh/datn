import LoginForm from '@/app/ui/login-form';
import { Metadata } from 'next';
 
// export const metadata: Metadata = {
//   title: 'POSX',
// };
 
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen bg-[#F2F2F7]">
      <div className="relative mx-auto flex w-full max-w-[780px] flex-col space-y-2.5 md:-mt-32">
        {/* <div className="flex h-20 w-full items-end rounded-lg bg-[#338BFF] p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <h1 className='text-2xl'>Lilas logo...</h1>
          </div>
        </div> */}
        <LoginForm />
      </div>
    </main>
  );
}