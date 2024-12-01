import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BarLoader from "react-spinners/BarLoader";


export const metadata: Metadata = {
  title: "Logify: Write it, Feel it, Logify it.",
  description: "",
};



export default function entryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`container mx-auto px-4 py-8`} >
      <div>
        <Link href={'/dashboard'} className="text-sm text-orange-600 hover:text-orange-700 cursor-pointer">
          ← Back to Dashboard
        </Link>
      </div>
      <Suspense fallback={<BarLoader color="orange" width={"100%"} />}>
        {children}
      </Suspense>
    </div>
  );
}