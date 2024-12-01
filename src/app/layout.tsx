import type { Metadata } from "next";
import { Just_Me_Again_Down_Here, Onest } from 'next/font/google'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import "./globals.css";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Logify: Write it, Feel it, Logify it.",
  description: "Logify: Simplify your life with the ultimate journal app. Capture moments, track progress, and stay organized effortlessly. Your story, beautifully logged.",

  icons: {
    icon: '/logo.png',
  },
};


export const handwritting_font = Just_Me_Again_Down_Here({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const onest = Onest({
  subsets: ['latin'],
  weight: "variable",
  display: 'swap',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${onest.className} antialiased relative`}
        >
          <div className="
              bg-paperTexture
              min-h-screen 
              mix-blend-multiply 
              pointer-events-none 
              bg-repeat
              absolute 
              inset-0
              -z-30"
          ></div>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}