"use server";
import Link from "next/link";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { Button } from "../ui/button";
import { FolderOpen, PenBox } from "lucide-react";
import UserMenu from "../userMenu/UserMenu";
import { clerkUserSyncDB } from "@/lib/clerkUserSync";

export default async function Header() {
  await clerkUserSyncDB();

  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center justify-center gap-3 font-semibold text-3xl">
          <Image
            src={"/logo.png"}
            alt="Logify Logo"
            width={200}
            height={60}
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-orange-600 hover:text-orange-700 duration-200 underline">Logify</h1>
        </Link>

        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href={'/dashboard#collections'}>
              <Button variant={"outline"} className="flex items-center gap-2">
                <FolderOpen size={18} />
                <span className="hidden md:inline">Collections</span>
              </Button>
            </Link>
          </SignedIn>

          <Link href={'/journal/write'}>
            <Button variant={"journal"} className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Write New</span>
            </Button>
          </Link>

          <SignedOut>
            <SignInButton>
              <Button variant={"outline"}>Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}