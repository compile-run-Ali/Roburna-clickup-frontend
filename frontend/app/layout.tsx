'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { AuthProvider } from "./AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Pages where sidebar and navbar should be hidden
  const hideNavigationPages = ['/', '/sign-up', '/login'];
  const shouldHideNavigation = hideNavigationPages.includes(pathname) || pathname.startsWith('/login-via-email');

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full roburna-bg-primary roburna-text-primary`}
      >
        <AuthProvider>
          {shouldHideNavigation ? (
            // Layout without sidebar and navbar for landing and signup pages
            <main className="h-full">
              {children}
            </main>
          ) : (
            // Layout with sidebar and navbar for all other pages
            <div className="flex flex-row w-full h-full">
              <Sidebar />
              <div className="flex flex-col flex-1">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
