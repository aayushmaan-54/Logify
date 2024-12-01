"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function NotFound() {
  
  const router = useRouter();

  const handleReset = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <h1 className="text-6xl font-bold gradient-title">404</h1>
      <h3 className="text-2xl font-semibold text-orange-700 mb-4">Page Not Found!</h3>

      <p className="mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex space-x-4">
        <Link href="/">
          <Button variant={"journal"}>Return Home</Button>
        </Link>

        <Button onClick={() => handleReset()} variant={"outline"} className="px-8 border-orange-600 text-orange-600 hover:bg-orange-100 hover:text-orange-600">Try Again</Button>
      </div>
    </div>
  );
}