import '@/app/ui/global.css';
import { Metadata } from 'next';
import { AuthProvider } from '@/app/auth-context';
import HideNextIndicator from '@/app/ui/HideNextIndicator';
// import ViewportFix from "@/app/ui/ViewportFix";
 
export const metadata: Metadata = {
  title: {
    template: '%s | Lilas Dashboard',
    default: 'POSX',
  },
  // description: 'Lilas Dashboard',
  metadataBase: new URL('https://posx.mediax.com.vn'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
      {/* <ViewportFix />  */}
        <AuthProvider>
          {children}
        </AuthProvider>
        <HideNextIndicator />
      </body>
    </html>
  );
}
