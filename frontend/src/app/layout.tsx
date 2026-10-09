import type { Metadata } from "next";
import Providers from '@/providers/ThemeProviderProvider';
import Navbar from '@/components/Navbar';
import ToastContainer from '@/components/ui/ToastContainer';
import './globals.css';

export const metadata: Metadata = {
  title: "22 Yards | Premium Indoor Cricket Booking",
  description: "Book the best indoor cricket courts in your city with a seamless experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-pitch-cream dark:bg-stadium-dark transition-colors duration-300 min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <ToastContainer />
          <main className="flex-grow">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
